import os
import sys
import json
import sqlite3
from datetime import datetime
from dotenv import load_dotenv

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

def parse_dt(val):
    if not val:
        return None
    if isinstance(val, datetime):
        return val
    try:
        return datetime.fromisoformat(str(val).strip())
    except Exception:
        # Try alternate formats
        for fmt in ("%Y-%m-%d %H:%M:%S.%f", "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%dT%H:%M:%S"):
            try:
                return datetime.strptime(str(val).strip(), fmt)
            except ValueError:
                pass
        return None

def parse_json(val, default=None):
    if val is None:
        return default
    if isinstance(val, (list, dict)):
        return val
    if isinstance(val, str):
        try:
            return json.loads(val)
        except Exception:
            return default
    return default

def main():
    print("=" * 65)
    print("  Know Your Animal - SQLite to PostgreSQL Data Migrator")
    print("=" * 65)

    raw_uri = os.environ.get("DATABASE_URL", "").strip().strip('"').strip("'")
    
    if raw_uri.startswith("postgres://"):
        raw_uri = raw_uri.replace("postgres://", "postgresql://", 1)

    if not raw_uri or raw_uri.startswith("sqlite"):
        print("\n❌ Migration stopped: DATABASE_URL is not configured for PostgreSQL!")
        print("👉 Please edit your .env file and set DATABASE_URL to your PostgreSQL connection string:")
        print("   DATABASE_URL=postgresql://username:password@hostname:5432/dbname?sslmode=require\n")
        sys.exit(1)

    sqlite_path = os.path.join(os.path.dirname(__file__), "instance", "app.db")
    if not os.path.exists(sqlite_path):
        print(f"\n❌ SQLite source database not found at: {sqlite_path}")
        sys.exit(1)

    # Mask password for display
    if '@' in raw_uri:
        prefix = raw_uri.split('://')[0]
        host_part = raw_uri.split('@')[-1]
        masked_uri = f"{prefix}://*****@{host_part}"
    else:
        masked_uri = raw_uri

    print(f"\n📂 Source Database      : {sqlite_path}")
    print(f"🐘 Destination Database : {masked_uri}")

    # Import app and models after env is confirmed
    from app import app, db, User, UserProfile, DoctorProfile, PatientRecord, Animal, Disease, PetDocument, Appointment, sync_postgres_sequences
    from sqlalchemy import text

    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cur = sqlite_conn.cursor()

    with app.app_context():
        print("\n⏳ Ensuring destination PostgreSQL tables exist...")
        db.create_all()
        print("✅ Schema created / verified in PostgreSQL.")

        # -------------------------------------------------------------
        # 1. Migrate Users
        # -------------------------------------------------------------
        print("\n⏳ Migrating 'User' records...")
        user_rows = sqlite_cur.execute("SELECT * FROM user").fetchall()
        migrated_users = 0
        for r in user_rows:
            existing = User.query.filter_by(id=r['id']).first()
            if not existing:
                existing_email = User.query.filter_by(email=r['email']).first()
                if existing_email:
                    print(f"   Skipping user ID {r['id']} (Email '{r['email']}' already exists)")
                    continue

                u = User(
                    id=r['id'],
                    username=r['username'],
                    email=r['email'],
                    password=r['password'],
                    role=r['role'] if 'role' in r.keys() else 'user',
                    phone_number=r['phone_number'] if 'phone_number' in r.keys() else None,
                    otp=r['otp'] if 'otp' in r.keys() else None,
                    otp_expiry=parse_dt(r['otp_expiry'] if 'otp_expiry' in r.keys() else None),
                    reset_token=r['reset_token'] if 'reset_token' in r.keys() else None,
                    reset_token_expiry=parse_dt(r['reset_token_expiry'] if 'reset_token_expiry' in r.keys() else None),
                    subscription_plan=r['subscription_plan'] if 'subscription_plan' in r.keys() else 'free',
                    subscription_status=r['subscription_status'] if 'subscription_status' in r.keys() else 'inactive',
                    subscription_expiry=parse_dt(r['subscription_expiry'] if 'subscription_expiry' in r.keys() else None),
                    subscription_order_id=r['subscription_order_id'] if 'subscription_order_id' in r.keys() else None,
                    subscription_payment_id=r['subscription_payment_id'] if 'subscription_payment_id' in r.keys() else None,
                    created_at=parse_dt(r['created_at'] if 'created_at' in r.keys() else None) or datetime.utcnow()
                )
                db.session.add(u)
                migrated_users += 1
        db.session.commit()
        print(f"✅ User migration complete: {migrated_users} added ({len(user_rows)} total in SQLite)")

        # -------------------------------------------------------------
        # 2. Migrate User Profiles
        # -------------------------------------------------------------
        print("\n⏳ Migrating 'UserProfile' records...")
        profile_rows = sqlite_cur.execute("SELECT * FROM user_profile").fetchall()
        migrated_profiles = 0
        for r in profile_rows:
            existing = UserProfile.query.filter_by(id=r['id']).first()
            if not existing:
                up = UserProfile(
                    id=r['id'],
                    user_id=r['user_id'],
                    name=r['name'],
                    phone_number=r['phone_number'] if 'phone_number' in r.keys() else None,
                    location=r['location'] if 'location' in r.keys() else None,
                    pets=parse_json(r['pets'], default=[])
                )
                db.session.add(up)
                migrated_profiles += 1
        db.session.commit()
        print(f"✅ UserProfile migration complete: {migrated_profiles} added ({len(profile_rows)} total in SQLite)")

        # -------------------------------------------------------------
        # 3. Migrate Doctor Profiles
        # -------------------------------------------------------------
        print("\n⏳ Migrating 'DoctorProfile' records...")
        doc_rows = sqlite_cur.execute("SELECT * FROM doctor_profile").fetchall()
        migrated_docs = 0
        for r in doc_rows:
            existing = DoctorProfile.query.filter_by(id=r['id']).first()
            if not existing:
                dp = DoctorProfile(
                    id=r['id'],
                    user_id=r['user_id'],
                    doctor_name=r['doctor_name'],
                    email=r['email'],
                    clinic_name=r['clinic_name'] if 'clinic_name' in r.keys() else None,
                    qualification=r['qualification'] if 'qualification' in r.keys() else None,
                    specialization=r['specialization'] if 'specialization' in r.keys() else None,
                    contact_number=r['contact_number'] if 'contact_number' in r.keys() else None,
                    location=r['location'] if 'location' in r.keys() else None,
                    years_of_experience=r['years_of_experience'] if 'years_of_experience' in r.keys() else 0,
                    availability_status=r['availability_status'] if 'availability_status' in r.keys() else 'Offline',
                    rating=r['rating'] if 'rating' in r.keys() else 0.0,
                    profile_photo=r['profile_photo'] if 'profile_photo' in r.keys() else None,
                    verified=bool(r['verified']) if 'verified' in r.keys() else False,
                    is_platform_suggested=bool(r['is_platform_suggested']) if 'is_platform_suggested' in r.keys() else False
                )
                db.session.add(dp)
                migrated_docs += 1
        db.session.commit()
        print(f"✅ DoctorProfile migration complete: {migrated_docs} added ({len(doc_rows)} total in SQLite)")

        # -------------------------------------------------------------
        # 4. Migrate Animals
        # -------------------------------------------------------------
        print("\n⏳ Migrating 'Animal' records...")
        animal_rows = sqlite_cur.execute("SELECT * FROM animal").fetchall()
        migrated_animals = 0
        for r in animal_rows:
            existing = Animal.query.filter_by(id=r['id']).first()
            if not existing:
                existing_slug = Animal.query.filter_by(slug=r['slug']).first()
                if existing_slug:
                    print(f"   Skipping animal ID {r['id']} (Slug '{r['slug']}' already exists)")
                    continue
                a = Animal(
                    id=r['id'],
                    slug=r['slug'],
                    name=r['name'],
                    name_hi=r['name_hi'] if 'name_hi' in r.keys() else None,
                    image=r['image'] if 'image' in r.keys() else None,
                    description=r['description'] if 'description' in r.keys() else None
                )
                db.session.add(a)
                migrated_animals += 1
        db.session.commit()
        print(f"✅ Animal migration complete: {migrated_animals} added ({len(animal_rows)} total in SQLite)")

        # -------------------------------------------------------------
        # 5. Migrate Diseases
        # -------------------------------------------------------------
        print("\n⏳ Migrating 'Disease' records...")
        disease_rows = sqlite_cur.execute("SELECT * FROM disease").fetchall()
        migrated_diseases = 0
        for r in disease_rows:
            existing = Disease.query.filter_by(id=r['id']).first()
            if not existing:
                d = Disease(
                    id=r['id'],
                    animal_id=r['animal_id'],
                    name=r['name'],
                    name_hi=r['name_hi'] if 'name_hi' in r.keys() else None,
                    symptoms=parse_json(r['symptoms'], default=[]),
                    causes=r['causes'] if 'causes' in r.keys() else None,
                    treatment=r['treatment'] if 'treatment' in r.keys() else None,
                    prevention=parse_json(r['prevention'], default=[])
                )
                db.session.add(d)
                migrated_diseases += 1
        db.session.commit()
        print(f"✅ Disease migration complete: {migrated_diseases} added ({len(disease_rows)} total in SQLite)")

        # -------------------------------------------------------------
        # 6. Migrate Patient Records
        # -------------------------------------------------------------
        print("\n⏳ Migrating 'PatientRecord' records...")
        patient_rows = sqlite_cur.execute("SELECT * FROM patient_record").fetchall()
        migrated_patients = 0
        for r in patient_rows:
            existing = PatientRecord.query.filter_by(id=r['id']).first()
            if not existing:
                pr = PatientRecord(
                    id=r['id'],
                    user_id=r['user_id'],
                    doctor_id=r['doctor_id'],
                    pet_name=r['pet_name'] if 'pet_name' in r.keys() else None,
                    date=parse_dt(r['date']) or datetime.utcnow(),
                    treatment_notes=r['treatment_notes'] if 'treatment_notes' in r.keys() else None
                )
                db.session.add(pr)
                migrated_patients += 1
        db.session.commit()
        print(f"✅ PatientRecord migration complete: {migrated_patients} added ({len(patient_rows)} total in SQLite)")

        # -------------------------------------------------------------
        # 7. Migrate Pet Documents
        # -------------------------------------------------------------
        print("\n⏳ Migrating 'PetDocument' records...")
        doc_file_rows = sqlite_cur.execute("SELECT * FROM pet_document").fetchall()
        migrated_pet_docs = 0
        for r in doc_file_rows:
            existing = PetDocument.query.filter_by(id=r['id']).first()
            if not existing:
                pdoc = PetDocument(
                    id=r['id'],
                    user_id=r['user_id'],
                    pet_name=r['pet_name'] if 'pet_name' in r.keys() else None,
                    doc_name=r['doc_name'],
                    doc_type=r['doc_type'] if 'doc_type' in r.keys() else None,
                    notes=r['notes'] if 'notes' in r.keys() else None,
                    uploaded_at=parse_dt(r['uploaded_at']) or datetime.utcnow(),
                    uploaded_by=r['uploaded_by'] if 'uploaded_by' in r.keys() else 'user'
                )
                db.session.add(pdoc)
                migrated_pet_docs += 1
        db.session.commit()
        print(f"✅ PetDocument migration complete: {migrated_pet_docs} added ({len(doc_file_rows)} total in SQLite)")

        # -------------------------------------------------------------
        # 8. Migrate Appointments
        # -------------------------------------------------------------
        print("\n⏳ Migrating 'Appointment' records...")
        appt_rows = sqlite_cur.execute("SELECT * FROM appointment").fetchall()
        migrated_appts = 0
        for r in appt_rows:
            # PostgreSQL requires foreign key user_id to exist in 'user'
            if not User.query.filter_by(id=r['user_id']).first():
                from werkzeug.security import generate_password_hash
                placeholder_u = User(
                    id=r['user_id'],
                    username=f"Archived User {r['user_id']}",
                    email=f"archived_user_{r['user_id']}@placeholder.local",
                    password=generate_password_hash("archived123"),
                    role="user"
                )
                db.session.add(placeholder_u)
                db.session.commit()
                print(f"   Created placeholder user for orphaned appointment user_id {r['user_id']}")

            existing = Appointment.query.filter_by(id=r['id']).first()
            if not existing:
                apt = Appointment(
                    id=r['id'],
                    user_id=r['user_id'],
                    doctor_id=r['doctor_id'],
                    pet_name=r['pet_name'] if 'pet_name' in r.keys() else None,
                    reason=r['reason'] if 'reason' in r.keys() else None,
                    preferred_date=r['preferred_date'] if 'preferred_date' in r.keys() else None,
                    preferred_time=r['preferred_time'] if 'preferred_time' in r.keys() else None,
                    status=r['status'] if 'status' in r.keys() else 'pending',
                    doctor_notes=r['doctor_notes'] if 'doctor_notes' in r.keys() else None,
                    created_at=parse_dt(r['created_at']) or datetime.utcnow()
                )
                db.session.add(apt)
                migrated_appts += 1
        db.session.commit()
        print(f"✅ Appointment migration complete: {migrated_appts} added ({len(appt_rows)} total in SQLite)")

        # -------------------------------------------------------------
        # 9. Synchronize PostgreSQL Sequences
        # -------------------------------------------------------------
        print("\n⏳ Synchronizing PostgreSQL auto-increment sequences...")
        sync_postgres_sequences()
        print("✅ Sequences synchronized. Future inserts will auto-increment safely.")

        # -------------------------------------------------------------
        # 10. Verification Report
        # -------------------------------------------------------------
        print("\n" + "=" * 65)
        print("  MIGRATION SUMMARY")
        print("=" * 65)
        print(f"  {'Table':<25} | {'SQLite Rows':<15} | {'PostgreSQL Total'}")
        print("  " + "-" * 60)
        tables = [
            ("user", len(user_rows), User.query.count()),
            ("user_profile", len(profile_rows), UserProfile.query.count()),
            ("doctor_profile", len(doc_rows), DoctorProfile.query.count()),
            ("animal", len(animal_rows), Animal.query.count()),
            ("disease", len(disease_rows), Disease.query.count()),
            ("patient_record", len(patient_rows), PatientRecord.query.count()),
            ("pet_document", len(doc_file_rows), PetDocument.query.count()),
            ("appointment", len(appt_rows), Appointment.query.count()),
        ]
        for tbl, sql_count, pg_count in tables:
            print(f"  {tbl:<25} | {sql_count:<15} | {pg_count}")
        print("=" * 65)
        print("🎉 Migration completed successfully!")

if __name__ == "__main__":
    main()

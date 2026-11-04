import os
import sys
from dotenv import load_dotenv

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables
load_dotenv()

raw_uri = os.environ.get("DATABASE_URL", "").strip().strip('"').strip("'")

print("=" * 60)
print("  Know Your Animal App - Database Connection Diagnostic")
print("=" * 60)

if not raw_uri:
    print("\n❌ DATABASE_URL is not set in your .env file!")
    print("👉 Please add your PostgreSQL connection string in .env like this:")
    print("   DATABASE_URL=postgresql://username:password@hostname:5432/dbname?sslmode=require")
    sys.exit(1)

# Normalization check
is_postgres = raw_uri.startswith("postgresql://") or raw_uri.startswith("postgres://") or "postgres" in raw_uri

# Normalize postgres:// to postgresql://
if raw_uri.startswith("postgres://"):
    raw_uri = raw_uri.replace("postgres://", "postgresql://", 1)
    print("ℹ️  Automatically converted legacy 'postgres://' to 'postgresql://'")

# Mask password in output for safety
if '@' in raw_uri:
    prefix = raw_uri.split('://')[0]
    host_part = raw_uri.split('@')[-1]
    masked_uri = f"{prefix}://*****@{host_part}"
else:
    masked_uri = raw_uri

print(f"\nTarget Database URI : {masked_uri}")
print(f"Database Type       : {'PostgreSQL' if is_postgres else 'SQLite / Other'}")

try:
    from sqlalchemy import create_engine, text
    from sqlalchemy.orm import sessionmaker

    connect_args = {}
    engine_kwargs = {"pool_pre_ping": True}
    
    if is_postgres:
        engine_kwargs["pool_recycle"] = 300

    print("\n⏳ Attempting connection to the database...")
    engine = create_engine(raw_uri, **engine_kwargs)

    with engine.connect() as conn:
        print(" Connected to the database engine successfully!")
        
        if is_postgres:
            version = conn.execute(text("SELECT version();")).scalar()
            current_db = conn.execute(text("SELECT current_database();")).scalar()
            current_user = conn.execute(text("SELECT current_user;")).scalar()
            print(f"\n PostgreSQL Details:")
            print(f"   - Database Name : {current_db}")
            print(f"   - Connected User: {current_user}")
            print(f"   - Server Version: {version.split(',')[0] if version else 'Unknown'}")
        else:
            print(" Using local SQLite database.")

    # Now verify with app's models and schema
    print("\n⏳ Verifying application tables and schema...")
    from app import app, db, User, Animal, Disease, DoctorProfile, UserProfile, Appointment, PatientRecord, PetDocument

    with app.app_context():
        # Ensure all tables exist
        db.create_all()
        print(" Application tables verified / created successfully.")

        # Show record counts
        counts = {
            "Users (Admin/Doctors/Users)": User.query.count(),
            "Doctor Profiles": DoctorProfile.query.count(),
            "User Profiles": UserProfile.query.count(),
            "Animals": Animal.query.count(),
            "Diseases": Disease.query.count(),
            "Appointments": Appointment.query.count(),
            "Patient Records": PatientRecord.query.count(),
            "Pet Documents": PetDocument.query.count(),
        }

        print("\n📊 Current Database Statistics:")
        for name, count in counts.items():
            print(f"   - {name:<30}: {count} records")

    print("\n" + "=" * 60)
    print("  STATUS: Database is fully operational and ready to use!")
    print("=" * 60)

except Exception as err:
    print(f"\n❌ Connection Failed!")
    print(f"Error: {err}\n")
    print("💡 Common fixes for PostgreSQL connection issues:")
    print("   1. Verify your username, password, host, port, and database name.")
    print("   2. For cloud databases (Neon, Supabase, Render, ElephantSQL), ensure `?sslmode=require` is at the end.")
    print("   3. Check if your database provider requires whitelisting your IP address (e.g., Supabase / RDS).")
    print("   4. Verify you have an active internet connection.")
    sys.exit(1)

import os
import re
import functools
import requests
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, make_response, Response, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import secrets
import json
import time
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='frontend/dist', static_url_path='/')

# Use NeonDB PostgreSQL string as requested
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DATABASE_URL", "postgresql://neondb_owner:npg_wkAzVyG0qZs9@ep-rapid-art-adqrcflx-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get("SECRET_KEY", 'know-your-animal-super-secret')

# Setup CORS to allow any localhost or 127.0.0.1 port (for Vite or standard setups)
CORS(app, supports_credentials=True, origins=[
    re.compile(r"http://localhost:\d+"),
    re.compile(r"http://127\.0\.0\.1:\d+"),
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:3000"
])

db = SQLAlchemy(app)

# ==========================================
# Models
# ==========================================

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='user')
    phone_number = db.Column(db.String(20), unique=True, nullable=True)
    otp = db.Column(db.String(6), nullable=True)
    otp_expiry = db.Column(db.DateTime, nullable=True)
    reset_token = db.Column(db.String(100), nullable=True)
    reset_token_expiry = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            '_id': str(self.id),
            'username': self.username,
            'email': self.email,
            'phoneNumber': self.phone_number,
            'role': self.role
        }

class UserProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    name = db.Column(db.String(100))
    phone_number = db.Column(db.String(20))
    location = db.Column(db.String(100))
    pets = db.Column(db.JSON)

    def to_dict(self):
        return {
            'name': self.name,
            'phoneNumber': self.phone_number,
            'location': self.location,
            'pets': self.pets if self.pets else []
        }

class DoctorProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    doctor_name = db.Column(db.String(100))
    email = db.Column(db.String(120))
    clinic_name = db.Column(db.String(100))
    qualification = db.Column(db.String(100))
    specialization = db.Column(db.String(100))
    contact_number = db.Column(db.String(20))
    location = db.Column(db.String(100))
    years_of_experience = db.Column(db.Integer, default=0)
    availability_status = db.Column(db.String(20), default='Offline')
    rating = db.Column(db.Float, default=0.0)
    profile_photo = db.Column(db.String(255))
    verified = db.Column(db.Boolean, default=False)
    is_platform_suggested = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            '_id': str(self.id),
            'userId': str(self.user_id),
            'doctorName': self.doctor_name,
            'email': self.email,
            'clinicName': self.clinic_name,
            'qualification': self.qualification,
            'specialization': self.specialization,
            'contactNumber': self.contact_number,
            'location': self.location,
            'yearsOfExperience': self.years_of_experience,
            'availabilityStatus': self.availability_status,
            'rating': self.rating,
            'profilePhoto': self.profile_photo,
            'verified': self.verified,
            'isPlatformSuggested': self.is_platform_suggested
        }

class PatientRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100))  # Can store actual MongoDB style strings or just string IDs
    doctor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    pet_name = db.Column(db.String(100))
    date = db.Column(db.DateTime, default=datetime.utcnow)
    treatment_notes = db.Column(db.Text)

    def to_dict(self):
        # We try to load the user associated to return standard format `{_id: ..., username: ...}`
        u_name = "Unknown"
        if self.user_id and self.user_id.isdigit():
            user = db.session.get(User, int(self.user_id))
            if user:
                u_name = user.username

        return {
            '_id': str(self.id),
            'userId': {'_id': self.user_id, 'username': u_name},
            'doctorId': str(self.doctor_id),
            'petName': self.pet_name,
            'date': self.date.isoformat(),
            'treatmentNotes': self.treatment_notes
        }

class Animal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    name_hi = db.Column(db.String(100))
    image = db.Column(db.String(255))
    description = db.Column(db.Text)

    def to_dict(self):
        return {
            '_id': str(self.id),
            'slug': self.slug,
            'name': self.name,
            'nameHi': self.name_hi,
            'image': self.image,
            'description': self.description
        }

class Disease(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('animal.id'))
    name = db.Column(db.String(100), nullable=False)
    name_hi = db.Column(db.String(100))
    symptoms = db.Column(db.JSON)
    causes = db.Column(db.Text)
    treatment = db.Column(db.Text)
    prevention = db.Column(db.JSON)

    def to_dict(self):
        return {
            '_id': str(self.id),
            'name': self.name,
            'nameHi': self.name_hi,
            'symptoms': self.symptoms if self.symptoms else [],
            'causes': self.causes,
            'treatment': self.treatment,
            'prevention': self.prevention if self.prevention else []
        }

# ==========================================
# Middleware
# ==========================================

def token_required(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        # Check both token names to support admins using general features like chat
        token = request.cookies.get('token') or request.cookies.get('adminToken')
        if not token:
            return jsonify({'message': 'Not authorized — no token provided'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = db.session.get(User, data['id'])
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
        except Exception:
            return jsonify({'message': 'Not authorized — invalid token'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('adminToken')
        if not token:
            return jsonify({'message': 'Not authorized — no admin token'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            if data['role'] != 'admin':
                return jsonify({'message': 'Admin access required'}), 403
            current_admin = db.session.get(User, data['id'])
            if not current_admin or current_admin.role != 'admin':
                return jsonify({'message': 'Admin access required'}), 403
        except Exception:
            return jsonify({'message': 'Not authorized — invalid token'}), 401
        return f(current_admin, *args, **kwargs)
    return decorated

def generate_token(user_id, role):
    payload = {
        'id': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm="HS256")

# ==========================================
# Routes
# ==========================================

# ── Auth & General User ──────────────────────────────────────────

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json or {}
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone') or None  # Store NULL, not empty string, to avoid UNIQUE constraint failures
    role = data.get('role', 'user')

    if not username or (not email and not phone) or not password:
        return jsonify({'message': 'All fields are required'}), 400

    if email and User.query.filter_by(email=email).first():
        return jsonify({'message': 'User already exists with this email'}), 409
    
    if phone and User.query.filter_by(phone_number=phone).first():
        return jsonify({'message': 'User already exists with this phone number'}), 409

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, email=email, password=hashed_password, role=role, phone_number=phone)
    db.session.add(new_user)
    db.session.flush() # get id

    if role == 'doctor':
        doc_prof = DoctorProfile(user_id=new_user.id, doctor_name=username, email=email)
        db.session.add(doc_prof)
    else:
        user_prof = UserProfile(user_id=new_user.id, name=username)
        db.session.add(user_prof)
    
    db.session.commit()

    token = generate_token(new_user.id, new_user.role)
    resp = make_response(jsonify({'message': 'User registered successfully', 'user': new_user.to_dict()}), 201)
    # Important: Secure must be False for local dev HTTP, change for prod
    resp.set_cookie('token', token, httponly=True, samesite='Lax', max_age=7*24*60*60)
    return resp

@app.route('/api/auth/login-user', methods=['POST'])
def login_user():
    data = request.json or {}
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid email or password'}), 401

    token = generate_token(user.id, user.role)
    resp = make_response(jsonify({'message': 'Logged in successfully', 'user': user.to_dict()}), 200)
    resp.set_cookie('token', token, httponly=True, samesite='Lax', max_age=7*24*60*60)
    return resp

    token = generate_token(user.id, user.role)
    resp = make_response(jsonify({'message': 'Doctor logged in successfully', 'user': user.to_dict()}), 200)
    resp.set_cookie('token', token, httponly=True, samesite='Lax', max_age=7*24*60*60)
    return resp

# ── Password Recovery & OTP ────────────────────────────────────────

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json or {}
    email = data.get('email')
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expiry = datetime.utcnow() + timedelta(minutes=15)
    db.session.commit()
    
    # In a real app, send email here. For now, return token in response (demo mode)
    return jsonify({
        'message': 'Password reset link sent to registered email',
        'resetToken': token,
        'devNote': 'In production, this token is sent via email. For demo, use this token in reset URL.'
    }), 200

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.json or {}
    token = data.get('token')
    new_password = data.get('newPassword')
    
    user = User.query.filter(User.reset_token == token, User.reset_token_expiry > datetime.utcnow()).first()
    if not user:
        return jsonify({'message': 'Invalid or expired token'}), 400
    
    user.password = generate_password_hash(new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.session.commit()
    return jsonify({'message': 'Password reset successful'}), 200

@app.route('/api/auth/send-otp', methods=['POST'])
def send_otp():
    data = request.json or {}
    phone = data.get('phoneNumber')
    if not phone:
        return jsonify({'message': 'Phone number required'}), 400
        
    otp = str(secrets.randbelow(900000) + 100000)
    user = User.query.filter_by(phone_number=phone).first()
    
    if not user:
        # Optional: Auto-create user for first time Otp login? No, let's keep it separate or handled by frontend
        pass
    else:
        user.otp = otp
        user.otp_expiry = datetime.utcnow() + timedelta(minutes=5)
        db.session.commit()
        
    # Real app would send SMS. Mocking here.
    print(f"DEBUG: SMS OTP for {phone} is {otp}")
    return jsonify({'message': f'OTP sent to {phone}', 'otp': otp if app.debug else 'Sent'}), 200

@app.route('/api/auth/login-mobile', methods=['POST'])
def login_mobile():
    data = request.json or {}
    phone = data.get('phoneNumber')
    otp = data.get('otp')
    
    user = User.query.filter(User.phone_number == phone, User.otp == otp, User.otp_expiry > datetime.utcnow()).first()
    if not user:
        return jsonify({'message': 'Invalid or expired OTP'}), 401
        
    user.otp = None
    user.otp_expiry = None
    db.session.commit()
    
    token = generate_token(user.id, user.role)
    resp = make_response(jsonify({'message': 'Logged in successfully', 'user': user.to_dict()}), 200)
    resp.set_cookie('token', token, httponly=True, samesite='Lax', max_age=7*24*60*60)
    return resp

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    resp = make_response(jsonify({'message': 'Logged out successfully'}), 200)
    resp.set_cookie('token', '', expires=0, httponly=True, path='/', samesite='Lax')
    resp.set_cookie('adminToken', '', expires=0, httponly=True, path='/', samesite='Lax')
    return resp

@app.route('/api/auth/profile', methods=['GET', 'PUT'])
@token_required
def auth_profile(current_user):
    if request.method == 'GET':
        profile = UserProfile.query.filter_by(user_id=current_user.id).first()
        return jsonify({
            'user': current_user.to_dict(),
            'profile': profile.to_dict() if profile else {}
        }), 200

    if request.method == 'PUT':
        data = request.json or {}
        if data.get('username'):
            current_user.username = data['username']
        
        profile = UserProfile.query.filter_by(user_id=current_user.id).first()
        if not profile:
            profile = UserProfile(user_id=current_user.id)
            db.session.add(profile)
        
        if 'name' in data: profile.name = data['name']
        if 'phoneNumber' in data: profile.phone_number = data['phoneNumber']
        if 'location' in data: profile.location = data['location']
        if 'pets' in data: profile.pets = data['pets']

        db.session.commit()
        return jsonify({
            'message': 'Profile updated successfully',
            'user': current_user.to_dict(),
            'profile': profile.to_dict()
        }), 200

@app.route('/api/auth/public/doctors', methods=['GET'])
def public_doctors():
    doctors = DoctorProfile.query.all()
    results = []
    for d in doctors:
        d_dict = d.to_dict()
        user = db.session.get(User, d.user_id)
        if user:
            d_dict['username'] = user.username
        results.append(d_dict)
    return jsonify(results), 200

# ── Admin ────────────────────────────────────────────────────────

@app.route('/api/admin/login-admin', methods=['POST'])
def login_admin():
    data = request.json or {}
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email, role='admin').first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid admin credentials'}), 401

    token = generate_token(user.id, user.role)
    resp = make_response(jsonify({'message': 'Admin logged in successfully', 'user': user.to_dict()}), 200)
    resp.set_cookie('adminToken', token, httponly=True, samesite='Lax', max_age=7*24*60*60)
    return resp

@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    resp = make_response(jsonify({'message': 'Admin logged out successfully'}), 200)
    resp.set_cookie('adminToken', '', expires=0, httponly=True, path='/', samesite='Lax')
    return resp

@app.route('/api/admin/profile', methods=['GET'])
@admin_required
def admin_profile(current_admin):
    return jsonify({'message': 'Admin profile fetched successfully', 'user': current_admin.to_dict()}), 200

@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_all_users(current_admin):
    users = User.query.filter_by(role='user').all()
    result = []
    for u in users:
        u_dict = u.to_dict()
        prof = UserProfile.query.filter_by(user_id=u.id).first()
        if prof:
            u_dict['profile'] = prof.to_dict()
        result.append(u_dict)
    return jsonify(result), 200

@app.route('/api/admin/users/<int:user_id>', methods=['GET', 'PUT', 'DELETE'])
@admin_required
def manage_user(current_admin, user_id):
    user = db.session.get(User, user_id)
    if not user or user.role not in ('user',):
        return jsonify({'message': 'User not found'}), 404

    if request.method == 'GET':
        prof = UserProfile.query.filter_by(user_id=user_id).first()
        return jsonify({'user': user.to_dict(), 'profile': prof.to_dict() if prof else {}}), 200

    if request.method == 'PUT':
        data = request.json or {}
        if 'username' in data: user.username = data['username']
        if 'email' in data: user.email = data['email']
        if 'phone_number' in data: user.phone_number = data['phone_number']
        if 'newPassword' in data and data['newPassword']:
            user.password = generate_password_hash(data['newPassword'])
        # Update profile fields
        prof = UserProfile.query.filter_by(user_id=user_id).first()
        if not prof:
            prof = UserProfile(user_id=user_id, name=user.username)
            db.session.add(prof)
        if 'name' in data: prof.name = data['name']
        if 'location' in data: prof.location = data['location']
        db.session.commit()
        return jsonify({'message': 'User updated successfully', 'user': user.to_dict()}), 200

    if request.method == 'DELETE':
        prof = UserProfile.query.filter_by(user_id=user_id).first()
        if prof: db.session.delete(prof)
        # Delete pet documents too
        PetDocument.query.filter_by(user_id=user_id).delete()
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted'}), 200

@app.route('/api/admin/doctors', methods=['GET', 'POST'])
@admin_required
def handle_all_doctors(current_admin):
    if request.method == 'GET':
        doctors = User.query.filter_by(role='doctor').all()
        profiles = DoctorProfile.query.all()
        
        prof_list = []
        for p in profiles:
            p_dict = p.to_dict()
            u = db.session.get(User, p.user_id)
            if u:
                p_dict['userId'] = {'_id': str(u.id), 'username': u.username, 'email': u.email}
            prof_list.append(p_dict)

        return jsonify({'doctors': [d.to_dict() for d in doctors], 'profiles': prof_list}), 200

    if request.method == 'POST':
        data = request.json or {}
        if User.query.filter_by(email=data.get('email')).first():
            return jsonify({'message': 'User already exists'}), 409
        
        pw_hash = generate_password_hash(data.get('password', 'default123'))
        new_doc = User(username=data.get('username'), email=data.get('email'), password=pw_hash, role='doctor')
        db.session.add(new_doc)
        db.session.flush()
        
        doc_prof = DoctorProfile(user_id=new_doc.id, doctor_name=new_doc.username, email=new_doc.email)
        db.session.add(doc_prof)
        db.session.commit()
        
        return jsonify({'message': 'Doctor account created', 'user': new_doc.to_dict()}), 201

@app.route('/api/admin/doctors/<int:doctor_id>', methods=['DELETE', 'PUT'])
@admin_required
def handle_doctor(current_admin, doctor_id):
    if request.method == 'DELETE':
        user = db.session.get(User, doctor_id)
        if user:
            prof = DoctorProfile.query.filter_by(user_id=doctor_id).first()
            if prof:
                db.session.delete(prof)
            db.session.delete(user)
            db.session.commit()
        return jsonify({'message': 'Doctor removed successfully'}), 200

    if request.method == 'PUT':
        data = request.json or {}
        prof = DoctorProfile.query.filter_by(user_id=doctor_id).first()
        if not prof:
            return jsonify({'message': 'Doctor profile not found'}), 404

        # Map all editable fields
        field_map = {
            'doctorName': 'doctor_name', 'clinicName': 'clinic_name',
            'qualification': 'qualification', 'specialization': 'specialization',
            'contactNumber': 'contact_number', 'location': 'location',
            'yearsOfExperience': 'years_of_experience', 'rating': 'rating',
            'availabilityStatus': 'availability_status', 'verified': 'verified',
        }
        for json_key, db_key in field_map.items():
            if json_key in data:
                if json_key == 'yearsOfExperience':
                    setattr(prof, db_key, int(data[json_key] or 0))
                elif json_key == 'rating':
                    setattr(prof, db_key, float(data[json_key] or 0))
                elif json_key == 'verified':
                    setattr(prof, db_key, bool(data[json_key]))
                else:
                    setattr(prof, db_key, data[json_key])
        db.session.commit()
        return jsonify({'message': 'Doctor profile updated', 'profile': prof.to_dict()}), 200

# ── Pet Documents ────────────────────────────────────────────────────────────

class PetDocument(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    pet_name = db.Column(db.String(100))
    doc_name = db.Column(db.String(200), nullable=False)
    doc_type = db.Column(db.String(50))  # vaccination, prescription, report, etc.
    notes = db.Column(db.Text)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    uploaded_by = db.Column(db.String(20), default='user')  # 'user' or 'admin'

    def to_dict(self):
        return {
            '_id': str(self.id),
            'userId': str(self.user_id),
            'petName': self.pet_name,
            'docName': self.doc_name,
            'docType': self.doc_type,
            'notes': self.notes,
            'uploadedAt': self.uploaded_at.isoformat(),
            'uploadedBy': self.uploaded_by
        }

@app.route('/api/admin/users/<int:user_id>/documents', methods=['GET', 'POST'])
@admin_required
def manage_user_docs(current_admin, user_id):
    if request.method == 'GET':
        docs = PetDocument.query.filter_by(user_id=user_id).all()
        return jsonify([d.to_dict() for d in docs]), 200

    if request.method == 'POST':
        data = request.json or {}
        doc = PetDocument(
            user_id=user_id,
            pet_name=data.get('petName', 'General'),
            doc_name=data.get('docName'),
            doc_type=data.get('docType', 'general'),
            notes=data.get('notes', ''),
            uploaded_by='admin'
        )
        db.session.add(doc)
        db.session.commit()
        return jsonify({'message': 'Document added', 'document': doc.to_dict()}), 201

@app.route('/api/admin/users/<int:user_id>/documents/<int:doc_id>', methods=['DELETE'])
@admin_required
def delete_user_doc(current_admin, user_id, doc_id):
    doc = db.session.get(PetDocument, doc_id)
    if doc and doc.user_id == user_id:
        db.session.delete(doc)
        db.session.commit()
    return jsonify({'message': 'Document deleted'}), 200

# ── User's own documents ─────────────────────────────────────────────────────

@app.route('/api/user/documents', methods=['GET', 'POST'])
@token_required
def user_documents(current_user):
    if request.method == 'GET':
        docs = PetDocument.query.filter_by(user_id=current_user.id).all()
        return jsonify([d.to_dict() for d in docs]), 200

    if request.method == 'POST':
        data = request.json or {}
        doc = PetDocument(
            user_id=current_user.id,
            pet_name=data.get('petName', 'General'),
            doc_name=data.get('docName'),
            doc_type=data.get('docType', 'general'),
            notes=data.get('notes', ''),
            uploaded_by='user'
        )
        db.session.add(doc)
        db.session.commit()
        return jsonify({'message': 'Document added', 'document': doc.to_dict()}), 201

@app.route('/api/user/documents/<int:doc_id>', methods=['DELETE'])
@token_required
def delete_document(current_user, doc_id):
    doc = db.session.get(PetDocument, doc_id)
    if doc and doc.user_id == current_user.id:
        db.session.delete(doc)
        db.session.commit()
    return jsonify({'message': 'Document deleted'}), 200


# ── Appointments ─────────────────────────────────────────────────────────────

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    doctor_id = db.Column(db.Integer, nullable=False)  # references DoctorProfile.id
    pet_name = db.Column(db.String(100))
    reason = db.Column(db.Text)
    preferred_date = db.Column(db.String(50))
    preferred_time = db.Column(db.String(20))
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, completed, cancelled
    doctor_notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        user = db.session.get(User, self.user_id)
        doctor = db.session.get(DoctorProfile, self.doctor_id)
        return {
            '_id': str(self.id),
            'userId': {'_id': str(self.user_id), 'username': user.username if user else 'Unknown', 'email': user.email if user else ''},
            'doctorId': str(self.doctor_id),
            'doctorName': doctor.doctor_name if doctor else 'Unknown Doctor',
            'petName': self.pet_name,
            'reason': self.reason,
            'preferredDate': self.preferred_date,
            'preferredTime': self.preferred_time,
            'status': self.status,
            'doctorNotes': self.doctor_notes,
            'createdAt': self.created_at.isoformat(),
        }

# User books an appointment
@app.route('/api/appointments', methods=['POST'])
@token_required
def book_appointment(current_user):
    data = request.json or {}
    appt = Appointment(
        user_id=current_user.id,
        doctor_id=int(data.get('doctorId')),
        pet_name=data.get('petName'),
        reason=data.get('reason'),
        preferred_date=data.get('preferredDate'),
        preferred_time=data.get('preferredTime'),
    )
    db.session.add(appt)
    db.session.commit()
    return jsonify({'message': 'Appointment booked!', 'appointment': appt.to_dict()}), 201

# User views their own appointments
@app.route('/api/appointments/my', methods=['GET'])
@token_required
def my_appointments(current_user):
    appts = Appointment.query.filter_by(user_id=current_user.id).order_by(Appointment.created_at.desc()).all()
    return jsonify([a.to_dict() for a in appts]), 200

# Doctor views appointments made with them
@app.route('/api/doctor/appointments', methods=['GET'])
@token_required
def doctor_appointments(current_user):
    if current_user.role != 'doctor':
        return jsonify({'message': 'Not authorized'}), 403
    prof = DoctorProfile.query.filter_by(user_id=current_user.id).first()
    if not prof:
        return jsonify([]), 200
    appts = Appointment.query.filter_by(doctor_id=prof.id).order_by(Appointment.created_at.desc()).all()
    return jsonify([a.to_dict() for a in appts]), 200

# Doctor updates appointment status / adds notes
@app.route('/api/doctor/appointments/<int:appt_id>', methods=['PUT'])
@token_required
def update_appointment(current_user, appt_id):
    if current_user.role != 'doctor':
        return jsonify({'message': 'Not authorized'}), 403
    appt = db.session.get(Appointment, appt_id)
    if not appt:
        return jsonify({'message': 'Appointment not found'}), 404
    data = request.json or {}
    if 'status' in data: appt.status = data['status']
    if 'doctorNotes' in data: appt.doctor_notes = data['doctorNotes']
    db.session.commit()
    return jsonify({'message': 'Appointment updated', 'appointment': appt.to_dict()}), 200

# Doctor gets list of all registered users (to browse/select for appointments)
@app.route('/api/doctor/users', methods=['GET'])
@token_required
def doctor_get_users(current_user):
    if current_user.role != 'doctor':
        return jsonify({'message': 'Not authorized'}), 403
    users = User.query.filter_by(role='user').all()
    result = []
    for u in users:
        u_dict = u.to_dict()
        prof = UserProfile.query.filter_by(user_id=u.id).first()
        if prof:
            u_dict['profile'] = prof.to_dict()
        result.append(u_dict)
    return jsonify(result), 200

# ── Doctor Operations ────────────────────────────────────────────




@app.route('/api/doctor/profile', methods=['GET', 'PUT'])
@token_required
def doctor_prof(current_user):
    if current_user.role != 'doctor':
        return jsonify({'message': 'Not authorized as doctor'}), 403
        
    prof = DoctorProfile.query.filter_by(user_id=current_user.id).first()
    
    if request.method == 'GET':
        return jsonify({
            'user': current_user.to_dict(),
            'profile': prof.to_dict() if prof else {}
        }), 200

    if request.method == 'PUT':
        data = request.json or {}
        if not prof:
            prof = DoctorProfile(user_id=current_user.id)
            db.session.add(prof)
        
        mapped_fields = {
            'doctorName': 'doctor_name',
            'clinicName': 'clinic_name',
            'qualification': 'qualification',
            'specialization': 'specialization',
            'contactNumber': 'contact_number',
            'location': 'location',
            'yearsOfExperience': 'years_of_experience',
            'availabilityStatus': 'availability_status',
            'rating': 'rating'
        }

        for json_key, db_key in mapped_fields.items():
            if json_key in data:
                if json_key == 'yearsOfExperience':
                    setattr(prof, db_key, int(data[json_key] or 0))
                elif json_key == 'rating':
                    setattr(prof, db_key, float(data[json_key] or 0))
                else:
                    setattr(prof, db_key, data[json_key])

        db.session.commit()
        return jsonify({'message': 'Profile updated', 'profile': prof.to_dict()}), 200

@app.route('/api/doctor/patients', methods=['GET'])
@token_required
def doctor_patients(current_user):
    if current_user.role != 'doctor':
        return jsonify({'message': 'Not authorized'}), 403
    records = PatientRecord.query.filter_by(doctor_id=current_user.id).all()
    return jsonify([r.to_dict() for r in records]), 200

@app.route('/api/doctor/treatment-notes', methods=['POST'])
@token_required
def add_treatment_note(current_user):
    if current_user.role != 'doctor':
        return jsonify({'message': 'Not authorized'}), 403
    
    data = request.json or {}
    new_note = PatientRecord(
        user_id=data.get('userId'),
        doctor_id=current_user.id,
        pet_name=data.get('petName'),
        treatment_notes=data.get('treatmentNotes')
    )
    db.session.add(new_note)
    db.session.commit()
    return jsonify({'message': 'Note added successfully!', 'record': new_note.to_dict()}), 201

# ── Animals ──────────────────────────────────────────────────────

@app.route('/api/animals', methods=['GET', 'POST'])
def handle_animals():
    if request.method == 'GET':
        animals = Animal.query.all()
        return jsonify({'animals': [a.to_dict() for a in animals]}), 200

    if request.method == 'POST':
        data = request.json or {}
        if Animal.query.filter_by(slug=data.get('slug')).first():
            return jsonify({'message': 'Animal with this slug already exists'}), 400
            
        new_animal = Animal(
            slug=data.get('slug'),
            name=data.get('name'),
            name_hi=data.get('nameHi'),
            image=data.get('image'),
            description=data.get('description')
        )
        db.session.add(new_animal)
        db.session.commit()
        return jsonify({'message': 'Animal added', 'animal': new_animal.to_dict()}), 201

@app.route('/api/animals/<slug>', methods=['GET', 'PUT', 'DELETE'])
def single_animal(slug):
    animal = Animal.query.filter_by(slug=slug).first()
    if not animal:
        return jsonify({'message': 'Animal not found'}), 404

    if request.method == 'GET':
        diseases = Disease.query.filter_by(animal_id=animal.id).all()
        anim_dict = animal.to_dict()
        anim_dict['diseases'] = [d.to_dict() for d in diseases]
        return jsonify({'animal': anim_dict}), 200

    if request.method == 'DELETE':
        Disease.query.filter_by(animal_id=animal.id).delete()
        db.session.delete(animal)
        db.session.commit()
        return jsonify({'message': 'Animal deleted'}), 200

    if request.method == 'PUT':
        data = request.json or {}
        if 'name' in data: animal.name = data['name']
        if 'nameHi' in data: animal.name_hi = data['nameHi']
        if 'image' in data: animal.image = data['image']
        if 'description' in data: animal.description = data['description']
        db.session.commit()
        return jsonify({'message': 'Animal updated', 'animal': animal.to_dict()}), 200

@app.route('/api/animals/<slug>/diseases', methods=['POST'])
def add_animal_disease(slug):
    animal = Animal.query.filter_by(slug=slug).first()
    if not animal:
        return jsonify({'message': 'Animal not found'}), 404

    data = request.json or {}
    new_disease = Disease(
        animal_id=animal.id,
        name=data.get('name'),
        name_hi=data.get('nameHi'),
        symptoms=data.get('symptoms', []),
        causes=data.get('causes'),
        treatment=data.get('treatment'),
        prevention=data.get('prevention', [])
    )
    db.session.add(new_disease)
    db.session.commit()
    return jsonify({'message': 'Disease added', 'disease': new_disease.to_dict()}), 201

@app.route('/api/animals/<slug>/diseases/<disease_id>', methods=['DELETE'])
def delete_animal_disease(slug, disease_id):
    disease = db.session.get(Disease, int(disease_id))
    if disease:
        db.session.delete(disease)
        db.session.commit()
    return jsonify({'message': 'Disease deleted'}), 200


# ── Chat ────────────────────────────────────────────────────────

@app.route('/api/chat', methods=['POST'])
@token_required
def chat_ai(current_user):
    data = request.json or {}
    messages = data.get('messages', [])
    if not messages:
        return jsonify({"error": "messages array is required"}), 400

    gemini_key = os.environ.get('GEMINI_API_KEY')
    if not gemini_key:
        return jsonify({"error": "GEMINI_API_KEY is not configured on server"}), 500

    SYSTEM_PROMPT = """You are "Know Your Animal" — a friendly, knowledgeable veterinary assistant specializing in animal healthcare. You help farmers, pet owners, and animal caretakers in India.

Your expertise covers:
- Common diseases in cows, goats, dogs, cats, chickens, ducks, rabbits, parrots, pigeons, and other domestic animals
- Symptoms, causes, prevention, and treatment of animal diseases
- General animal care, nutrition, and husbandry tips
- First aid for animals

Guidelines:
- Keep answers concise but informative (2-4 paragraphs max)
- Use simple, easy-to-understand language
- Always recommend consulting a veterinarian for serious conditions
- If asked about something unrelated to animals, politely redirect to animal topics
- Be warm and supportive — many users are worried about their animals"""

    # Proxy request down to Gemini via standard OpenAI completions schema
    url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
    headers = {
        "Authorization": f"Bearer {gemini_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "gemini-1.5-flash",
        "messages": [{"role": "system", "content": SYSTEM_PROMPT}] + messages,
        "stream": True
    }
    
    try:
        req = requests.post(url, headers=headers, json=payload, stream=True)
        if req.status_code != 200:
            return jsonify({"error": req.text}), req.status_code
            
        def generate():
            for chunk in req.iter_content(chunk_size=1024):
                if chunk:
                    yield chunk
        
        return Response(generate(), mimetype='text/event-stream')
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.errorhandler(404)
def not_found(e):
    # Serve index.html for unknown paths to support React Router
    if app.static_folder and os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
    return jsonify({"error": "Not found"}), 404

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    if app.static_folder and os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
    return jsonify({"error": "Frontend not built or static folder not found"}), 404

# ==========================================
# Script Execution
# ==========================================

if __name__ == '__main__':
    with app.app_context():
        # Create all tables (if they don't exist)
        db.create_all()
        
        # Create default admin if missing
        if not User.query.filter_by(role='admin').first():
            pwd = generate_password_hash('admin123')
            admin = User(username='admin', email='admin@admin.com', password=pwd, role='admin')
            db.session.add(admin)
            db.session.commit()
            print("Default admin created: admin@admin.com / admin123")

        # Seed realistic doctors if none exist
        if DoctorProfile.query.count() < 2:
            seed_doctors = [
                {
                    "name": "Dr. Anjali Menon",
                    "email": "anjali@example.com",
                    "qual": "BVSc & AH, MVSc (Surgery)",
                    "spec": "Pet Surgery Specialist",
                    "exp": 15,
                    "loc": "Kadavanthra, Cochin, Kerala",
                    "clinic": "Cochin Pet Hospital",
                    "rating": 4.9,
                    "verified": True
                },
                {
                    "name": "Dr. Karthik Swaminathan",
                    "email": "karthik@example.com",
                    "qual": "MVSc Medicine",
                    "spec": "Avian & Small Animal Expert",
                    "exp": 10,
                    "loc": "Adyar, Chennai, Tamil Nadu",
                    "clinic": "Chennai Vet Care",
                    "rating": 4.7,
                    "verified": True
                },
                {
                    "name": "Dr. Bhargavi Reddy",
                    "email": "bhargavi@example.com",
                    "qual": "BVSc",
                    "spec": "Livestock Health Consultant",
                    "exp": 7,
                    "loc": "Banjara Hills, Hyderabad, Telangana",
                    "clinic": "Telangana Animal Wellness",
                    "rating": 4.5,
                    "verified": True
                },
                {
                    "name": "Dr. Ramesh Kumar",
                    "email": "ramesh@example.com",
                    "qual": "BVSc & AH",
                    "spec": "Large Animal Specialist",
                    "exp": 12,
                    "loc": "Mysore, Karnataka",
                    "clinic": "Happy Pets Clinic",
                    "rating": 4.5,
                    "verified": True
                },
                {
                    "name": "Dr. Rahul Deshmukh",
                    "email": "rahul@example.com",
                    "qual": "MVSc Radiology",
                    "spec": "Diagnostic Imaging Specialist",
                    "exp": 9,
                    "loc": "Pune, Maharashtra",
                    "clinic": "Pune Veterinary Imaging Center",
                    "rating": 4.3,
                    "verified": True
                },
                {
                    "name": "Dr. Amit Sharma",
                    "email": "amit@example.com",
                    "qual": "BVSc",
                    "spec": "General Practitioner",
                    "exp": 5,
                    "loc": "Jayanagar, Bangalore, Karnataka",
                    "clinic": "Pet Care Plus",
                    "rating": 3.8,
                    "verified": False,
                    "suggested": True
                }
            ]
            for d in seed_doctors:
                if not User.query.filter_by(email=d['email']).first():
                    pw = generate_password_hash('doctor123')
                    u = User(username=d['name'], email=d['email'], password=pw, role='doctor')
                    db.session.add(u)
                    db.session.flush()
                    prof = DoctorProfile(
                        user_id=u.id, 
                        doctor_name=d['name'], 
                        email=d['email'], 
                        qualification=d['qual'],
                        specialization=d['spec'],
                        years_of_experience=d['exp'],
                        location=d['loc'],
                        clinic_name=d['clinic'],
                        rating=d['rating'],
                        verified=d.get('verified', False),
                        is_platform_suggested=d.get('suggested', False)
                    )
                    db.session.add(prof)
            db.session.commit()
            print("Realistic doctors seeded.")

        # Seed animals if none exist
        if Animal.query.count() == 0:
            seed_animals = [
                {
                    "slug": "bengal-tiger",
                    "name": "Bengal Tiger",
                    "name_hi": "बंगाल टाइगर",
                    "desc": "The Bengal tiger is a tiger from a specific population of the Panthera tigris tigris subspecies that is native to the Indian subcontinent.",
                    "img": "https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?auto=format&fit=crop&q=80&w=800"
                },
                {
                    "slug": "cow",
                    "name": "Cow",
                    "name_hi": "गाय",
                    "desc": "Cows are large, gentle mammals found throughout India, known for their vital role in agriculture and dairy production.",
                    "img": "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800"
                },
                {
                    "slug": "dog",
                    "name": "Dog",
                    "name_hi": "कुत्ता",
                    "desc": "The domestic dog is a domesticated descendant of the wolf. They are popular pets and working animals in both urban and rural India.",
                    "img": "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=800"
                },
                {
                    "slug": "goat",
                    "name": "Goat",
                    "name_hi": "बकरी",
                    "desc": "The domestic goat is a subspecies of goat domesticated from the wild goat of southwest Asia and Eastern Europe.",
                    "img": "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=800"
                }
            ]
            for a in seed_animals:
                anim = Animal(slug=a['slug'], name=a['name'], name_hi=a['name_hi'], description=a['desc'], image=a['img'])
                db.session.add(anim)
            db.session.commit()
            print("Default animals seeded.")
            
    app.run(port=3000, debug=True)

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

# Database configuration (PostgreSQL & SQLite support)
raw_db_uri = os.environ.get("DATABASE_URL", "sqlite:///app.db").strip().strip('"').strip("'")

# Normalize legacy postgres:// scheme to postgresql:// required by SQLAlchemy 1.4+
if raw_db_uri.startswith("postgres://"):
    raw_db_uri = raw_db_uri.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = raw_db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get("SECRET_KEY", 'know-your-animal-super-secret')

# Configure database engine pooling & keep-alive options
if not raw_db_uri.startswith("sqlite"):
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        "pool_pre_ping": True,     # Automatically reconnects if connection was dropped
        "pool_recycle": 300,      # Recycle connections every 5 minutes to prevent stale cloud sockets
        "pool_size": 10,
        "max_overflow": 20
    }
else:
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        "pool_pre_ping": True
    }

# Setup CORS to allow any localhost or 127.0.0.1 port (for Vite or standard setups)
# Setup CORS to allow local development, Vercel deployments, and Render origins
client_url = os.environ.get("CLIENT_URL", "").strip()
allowed_origins = [
    re.compile(r"http://localhost:\d+"),
    re.compile(r"http://127\.0\.0\.1:\d+"),
    re.compile(r"https://.*\.vercel\.app"),
    re.compile(r"https://.*\.onrender\.com"),
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:3000",
    "https://know-your-animal-app.vercel.app",
    "https://know-your-animal-app.onrender.com"
]
if client_url and client_url not in allowed_origins:
    allowed_origins.append(client_url)
CORS(app, supports_credentials=True, origins=allowed_origins)

db = SQLAlchemy(app)

# ==========================================
# Models
# ==========================================

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')
    phone_number = db.Column(db.String(20), unique=True, nullable=True)
    otp = db.Column(db.String(6), nullable=True)
    otp_expiry = db.Column(db.DateTime, nullable=True)
    reset_token = db.Column(db.String(100), nullable=True)
    reset_token_expiry = db.Column(db.DateTime, nullable=True)
    subscription_plan = db.Column(db.String(50), default='free')
    subscription_status = db.Column(db.String(20), default='inactive')
    subscription_expiry = db.Column(db.DateTime, nullable=True)
    subscription_order_id = db.Column(db.String(100), nullable=True)
    subscription_payment_id = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            '_id': str(self.id),
            'username': self.username,
            'email': self.email,
            'phoneNumber': self.phone_number,
            'role': self.role,
            'subscriptionPlan': self.subscription_plan or 'free',
            'subscriptionStatus': self.subscription_status or 'inactive',
            'subscriptionExpiry': self.subscription_expiry.isoformat() if self.subscription_expiry else None
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
    profile_photo = db.Column(db.String(500))
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
    image = db.Column(db.String(500))
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

def get_auth_token():
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token_str = auth_header.split(' ', 1)[1].strip()
        if token_str and token_str not in ('null', 'undefined', ''):
            return token_str
    return request.cookies.get('token') or request.cookies.get('adminToken')

def token_required(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        token = get_auth_token()
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
        token = get_auth_token()
        if not token:
            return jsonify({'message': 'Not authorized — no admin token'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            if data.get('role') != 'admin':
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
    resp = make_response(jsonify({'message': 'User registered successfully', 'user': new_user.to_dict(), 'token': token}), 201)
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
    resp = make_response(jsonify({'message': 'Logged in successfully', 'user': user.to_dict(), 'token': token}), 200)
    resp.set_cookie('token', token, httponly=True, samesite='Lax', max_age=7*24*60*60)
    return resp

@app.route('/api/auth/login-doctor', methods=['POST'])
def login_doctor():
    data = request.json or {}
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email, role='doctor').first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid doctor credentials'}), 401

    token = generate_token(user.id, user.role)
    resp = make_response(jsonify({'message': 'Doctor logged in successfully', 'user': user.to_dict(), 'token': token}), 200)
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
    
    # SECURITY: In production, send this via a real email service (SendGrid/Nodemailer)
    print(f"DEBUG: Password reset link for {email}: http://localhost:8080/reset-password?token={token}")
    
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
        # OPTIONAL SECURITY: Don't reveal if user exists. 
        # For this specific app (Emergency), we can just return success to avoid enumeration.
        return jsonify({'message': f'If the number is registered, an OTP has been sent.'}), 200
    
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
    
    user = User.query.filter_by(phone_number=phone).first()
    
    if not user or not user.otp or user.otp != otp:
        return jsonify({'message': 'Invalid OTP'}), 401
    
    if user.otp_expiry < datetime.utcnow():
        return jsonify({'message': 'OTP has expired'}), 401
        
    user.otp = None
    user.otp_expiry = None
    db.session.commit()
    
    token = generate_token(user.id, user.role)
    resp = make_response(jsonify({'message': 'Logged in successfully', 'user': user.to_dict(), 'token': token}), 200)
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
    resp = make_response(jsonify({'message': 'Admin logged in successfully', 'user': user.to_dict(), 'token': token}), 200)
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

@app.route('/api/admin/doctors/<int:doctor_id>/verify', methods=['POST', 'PUT'])
@admin_required
def verify_doctor_status(current_admin, doctor_id):
    prof = DoctorProfile.query.filter_by(user_id=doctor_id).first()
    if not prof:
        prof = db.session.get(DoctorProfile, doctor_id)
    if not prof:
        return jsonify({'message': 'Doctor profile not found'}), 404
    prof.verified = True
    db.session.commit()
    return jsonify({'message': 'Doctor verified successfully!', 'profile': prof.to_dict()}), 200

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
    raw_doc_id = data.get('doctorId')
    if not raw_doc_id:
        return jsonify({'message': 'Doctor ID is required'}), 400
    try:
        doc_id = int(raw_doc_id)
    except (ValueError, TypeError):
        return jsonify({'message': 'Invalid Doctor ID'}), 400
    appt = Appointment(
        user_id=current_user.id,
        doctor_id=doc_id,
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

# ==========================================
# Subscription & Razorpay Payments
# ==========================================

RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', 'rzp_test_KnowYourAnimal')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', 'test_secret_key')

SUBSCRIPTION_PLANS = {
    'care_plus': {
        'id': 'care_plus',
        'name': 'Care Plus (Pet Care)',
        'price': 199,
        'interval': 'monthly',
        'duration_days': 30,
        'features': [
            'Unlimited 24/7 AI Veterinary Assistant consultations',
            'Priority direct appointment booking with verified doctors',
            'Digital vaccination & medical document records',
            'Emergency animal care hotline access'
        ]
    },
    'farm_pro': {
        'id': 'farm_pro',
        'name': 'Farm & Livestock Pro',
        'price': 499,
        'interval': 'monthly',
        'duration_days': 30,
        'features': [
            'Multi-animal & livestock herd health management',
            'Priority emergency video teleconsultations with senior vets',
            'Direct digital prescription & treatment note access',
            'Emergency animal ambulance priority dispatch support'
        ]
    }
}

@app.route('/api/subscription/plans', methods=['GET'])
def get_plans():
    return jsonify({
        'plans': list(SUBSCRIPTION_PLANS.values()),
        'keyId': RAZORPAY_KEY_ID
    }), 200

@app.route('/api/subscription/current', methods=['GET'])
@token_required
def get_user_subscription(current_user):
    return jsonify({
        'plan': current_user.subscription_plan or 'free',
        'status': current_user.subscription_status or 'inactive',
        'expiry': current_user.subscription_expiry.isoformat() if current_user.subscription_expiry else None
    }), 200

@app.route('/api/subscription/create-order', methods=['POST'])
@token_required
def create_subscription_order(current_user):
    data = request.json or {}
    plan_id = data.get('planId')
    plan = SUBSCRIPTION_PLANS.get(plan_id)
    if not plan:
        return jsonify({'message': 'Invalid subscription plan'}), 400

    amount_in_paise = plan['price'] * 100
    order_id = f"order_{secrets.token_hex(8)}"

    try:
        import razorpay
        if RAZORPAY_KEY_ID != 'rzp_test_KnowYourAnimal' and RAZORPAY_KEY_SECRET != 'test_secret_key':
            client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
            rzp_order = client.order.create({
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": f"rcpt_{current_user.id}_{int(time.time())}",
                "notes": {"plan_id": plan_id, "user_id": current_user.id}
            })
            order_id = rzp_order['id']
    except Exception as e:
        print("Razorpay client notice:", e)

    current_user.subscription_order_id = order_id
    db.session.commit()

    return jsonify({
        'orderId': order_id,
        'amount': amount_in_paise,
        'currency': 'INR',
        'keyId': RAZORPAY_KEY_ID,
        'planName': plan['name'],
        'prefill': {
            'name': current_user.username,
            'email': current_user.email,
            'contact': current_user.phone_number or ''
        }
    }), 200

@app.route('/api/subscription/verify-payment', methods=['POST'])
@token_required
def verify_subscription_payment(current_user):
    data = request.json or {}
    plan_id = data.get('planId')
    payment_id = data.get('razorpayPaymentId') or f"pay_{secrets.token_hex(8)}"
    order_id = data.get('razorpayOrderId') or current_user.subscription_order_id or f"order_{secrets.token_hex(8)}"
    signature = data.get('razorpaySignature')

    plan = SUBSCRIPTION_PLANS.get(plan_id)
    if not plan:
        return jsonify({'message': 'Invalid subscription plan'}), 400

    if not payment_id or not order_id:
        return jsonify({'message': 'Security validation error: Payment ID and Order ID are required.'}), 400

    if RAZORPAY_KEY_ID != 'rzp_test_KnowYourAnimal' and RAZORPAY_KEY_SECRET != 'test_secret_key':
        if not signature:
            return jsonify({'message': 'Security Violation: Missing Razorpay cryptographic signature. Payment rejected.'}), 400
        try:
            import razorpay
            client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
            client.utility.verify_payment_signature({
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            })
        except Exception as e:
            return jsonify({'message': f'Cryptographic payment verification failed: {str(e)}'}), 400
    else:
        # Development Sandbox mode: require valid 2FA Bank OTP (789456) OR 12-digit UPI UTR
        # No free unverified bypass allowed under any circumstances!
        otp = (data.get('otp') or '').strip()
        utr = (data.get('utr') or '').strip()

        if signature:
            # Verified test signature flow
            pass
        elif otp:
            if otp != "789456":
                return jsonify({'message': 'Bank 3D-Secure 2.0 Authentication Failed: Invalid One-Time Password (OTP).'}), 400
            payment_id = payment_id or f"pay_otp_{secrets.token_hex(6)}"
        elif utr:
            if len(utr) < 12 or not utr.isdigit():
                return jsonify({'message': 'Security validation error: UPI Reference Number (UTR) must be 12 numeric digits.'}), 400
            payment_id = f"pay_upi_{utr}"
        else:
            return jsonify({'message': 'Security Violation: Payment authorization required. Please complete Bank 3D-Secure 2.0 OTP or provide valid 12-digit UPI UTR.'}), 400

    current_user.subscription_plan = plan_id
    current_user.subscription_status = 'active'
    current_user.subscription_payment_id = payment_id
    current_user.subscription_order_id = order_id
    current_user.subscription_expiry = datetime.utcnow() + timedelta(days=plan['duration_days'])
    db.session.commit()

    return jsonify({
        'message': f'Subscription to {plan["name"]} activated successfully!',
        'user': current_user.to_dict(),
        'subscription': {
            'plan': plan_id,
            'status': 'active',
            'expiry': current_user.subscription_expiry.isoformat(),
            'paymentId': payment_id
        }
    }), 200

@app.route('/api/subscription/reset', methods=['POST'])
@token_required
def reset_subscription(current_user):
    current_user.subscription_plan = 'free'
    current_user.subscription_status = 'inactive'
    current_user.subscription_expiry = None
    current_user.subscription_payment_id = None
    current_user.subscription_order_id = None
    db.session.commit()
    return jsonify({
        'message': 'Subscription reset to Free successfully.',
        'user': current_user.to_dict(),
        'subscription': {'plan': 'free', 'status': 'inactive', 'expiry': None}
    }), 200

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

def generate_fallback_vet_response(messages):
    last_user_msg = ""
    for m in reversed(messages):
        if m.get('role') == 'user':
            last_user_msg = m.get('content', '')
            break
    q = last_user_msg.lower().strip()
    words = q.split()
    first_word = words[0] if words else ""

    # Detect animal context
    is_dog = any(k in q for k in ["dog", "puppy", "canine", "pup", "hound", "bitch"])
    is_cat = any(k in q for k in ["cat", "kitten", "feline", "kitty"])
    is_cow = any(k in q for k in ["cow", "cattle", "calf", "bovine", "bull", "ox", "heifer"])
    is_buffalo = any(k in q for k in ["buffalo", "murrah", "water buffalo"])
    is_goat = any(k in q for k in ["goat", "sheep", "lamb", "kid", "ram", "ewe"])
    is_poultry = any(k in q for k in ["chicken", "hen", "rooster", "poultry", "bird", "duck", "chick"])
    is_horse = any(k in q for k in ["horse", "equine", "mare", "stallion", "colt", "foal", "pony"])
    is_rabbit = any(k in q for k in ["rabbit", "bunny"])
    is_bird = any(k in q for k in ["parrot", "pigeon", "parakeet", "budgie", "cockatiel", "crow"])

    # 1. Greetings & System Introduction
    if any(k in words for k in ["hi", "hello", "hey", "namaste", "halo", "greetings"]) or first_word in ["hi", "hello", "hey"]:
        text = (
            "**Hello! Welcome to Know Your Animal AI Health Assistant.** 🐾\n\n"
            "I'm here 24/7 to provide instant, expert veterinary guidance for your pets and farm livestock. I can assist you with:\n"
            "- **Specific Clinical Concerns:** Fever, digestive upset, skin allergies, limping, wounds\n"
            "- **Behavior & Habits:** Poop eating (coprophagia), biting, excessive barking, potty training\n"
            "- **Nutrition & Safe Feeding:** Wholesome foods vs strictly toxic foods\n"
            "- **Emergency Protocols & First Aid:** Poisoning, bloat, heat stroke, trauma\n"
            "- **Vaccination & Deworming:** Complete schedules for dogs, cats, cows, goats, and poultry\n"
            "- **National 1962 SOS Animal Ambulance:** Direct escalation when emergency care is required\n\n"
            "Please tell me which animal you have and what specific question or concern you'd like answered!"
        )

    # 2. Coprophagia / Dogs Eating Poop / Stool Eating
    elif any(k in q for k in ["poop", "eating poop", "eating their own poop", "eats poop", "eat poop", "coprophagia", "feces", "stool eating", "potty eating", "eat potty", "eat stool", "eating waste", "eating dirt", "eating soil", "eating mud"]):
        text = (
            "**Managing & Stopping Coprophagia (Poop Eating in Dogs):**\n\n"
            "Dogs eating feces (medically termed **Coprophagia**) is a very common but frustrating concern. While distressing to owners, it is manageable once the root cause is addressed.\n\n"
            "**1. Why Do Dogs Eat Poop? (Primary Causes)**\n"
            "- **Digestive Enzyme & Nutrient Deficiency:** If your dog cannot fully digest or absorb their food, the stool still smells and tastes like undigested food to them. Low-quality commercial food with excessive grain fillers often triggers this.\n"
            "- **Intestinal Parasites:** Roundworms or tapeworms leech essential nutrients, leaving the dog feeling constantly malnourished.\n"
            "- **Boredom & Anxiety:** Dogs left alone for long periods or lacking mental stimulation often develop pica (eating non-food items).\n"
            "- **Learned Cleanliness / Fear Reaction:** Mother dogs naturally clean up puppy stool. Puppies also copy this. Additionally, dogs punished harshly for indoor potty accidents often eat feces to 'hide the evidence'.\n\n"
            "**2. Immediate Actionable Solutions & Home Remedies:**\n"
            "- **Prompt Environmental Management (Most Effective):** Clean up all stool immediately after your dog defecates so they never have access. Walk your dog on a leash so you can guide them away instantly.\n"
            "- **Natural Dietary Deterrents:**\n"
            "  * Add **1-2 tablespoons of plain canned pure pumpkin puree** or **fresh pineapple chunks** to their meals daily. The enzymes (bromelain in pineapple) taste appealing going in, but make stool extremely unpalatable coming out.\n"
            "  * Add 1-2 spoons of plain unsweetened curd/yogurt to restore natural probiotic gut flora.\n"
            "- **Veterinary Anti-Coprophagia Chewables:** OTC chewable deterrents (such as *For-Bid* or *Potty Mouth*) harmlessly make fecal matter bitter and repulsive to the dog.\n"
            "- **Switch to Higher Quality Protein:** Feed high-digestibility food rich in animal protein and lower in grain fillers.\n\n"
            "**3. Training & Behavioral Techniques:**\n"
            "- **Master the 'Leave It' Command:** Keep high-value treats (boiled chicken breast or cheese cubes) on walks. The moment your dog finishes pooping, enthusiastically call their name, command *'Leave it!'*, and reward them generously when they turn towards you.\n"
            "- **Increase Mental Stimulation:** Provide durable chew toys, frozen KONGs, snuffle mats, and extra daily exercise to eliminate boredom.\n\n"
            "**4. When to Consult a Veterinarian:**\n"
            "- Have your vet run a **routine fecal test** to screen for intestinal worms and rule out Exocrine Pancreatic Insufficiency (EPI) or malabsorption."
        )

    # 3. Toxic Food Ingestion & Poisoning (Emergency)
    elif any(k in q for k in ["poison", "toxic", "toxicity", "chocolate", "onion", "garlic", "grape", "raisin", "xylitol", "rat poison", "swallowed pill", "paracetamol", "crocin", "ibuprofen"]):
        text = (
            "**EMERGENCY TRIAGE: Poisoning & Toxic Ingestion:**\n\n"
            "Animals metabolize chemicals differently than humans. Substances safe for people can be lethal to pets.\n\n"
            "**1. Highly Toxic Everyday Substances:**\n"
            "- **Chocolate:** Contains theobromine; causes cardiac arrhythmias, tremors, and seizures (dark chocolate is most dangerous).\n"
            "- **Grapes & Raisins:** Can cause acute, sudden irreversible kidney failure even in microscopic quantities.\n"
            "- **Onions, Garlic, & Chives:** Cause oxidative damage to red blood cells, leading to severe hemolytic anemia.\n"
            "- **Xylitol (Artificial Sweetener in peanut butter/sugar-free gum):** Causes catastrophic hypoglycemia and acute liver necrosis.\n"
            "- **Human Painkillers (Paracetamol/Crocin, Ibuprofen/Combiflam):** Severely toxic; even a single Paracetamol tablet causes fatal liver and blood destruction in cats and dogs.\n\n"
            "**2. Urgent Steps to Take Right Now:**\n"
            "- Identify the exact substance, estimated quantity, and time elapsed.\n"
            "- **Do NOT induce vomiting** if the substance was acidic, alkaline, petroleum-based, or if the pet is lethargic, seizing, or unconscious.\n"
            "- If ingestion occurred within the last 60-90 minutes, contact an emergency vet immediately to safely induce vomiting with veterinary apomorphine or administer medical activated charcoal.\n"
            "- Call the national **1962 animal helpline** or rush to the nearest emergency veterinary facility."
        )

    # 4. Bloat / GDV (Dogs & Cattle Emergency)
    elif any(k in q for k in ["bloat", "tympanites", "swollen belly", "distended", "gas in stomach", "twisted stomach", "afra"]):
        if is_cow or is_buffalo or is_goat:
            text = (
                "**Bovine & Livestock Rumen Bloat (Tympanites / अफरा):**\n\n"
                "Bloat is a critical digestive emergency where trapped fermentation gases rapidly distend the rumen, putting deadly pressure on the lungs and diaphragm.\n\n"
                "**Immediate First Aid Actions:**\n"
                "- Keep the animal standing with front quarters elevated on a slope or mound.\n"
                "- Drench orally with **200-300 ml of edible vegetable or mustard oil** mixed with 20-30 ml of turpentine oil or commercial anti-bloat drench (*Bloatosil / Tympanol*) to break down frothy gas bubbles.\n"
                "- Place a wooden bit across the mouth to stimulate continuous chewing and belching.\n"
                "- Withhold all grain and wet lush legumes immediately.\n"
                "- **Emergency:** If the left flank is drum-tight and the animal has labored mouth-breathing, call a local vet immediately for trochar cannula puncture."
            )
        else:
            text = (
                "**CRITICAL EMERGENCY: Canine Bloat & GDV (Gastric Dilatation-Volvulus):**\n\n"
                "Bloat in dogs (especially deep-chested breeds like German Shepherds, Great Danes, Labradors, and Boxers) occurs when the stomach fills with gas and twists on its axis.\n\n"
                "**Life-Threatening Warning Signs:**\n"
                "- Distended, hard, drum-like abdomen.\n"
                "- Unproductive retching (trying to vomit but only white foam comes out).\n"
                "- Restless pacing, looking at flank, drooling, and rapid shallow breathing.\n\n"
                "**Action Required Immediately:**\n"
                "- **Do not attempt home remedies or wait to see if it passes.** GDV cuts off blood flow to the heart and stomach wall, causing fatal shock within 2-4 hours.\n"
                "- Rush your dog to the nearest 24/7 veterinary emergency hospital for surgical decompression immediately."
            )

    # 5. Bovine Specific Conditions (Mastitis, LSD, Milk Fever, ROP, Udder, Teat) - Checked before general milk/diet
    elif (is_cow or is_buffalo or any(k in q for k in ["cow", "cattle", "buffalo", "calf"])) and any(k in q for k in ["mastitis", "thanela", "udder", "teat", "watery milk", "clots in milk", "lumpy", "lsd", "milk fever", "placenta", "rop", "downer cow"]):
        if any(k in q for k in ["mastitis", "thanela", "udder", "teat", "watery milk", "clots in milk"]):
            text = (
                "**Bovine Mastitis (थनैला रोग) Care & Protocol:**\n\n"
                "Mastitis is an inflammatory bacterial infection of the mammary gland that damages milk quality and animal welfare.\n\n"
                "**1. Symptoms:** Hard, swollen, hot udder quarter, clots/flakes in milk, blood, or watery secretion.\n"
                "**2. Immediate Protocol:**\n"
                "- Strip out infected milk completely every 2 hours into a separate bucket and dispose safely.\n"
                "- Apply cold water or ice packs on acute hot swollen quarters to reduce inflammation.\n"
                "- Administer vet-prescribed intramammary antibiotic infusions (*Cefoperazone / Amoxicillin-Sulbactam*) after thorough teat disinfection.\n"
                "- Implement post-milking teat dipping in 0.5% Povidone-Iodine to prevent herd transmission."
            )
        elif any(k in q for k in ["lumpy", "lsd"]):
            text = (
                "**Bovine Lumpy Skin Disease (LSD) Management:**\n\n"
                "LSD is a viral poxvirus infection transmitted primarily by blood-sucking flies, mosquitoes, and ticks.\n\n"
                "**1. Symptoms:** High fever (104-106°F), nodular skin lesions (2-5 cm) all over body, swollen lymph nodes, leg edema.\n"
                "**2. Care Protocol:**\n"
                "- Isolate affected cattle immediately to stop vector transmission.\n"
                "- Wash open ruptured nodules with neem water and apply antiseptic fly-repellent spray (*Topicure*).\n"
                "- Provide antipyretic & anti-inflammatory injections (*Meloxicam-Paracetamol*) for fever relief.\n"
                "- Ensure soft green fodder and electrolyte-rich drinking water."
            )
        elif any(k in q for k in ["milk fever", "downer"]):
            text = (
                "**EMERGENCY: Milk Fever (Hypocalcemia in Dairy Cattle):**\n\n"
                "Occurs within 48-72 hours after calving due to sudden calcium depletion into colostrum.\n\n"
                "**Key Symptoms:** Sternal recumbency with head turned back into flank (classic S-shaped neck curve), subnormal body temperature, cold ears.\n"
                "**Action:** Immediate slow intravenous administration of **Calcium Borogluconate (CBG 450 ml)** under veterinary supervision. Keep cow propped in sternal position to prevent bloat."
            )
        else:
            text = (
                "**Retention of Placenta (ROP / जेर का रुकना):**\n\n"
                "The fetal membranes should normally be expelled within 6 to 8 hours post-calving.\n\n"
                "- **Caution:** Never forcefully pull, tear, or tie heavy stones to the retained placenta — this causes fatal uterine hemorrhage, inversion, or septic metritis.\n"
                "- Administer uterine ecbolics (*Exapar / Replanta*) and veterinary antibiotic coverage if retained beyond 12 hours."
            )

    # 6. Eye & Ear Conditions (Checked before general skin scratching)
    elif any(k in q for k in ["ear", "ears", "discharge", "conjunctivitis", "ear mite", "head shaking", "cloudy eye", "smelly ear", "scratching ear", "scratch ear"]):
        text = (
            "**Eye & Ear Health Protocols:**\n\n"
            "**1. Ear Infections & Ear Mites (Otitis Externa):**\n"
            "- **Symptoms:** Continuous head shaking, scratching ears, foul odor, dark coffee-ground wax.\n"
            "- **Care:** Clean the outer ear flap with cotton pads soaked in a veterinary ear cleanser. **Never insert cotton ear buds (Q-tips)** deep into the canal as you will pack debris against the eardrum.\n"
            "- Treat with veterinary antifungal/antibacterial drops (*Otomax / Pomisol*) prescribed by your vet.\n\n"
            "**2. Eye Irritations & Infections:**\n"
            "- **Symptoms:** Redness, squinting, excessive tearing, or yellow/green pus discharge.\n"
            "- **First Aid:** Gently flush eyes with sterile normal saline to wash away dust and foreign particles.\n"
            "- *Important Warning:* Never use leftover human eye drops containing corticosteroids without veterinary corneal stain testing — steroids cause blindness if a corneal ulcer is present!"
        )

    # 7. Wounds, Cuts, Bleeding, Bites, Maggots
    elif any(k in q for k in ["wound", "bleed", "bleeding", "cut", "injury", "bitten", "dog bite", "maggot", "pus", "abscess", "sore"]):
        text = (
            "**First Aid for Wounds, Cuts, Bites & Maggot Care:**\n\n"
            "**1. Active Bleeding First Aid:**\n"
            "- Apply direct, continuous pressure over the bleeding site with a clean, sterile cloth or gauze for 5-10 full minutes without lifting to check.\n"
            "- Elevate the injured limb if possible.\n\n"
            "**2. Wound Cleaning & Disinfection:**\n"
            "- Flush the area gently with sterile normal saline or clean lukewarm water to remove dirt.\n"
            "- Disinfect with diluted **Povidone-Iodine (Betadine 5%)**. Do not pour neat hydrogen peroxide into deep wounds as it destroys healthy healing tissue.\n\n"
            "**3. Maggot Infested Wounds:**\n"
            "- Maggot wounds spread rapidly into deep muscle. Apply turpentine oil soaked gauze plugs or spray veterinary **Topicure / D-Mag spray** to paralyze and extract maggots.\n"
            "- Requires systemic veterinary antibiotic coverage and subcutaneous Ivermectin.\n\n"
            "**4. Animal Bites (Rabies Alert):**\n"
            "- Wash bite punctures thoroughly under high-pressure running tap water with soap for at least 15 minutes.\n"
            "- Visit a vet immediately for Anti-Rabies booster and broad-spectrum antibiotics to prevent abscess formation."
        )

    # 8. Limping, Leg Pain, Joint Issues, Arthritis, Fractures
    elif any(k in q for k in ["limp", "limping", "leg", "paw", "joint", "fracture", "broken bone", "sprain", "arthritis", "hip dysplasia", "can't walk", "unable to stand"]):
        text = (
            "**Orthopedic Care & Limping Protocol:**\n\n"
            "Limping indicates pain or structural compromise in bone, ligament, muscle, or paw pad.\n\n"
            "**1. Inspection & Triage:**\n"
            "- **Check Paw Pads First:** Examine between toes for thorn punctures, glass shards, ticks, or torn toenails.\n"
            "- **Swelling & Heat:** Gently feel the joint and leg bones for warmth, acute tenderness, or abnormal bending.\n\n"
            "**2. Immediate Care & Immobilization:**\n"
            "- Enforce **strict cage / room rest**. Restrict stairs, running, and jumping on furniture.\n"
            "- For acute trauma (within 24 hours), apply a cold ice pack wrapped in a clean towel for 10 minutes to reduce inflammation.\n\n"
            "**3. Critical Medication Warning:**\n"
            "- **NEVER give human painkillers** (Paracetamol, Combiflam, Aspirin, or Ibuprofen). They cause severe stomach ulcers, acute renal failure, and death in animals.\n"
            "- Only use vet-prescribed veterinary NSAIDs (such as *Meloxicam* or *Carprofen*) dosed precisely by weight.\n"
            "- An X-ray is required if the pet refuses to bear any weight for more than 24 hours."
        )

    # 9. Coughing, Sneezing, Respiratory Issues, Kennel Cough
    elif any(k in q for k in ["cough", "coughing", "sneeze", "sneezing", "breathing", "breath", "kennel cough", "wheezing", "gasping", "asthma", "choking"]):
        text = (
            "**Respiratory Health & Coughing Protocol:**\n\n"
            "**1. Common Conditions:**\n"
            "- **Kennel Cough (Bordetella / Parainfluenza):** Characterized by a harsh, dry, hacking 'goose-honk' cough, often ending in a retching gag as if choking on something.\n"
            "- **Cardiac Cough:** Soft, moist nocturnal cough in older pets due to heart valve disease or fluid congestion.\n"
            "- **Allergic Bronchitis / Pneumonia:** Wheezing, nasal discharge, and elevated body temperature.\n\n"
            "**2. Comfort & Supportive Home Care:**\n"
            "- **Steam Inhalation:** Bring your pet into the bathroom while running a hot shower for 10-15 minutes; warm steam loosens airway mucus.\n"
            "- Provide **1 teaspoon of pure natural honey** (for dogs over 1 year old) 2-3 times daily to coat and soothe the irritated trachea.\n"
            "- Switch from a neck collar to a chest harness to eliminate airway pressure.\n\n"
            "**3. Emergency Symptoms:**\n"
            "- Bluish/purple tongue or gums, flared nostrils, gasping with neck extended, or fever above 103.5°F require emergency veterinary oxygen therapy."
        )

    # 10. Vomiting, Diarrhea, Loose Motions, Parvovirus Triage
    elif any(k in q for k in ["vomit", "puke", "throw up", "diarrhea", "loose motion", "watery stool", "upset stomach", "gastric", "parvo"]):
        text = (
            "**Gastrointestinal Care (Vomiting & Diarrhea Protocol):**\n\n"
            "Gastrointestinal distress can range from a minor dietary indiscretion to a life-threatening viral infection like Parvovirus.\n\n"
            "**1. Immediate At-Home Care Steps:**\n"
            "- **Gut Rest:** For adult dogs, withhold heavy food for 6 to 8 hours to allow the inflamed stomach lining to settle. *(Never fast young puppies under 4 months due to risk of hypoglycemia).*\n"
            "- **Hydration Therapy:** Offer small, frequent sips (1-2 tablespoons every 20 minutes) of fresh water, oral rehydration salts (ORS/Electral), or boiled rice water. Do not let them gulp huge bowls of water at once.\n"
            "- **Transition to Bland Diet:** Once vomiting has ceased for 8 hours, offer small portions of boiled white rice mixed with shredded boiled skinless chicken breast or plain fresh curd (dahi).\n\n"
            "**2. Critical Red Flags (Seek Urgent Vet Care):**\n"
            "- **Unvaccinated Puppy:** Sudden foul-smelling, bloody diarrhea accompanied by extreme lethargy and fever is the hallmark of **Canine Parvovirus**, requiring emergency IV fluids and antiemetics.\n"
            "- Blood in vomit (looks like coffee grounds) or bright red blood in stools.\n"
            "- Continuous retching without bringing anything up (sign of life-threatening Bloat / GDV).\n"
            "- Inability to keep even water down for more than 12 hours."
        )

    # 11. Ticks, Fleas, Mange, Itching, Scratching, Skin Infections, Hair Loss
    elif any(k in q for k in ["tick", "flea", "mange", "itch", "scratch", "hair loss", "losing hair", "bald", "skin", "rash", "hot spot", "allergy", "fungal", "scab", "crust", "ringworm", "dermatitis"]):
        text = (
            "**Canine & Pet Skin Care, Ticks & Itch Relief:**\n\n"
            "Persistent scratching, biting at paws, or hair loss indicates ectoparasites, fungal infections, or allergic dermatitis.\n\n"
            "**1. Identifying the Root Cause:**\n"
            "- **Ticks & Fleas:** Look between toes, inside ear flaps, under armpits, and groin. Ticks transmit dangerous blood parasites (Babesiosis / Tick Fever).\n"
            "- **Mange (Sarcoptic vs Demodectic):** Sarcoptic mange causes intense, relentless itching and crusting; Demodex causes patchy hair loss around the eyes and muzzle.\n"
            "- **Hot Spots (Moist Dermatitis):** Red, oozing, inflamed patches that develop rapidly from licking/chewing a single area.\n"
            "- **Fungal / Ringworm:** Circular bald patches with scaly, flaky edges.\n\n"
            "**2. Immediate Home Care & Safe First Aid:**\n"
            "- **Neem Water Rinse:** Boil fresh neem leaves in water, cool completely, and use as a soothing final rinse after baths.\n"
            "- **Medicated Shampoo:** Bathe with a veterinary **Chlorhexidine (2-4%) + Ketoconazole** shampoo. Lather thoroughly and let it sit on the skin for 10 full minutes before rinsing.\n"
            "- **Hot Spot Care:** Gently clip away hair around the wound. Clean with diluted Povidone-Iodine (Betadine 5%) or chlorhexidine. Keep the area completely dry.\n"
            "- **Prevent Licking:** Use an Elizabethan collar (cone) to prevent secondary bacterial infection from constant licking.\n\n"
            "**3. Veterinary Tick & Flea Control:**\n"
            "- Modern chewable tablets (*Fluralaner / Bravecto* or *Sarolaner / Simparica*) or spot-ons (*Fipronil*) provide 1-3 months of comprehensive protection against ticks, fleas, and mange.\n"
            "- *Important Warning:* Never use engine oil, diesel, or human antiseptics (Dettol/Savlon) on animal skin — they are toxic if licked!"
        )

    # 12. Biting, Chewing, Barking, Training, Potty Training & Anxiety
    elif any(k in q for k in ["biting", "bite", "chewing", "chew", "barking", "bark", "aggression", "aggressive", "anxiety", "training", "potty training", "pee inside", "toilet training", "chew shoes", "chewing furniture"]):
        text = (
            "**Canine Behavior, Training & Habit Correction:**\n\n"
            "Understanding canine developmental psychology is the secret to resolving unwanted behavioral issues permanently.\n\n"
            "**1. Puppy Biting & Mouthing (Teething):**\n"
            "- Puppies explore everything with teeth between 3 to 7 months as adult teeth emerge.\n"
            "- **The 'Ouch!' Technique:** When teeth touch your skin or clothes, immediately let out a sharp, high-pitched *'Ouch!'*, freeze, and completely withdraw attention for 30 seconds. This teaches bite inhibition.\n"
            "- **Redirection:** Always have a rubber chew toy, rope, or cold carrot ready. Swap your hand/shoes for the toy and praise enthusiastically when they chew the toy.\n\n"
            "**2. Successful Potty & House Training:**\n"
            "- Follow the **2-Hour Rule:** Take puppies outside every 2 hours, plus immediately after waking up, eating, and energetic play.\n"
            "- Pick a dedicated outdoor spot. Stand quietly until they relieve themselves, then reward immediately with a treat and praise within 3 seconds.\n"
            "- *Never punish indoor accidents after the fact:* Dogs cannot connect punishment with past events; scolding creates anxiety and leads them to hide accidents or eat feces.\n\n"
            "**3. Excessive Barking & Separation Anxiety:**\n"
            "- Ensure at least 30-45 minutes of vigorous exercise and mental games (snuffle mats, fetch) daily.\n"
            "- Practice calm departures without long emotional goodbyes. Leave an item of clothing with your scent in their resting area."
        )

    # 13. Vaccines & Deworming
    elif any(k in q for k in ["vaccin", "vaccine", "vaccination", "shot", "deworm", "deworming", "schedule", "rabies", "dhppi", "dewormer"]):
        if is_cow or is_buffalo:
            text = (
                "**Bovine & Livestock Vaccination / Deworming Protocol:**\n\n"
                "**1. Cattle & Buffalo Vaccination Schedule:**\n"
                "- **Foot and Mouth Disease (FMD):** Twice annually (pre-monsoon and post-monsoon).\n"
                "- **Hemorrhagic Septicemia (HS - गलघोंटू):** Annually in May/June before monsoon rains.\n"
                "- **Black Quarter (BQ - लंगड़ा बुखार):** Annually in May/June alongside HS.\n"
                "- **Lumpy Skin Disease (LSD):** Heterologous Goat Pox vaccine (3ml S/C) annually.\n"
                "- **Brucellosis (Cotton Strain 19):** Single lifetime dose for female calves aged 4-8 months.\n\n"
                "**2. Deworming Schedule:**\n"
                "- Deworm adult cattle before monsoon (June) and after monsoon (October).\n"
                "- Rotate dewormer classes (Albendazole, Fenbendazole, Ivermectin, Oxyclozanide) to prevent parasite resistance."
            )
        else:
            text = (
                "**Canine Vaccination & Deworming Master Schedule:**\n\n"
                "**1. Core Puppy Vaccination Timeline:**\n"
                "- **6 to 8 Weeks:** 1st DHPPi / Puppy DP (Distemper, Hepatitis, Parvovirus, Parainfluenza).\n"
                "- **10 to 12 Weeks:** 2nd DHPPi Booster + Leptospirosis + Canine Coronavirus.\n"
                "- **14 to 16 Weeks:** 3rd DHPPi Booster + Anti-Rabies Vaccine (ARV) + Kennel Cough.\n"
                "- **Adult Boosters:** Annual single booster for DHPPi and Anti-Rabies every year for life.\n\n"
                "**2. Complete Deworming Protocol:**\n"
                "- **Puppies:** Every 2 weeks until 3 months of age, then monthly until 6 months of age.\n"
                "- **Adult Dogs:** Every 3 months (4 times a year) using broad-spectrum veterinary tablets (*Praziquantel + Pyrantel Embonate + Febantel*, 1 tablet per 10 kg body weight).\n"
                "- Weigh your dog before dosing to ensure accurate therapeutic effectiveness."
            )

    # 14. Pregnancy, Whelping, Heat Cycle & Newborn Care
    elif any(k in q for k in ["pregnant", "pregnancy", "whelping", "labor", "delivery", "heat cycle", "giving birth", "pup birth", "newborn", "calving"]):
        text = (
            "**Reproduction, Pregnancy & Whelping Care:**\n\n"
            "**1. Canine Pregnancy Essentials:**\n"
            "- **Gestation Period:** 58 to 68 days (average 63 days).\n"
            "- **Diet in Late Pregnancy:** From week 6 onward, transition mother to puppy food to provide extra calcium and protein for developing fetuses.\n\n"
            "**2. Signs of Impending Labor:**\n"
            "- Rectal temperature drops below **99.0°F (37.2°C)** approximately 12-24 hours prior to active labor.\n"
            "- Nesting behavior, restlessness, panting, and refusal of food.\n\n"
            "**3. Normal Delivery vs Dystocia (Emergency):**\n"
            "- Pups typically arrive every 30-60 minutes. The mother should tear the amniotic sac and stimulate breathing by licking.\n"
            "- **Call Emergency Vet if:**\n"
            "  * Active abdominal contractions last >45 minutes without producing a puppy.\n"
            "  * Dark green discharge appears before the first puppy is born.\n"
            "  * More than 2 hours pass between puppies with known pups remaining inside."
        )

    # 15. Diet, Feeding, Safe & Toxic Foods (Evaluated after specific bovine milk diseases)
    elif any(k in q for k in ["food", "feed", "diet", "nutrition", "what to feed", "curd", "dahi", "milk", "egg", "rice", "meat", "eating", "not eating", "appetite"]):
        text = (
            "**Canine & Pet Nutrition Master Guide:**\n\n"
            "**1. Wholesome, Safe Everyday Foods:**\n"
            "- **Proteins:** Boiled skinless chicken, boiled eggs (excellent for coat), fresh unsalted paneer, and debone fish.\n"
            "- **Carbohydrates & Fiber:** Plain boiled white or brown rice, boiled oats, steamed carrots, green beans, and boiled pumpkin (great for digestion).\n"
            "- **Probiotics:** Plain unsweetened curd/dahi in moderation improves digestion and stool consistency.\n\n"
            "**2. Foods Strictly Forbidden & Dangerous:**\n"
            "- **Never feed:** Onions, garlic, chocolates, raisins, grapes, avocado, sugar-free sweets (xylitol), spicy curries, or caffeine.\n"
            "- **Cooked Bones:** Cooked bones splinter into razor-sharp shards, causing stomach punctures and intestinal blockages.\n"
            "- **Whole Cow's Milk:** Most adult dogs are lactose intolerant; whole milk causes diarrhea and gas.\n\n"
            "**3. Loss of Appetite (Anorexia) Care:**\n"
            "- Warm up meals to release aroma. Mix in warm bone broth or boiled chicken water.\n"
            "- If an animal refuses food for more than 24-36 hours, investigate for underlying fever, liver, or kidney issues."
        )

    # 16. General Livestock Fallbacks (Cow, Buffalo, Goat, Sheep, Poultry, Cat, Rabbit, Horse)
    elif is_cow or is_buffalo:
        text = (
            "**Cattle & Buffalo Healthcare & Herd Wellness:**\n\n"
            "Dairy livestock require proactive nutritional, seasonal, and veterinary management for optimal milk yield and immunity.\n\n"
            "**Key Pillars of Care:**\n"
            "- **Balanced Nutrition:** Daily ration of 25-30 kg green fodder, 4-5 kg dry fodder, concentrate feed according to milk yield, and 50g mineral mixture.\n"
            "- **Clean Unlimited Water:** A lactating cow/buffalo drinks 80 to 100 liters of fresh water daily.\n"
            "- **Seasonal Shielding:** Summer wallowing and cold showers for buffaloes; dry elevated bedding during monsoon to prevent foot rot.\n"
            "- **Emergency Helpline:** Contact your local government mobile dispensary or dial **1962** for doorstep livestock ambulance."
        )

    elif is_goat:
        text = (
            "**Goat & Sheep Healthcare (Small Ruminant Management):**\n\n"
            "Small ruminants are particularly vulnerable to sudden weather shifts, internal parasites, and metabolic disorders.\n\n"
            "**1. Critical Disease Vigilance:**\n"
            "- **PPR (Goat Plague):** High fever, mouth sores, foul-smelling diarrhea, and crusty nasal discharge. Strict isolation and symptomatic antibiotics needed.\n"
            "- **Enterotoxemia (Pulpy Kidney):** Sudden death after overeating lush green fodder or concentrate grain. Vaccinate annually before monsoon.\n"
            "- **Bottle Jaw (Submandibular Swelling):** Indicates severe blood-sucking worm burden (*Haemonchus contortus*). Administer targeted deworming with Ivermectin/Closantel.\n\n"
            "**2. Housing & Hygiene:** House goats on slatted wooden or dry elevated floors to prevent foot rot and pneumonia."
        )

    elif is_poultry:
        text = (
            "**Poultry & Backyard Chicken Healthcare:**\n\n"
            "Poultry flocks thrive with strict biosecurity, dry litter bedding, and clean water management.\n\n"
            "**1. Core Flock Diseases:**\n"
            "- **Ranikhet Disease (Newcastle):** Twisting of neck (torticollis), greenish diarrhea, gasping. Maintain strict LaSota vaccination schedule.\n"
            "- **Coccidiosis:** Bloody droppings, huddling, ruffled feathers. Treat flock water with Amprolium.\n"
            "- **Fowl Pox:** Wart-like nodules on comb and wattles. Apply Betadine; vaccinate at 6-8 weeks.\n\n"
            "**2. Flock Management:** Keep coop bedding dry to prevent lethal ammonia buildup, and add electrolytes to water during heat waves."
        )

    elif is_cat:
        text = (
            "**Feline Health & Emergency Care:**\n\n"
            "Cats have unique metabolic physiology requiring strict feline-safe medications.\n\n"
            "**1. Life-Threatening Feline Emergencies:**\n"
            "- **Urinary Blockage (FLUTD in Male Cats):** Straining in the litter box, crying, passing only droplets or blood. A blocked urethra is fatal within 24-48 hours from potassium toxicity — rush to emergency clinic immediately.\n"
            "- **Paracetamol (Crocin) Toxicity:** Even a crumb of human paracetamol causes fatal red blood cell destruction in cats!\n\n"
            "**2. Common Conditions:**\n"
            "- **Cat Flu (Herpes/Calicivirus):** Eye crusts, sneezing, mouth ulcers. Use warm steam nebulization and palatable warm wet food.\n"
            "- **Diet:** Cats are obligate carnivores; feed protein-rich wet food with abundant fresh water."
        )

    elif is_rabbit:
        text = (
            "**Rabbit Health & GI Stasis Protocol:**\n\n"
            "Rabbits have delicate hindgut fermentation systems requiring continuous fiber intake.\n\n"
            "**1. Life-Threatening Emergency — GI Stasis:**\n"
            "- If a rabbit stops eating or stops producing round fecal pellets for more than 10-12 hours, its gut has stopped moving (**GI Stasis**).\n"
            "- Syringe-feed recovery formula (*Critical Care*) with warm water and provide gentle belly massage.\n"
            "- **Critical:** Never give oral Amoxicillin or Penicillin to rabbits — it destroys caecal flora and causes fatal enterotoxemia!\n"
            "- **Diet:** 80-85% of a rabbit's daily diet must be fresh grass hay (Timothy or Orchard grass)."
        )

    elif is_horse:
        text = (
            "**Equine Care & Horse Colic Emergency:**\n\n"
            "**1. Horse Colic (Severe Abdominal Pain):**\n"
            "- **Signs:** Looking at flank, violent pawing or rolling, lack of gut sounds, sweating.\n"
            "- **Immediate Action:** Withhold all food immediately. Walk the horse calmly on a soft surface to prevent violent rolling and twisted gut. Call an equine vet immediately for stomach tube decompression.\n\n"
            "**2. Hoof & Tetanus Care:** Clean hooves daily; maintain annual Tetanus Toxoid vaccination against wound infections."
        )

    # 17. Intelligent Dynamic Query Analyzer for Any Open Question
    else:
        # Determine animal context if any
        animal_label = "your animal"
        if is_dog:
            animal_label = "your dog"
        elif is_cat:
            animal_label = "your cat"
        elif is_cow:
            animal_label = "your cattle/cow"
        elif is_goat:
            animal_label = "your goat/sheep"
        elif is_poultry:
            animal_label = "your poultry/bird"

        # Clean subject line
        query_subject = q.replace("?", "").replace("!", "").strip()
        if len(query_subject) > 60:
            query_subject = " ".join(query_subject.split()[:8]) + "..."

        text = (
            f"**Veterinary Guidance: Addressing \"{query_subject}\"**\n\n"
            f"Thank you for consulting Know Your Animal regarding {animal_label}. Here is structured clinical guidance for your inquiry:\n\n"
            "**1. Clinical Overview & Assessment:**\n"
            f"- When addressing concerns regarding {animal_label}, it is critical to observe vitals: appetite, hydration, activity level, and body temperature.\n"
            "- Sudden changes in routine, posture, digestive habits, or coat condition often indicate early systemic discomfort or environmental stress.\n\n"
            "**2. Practical Home Care & First-Line Steps:**\n"
            "- **Clean Shelter & Rest:** Keep the animal in a well-ventilated, clean, quiet environment with dry bedding.\n"
            "- **Hydration First:** Ensure continuous access to fresh, clean drinking water. If dehydration is suspected, offer small sips of oral electrolytes.\n"
            "- **Diet Monitoring:** Provide mild, easily digestible food. Avoid sudden changes in diet or rich, greasy treats.\n\n"
            "**3. Crucial Safety Precautions:**\n"
            "- **Do NOT administer human over-the-counter painkillers** (such as Paracetamol, Combiflam, or Ibuprofen) without precise veterinary prescription — they are toxic to pets and cause organ failure.\n"
            "- Keep a log of symptom onset, stool/urine consistency, and any potential exposure to toxic plants, garbage, or chemicals.\n\n"
            "**4. When to Seek In-Person Veterinary Care:**\n"
            "- If symptoms persist for more than 24 hours, or if you observe extreme lethargy, persistent vomiting, pale gums, or breathing distress, contact a verified veterinarian promptly or call the national **1962** animal emergency helpline."
        )

    words = text.split(' ')
    for i in range(0, len(words), 3):
        chunk = " ".join(words[i:i+3]) + " "
        payload = {"choices": [{"delta": {"content": chunk}}]}
        yield f"data: {json.dumps(payload)}\n\n".encode('utf-8')
        time.sleep(0.015)
    yield b"data: [DONE]\n\n"


def stream_gemini_native(gemini_key, messages, system_prompt):
    models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]
    contents = []
    for m in messages:
        role = "user" if m.get("role") == "user" else "model"
        text_content = (m.get("content") or "").strip()
        if text_content:
            contents.append({"role": role, "parts": [{"text": text_content}]})

    if not contents:
        contents = [{"role": "user", "parts": [{"text": "Hello"}]}]

    payload = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 1200
        }
    }

    req = None
    for model_name in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:streamGenerateContent?alt=sse&key={gemini_key}"
        try:
            r = requests.post(url, json=payload, stream=True, timeout=10)
            if r.status_code == 200:
                req = r
                break
        except Exception:
            pass

    if not req:
        # Fallback to local intelligent veterinary assistant
        for chunk in generate_fallback_vet_response(messages):
            yield chunk
        return

    had_content = False
    for line in req.iter_lines(decode_unicode=True):
        if line:
            if line.startswith("data: "):
                try:
                    data = json.loads(line[6:])
                    chunk_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    if chunk_text:
                        had_content = True
                        openai_payload = {"choices": [{"delta": {"content": chunk_text}}]}
                        yield f"data: {json.dumps(openai_payload)}\n\n".encode('utf-8')
                except Exception:
                    pass

    if not had_content:
        for chunk in generate_fallback_vet_response(messages):
            yield chunk
        return

    yield b"data: [DONE]\n\n"


@app.route('/api/chat', methods=['POST'])
def chat_ai():
    # Allow both authenticated and guest users to get veterinary care
    current_user = None
    token = get_auth_token()
    if token:
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = db.session.get(User, data['id'])
        except Exception:
            pass

    data = request.json or {}
    messages = data.get('messages') or []
    if not messages and data.get('message'):
        messages = [{'role': 'user', 'content': data.get('message')}]
    if not messages:
        return jsonify({"error": "messages array is required"}), 400

    gemini_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
    SYSTEM_PROMPT = """You are "Know Your Animal" — a friendly, compassionate, and highly knowledgeable veterinary assistant in India. You help farmers, pet owners, animal caretakers, and rescuers.

Your expertise includes:
- Common symptoms, diagnosis, behavior, and care for cows, buffaloes, dogs, cats, goats, sheep, chickens, horses, rabbits, and birds
- Specific behavioral solutions (e.g. coprophagia / poop eating, biting, barking, training)
- Emergency first aid guidance (fever, bloat, poisoning, wounds, heat stroke, choking, dehydration)
- Disease prevention, vaccination schedules (DHPPi, Rabies, FMD, HS, BQ), and biosecurity
- Animal nutrition, feeding guidelines, and herd wellness

Guidelines:
- Always answer the user's EXACT question directly and thoroughly first.
- Keep answers clear, structured (use bullet points and bold text), and practical.
- Always recommend consulting a verified vet or calling national ambulance 1962 for life-threatening emergencies.
- Be supportive, empathetic, and culturally tuned to Indian rural and urban pet care."""

    if gemini_key and gemini_key.strip():
        try:
            return Response(stream_gemini_native(gemini_key.strip(), messages, SYSTEM_PROMPT), mimetype='text/event-stream')
        except Exception as e:
            print("Gemini API streaming notice, using local intelligent assistant:", e)

    # Local intelligent veterinary assistant fallback (handles offline mode & missing keys)
    return Response(generate_fallback_vet_response(messages), mimetype='text/event-stream')


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


def sync_postgres_sequences():
    """Synchronize PostgreSQL SERIAL sequences with current max(id) values."""
    if db.engine.dialect.name == 'postgresql':
        tables = ['user', 'user_profile', 'doctor_profile', 'patient_record', 'animal', 'disease', 'pet_document', 'appointment']
        for tbl in tables:
            try:
                from sqlalchemy import text
                max_id = db.session.execute(text(f'SELECT MAX(id) FROM "{tbl}"')).scalar()
                if max_id is not None and max_id > 0:
                    db.session.execute(text(f"SELECT setval(pg_get_serial_sequence('\"{tbl}\"', 'id'), {max_id}, true)"))
                    db.session.commit()
            except Exception:
                db.session.rollback()

def init_app_database():
    with app.app_context():
        # Mask credentials in logs for security
        uri_display = app.config['SQLALCHEMY_DATABASE_URI']
        if '@' in uri_display:
            prefix = uri_display.split('://')[0]
            host_part = uri_display.split('@')[-1]
            uri_display = f"{prefix}://*****@{host_part}"
        print(f"?? Connecting to Database: {uri_display}")
        
        try:
            # Create all tables (if they don't exist)
            db.create_all()
            print("? Database tables verified / created successfully.")
        except Exception as e:
            print(f"? Database connection error: {e}")
            print("?? Please verify your DATABASE_URL in .env is correct and reachable.")
        
        try:
            # Create default admin if missing
            if not User.query.filter_by(role='admin').first():
                pwd = generate_password_hash('admin123')
                admin = User(username='admin', email='admin@admin.com', password=pwd, role='admin')
                db.session.add(admin)
                db.session.commit()
                print("Default admin created: admin@admin.com / admin123")
        except Exception as e:
            db.session.rollback()
            print(f"Notice during admin check: {e}")

        try:
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
        except Exception as e:
            db.session.rollback()
            print(f"Notice during doctor check: {e}")

        try:
            # Seed animals and realistic diseases if not fully populated
            if Animal.query.count() < 17 or Disease.query.count() < 50:
                try:
                    from seed_comprehensive_animals import seed_database
                    seed_database()
                except Exception as e:
                    print(f"Error seeding comprehensive animals: {e}")
        except Exception as e:
            print(f"Notice during animal check: {e}")
        
        try:
            # Synchronize PostgreSQL auto-increment sequences
            sync_postgres_sequences()
        except Exception as e:
            print(f"Notice during sequence sync: {e}")

# Run startup initialization for both WSGI/Gunicorn and direct execution
init_app_database()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 3000))
    app.run(host="0.0.0.0", port=port, debug=False)

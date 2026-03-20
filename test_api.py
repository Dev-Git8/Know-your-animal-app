import requests
import json

base_url = "http://localhost:3000/api"

print("1. Testing Register")
res = requests.post(f"{base_url}/auth/register", json={
    "username": "tester",
    "email": "tester@example.com",
    "password": "password",
    "role": "user"
})
print("Register:", res.status_code, res.json())

session = requests.Session()

print("\n2. Testing Login")
res = session.post(f"{base_url}/auth/login-user", json={
    "email": "tester@example.com",
    "password": "password"
})
print("Login:", res.status_code, res.json())

print("\n3. Testing Get Profile")
res = session.get(f"{base_url}/auth/profile")
print("Profile GET:", res.status_code, res.json())

print("\n4. Testing Update Profile")
res = session.put(f"{base_url}/auth/profile", json={
    "name": "Super Tester"
})
print("Profile PUT:", res.status_code, res.json())

print("\n5. Testing Public Doctors")
res = session.get(f"{base_url}/auth/public/doctors")
print("Public Doctors GET:", res.status_code, res.json())

print("\n6. Testing Admin Login")
admin_session = requests.Session()
res = admin_session.post(f"{base_url}/admin/login-admin", json={
    "email": "admin@admin.com",
    "password": "admin123"
})
print("Admin Login:", res.status_code, res.json())

print("\n7. Testing Admin Get Users")
res = admin_session.get(f"{base_url}/admin/users")
print("Admin Users GET:", res.status_code, res.json())

print("\n8. Testing Create Animal")
res = requests.post(f"{base_url}/animals", json={
    "slug": "tiger",
    "name": "Bengal Tiger",
    "description": "Big cat"
})
print("Create Animal:", res.status_code, res.json())

print("\n9. Testing Get Animals")
res = requests.get(f"{base_url}/animals")
print("Get Animals:", res.status_code, res.json())

print("\n10. Testing Admin Get Doctors")
res = admin_session.get(f"{base_url}/admin/doctors")
print("Admin Get Doctors:", res.status_code, res.json())

print("\nAll main points tested!")

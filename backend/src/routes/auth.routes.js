const express = require("express");
const authController = require("../controllers/auth.controller");
const protect = require("../middlewares/auth.middleware");

const router = express.Router();

// Public routes
router.post("/register", authController.registerUser);
router.post("/login-user", authController.loginUser);
router.post("/login-doctor", authController.loginDoctor);
router.post("/logout", authController.logoutUser);

// Protected route (example)
router.get("/profile", protect, authController.getProfile);
router.put("/profile", protect, authController.updateProfile);

// Public doctor list
router.get("/public/doctors", async (req, res) => {
    try {
        const DoctorProfile = require("../models/DoctorProfile");
        let profiles = await DoctorProfile.find().populate("userId", "username email");
        
        if (profiles.length === 0) {
            // Sample data for demonstration
            profiles = [
                {
                    _id: "sample1",
                    doctorName: "Dr. Ramesh Kumar",
                    qualification: "BVSc & AH",
                    yearsOfExperience: 12,
                    specialization: "Large Animal Specialist",
                    clinicName: "Royal Veterinary Hospital",
                    location: "Bangalore",
                    contactNumber: "+91 9876543210",
                    email: "ramesh@vetscan.in",
                    availabilityStatus: "Available",
                    rating: 4.8,
                    profilePhoto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200"
                },
                {
                    _id: "sample2",
                    doctorName: "Dr. Priya Sharma",
                    qualification: "MVSc Surgery",
                    yearsOfExperience: 8,
                    specialization: "Pet Surgery Specialist",
                    clinicName: "Paws & Claws Clinic",
                    location: "Mysore",
                    contactNumber: "+91 9876543211",
                    email: "priya@vetscan.in",
                    availabilityStatus: "Busy",
                    rating: 4.9,
                    profilePhoto: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200"
                },
                {
                    _id: "sample3",
                    doctorName: "Dr. Arjun Patel",
                    qualification: "BVSc Medicine",
                    yearsOfExperience: 10,
                    specialization: "Livestock Health Expert",
                    clinicName: "Rural Vet Care Center",
                    location: "Hubli",
                    contactNumber: "+91 9876543212",
                    email: "arjun@vetscan.in",
                    availabilityStatus: "Available",
                    rating: 4.7,
                    profilePhoto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200"
                },
                {
                    _id: "sample4",
                    doctorName: "Dr. Sneha Rao",
                    qualification: "MVSc Path",
                    yearsOfExperience: 7,
                    specialization: "Poultry Disease Specialist",
                    clinicName: "Feather Health Clinic",
                    location: "Mangalore",
                    contactNumber: "+91 9876543213",
                    email: "sneha@vetscan.in",
                    availabilityStatus: "Offline",
                    rating: 4.6,
                    profilePhoto: "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200&h=200"
                },
                {
                    _id: "sample5",
                    doctorName: "Dr. Karthik Iyer",
                    qualification: "BVSc & AH",
                    yearsOfExperience: 9,
                    specialization: "Small Animal Medicine",
                    clinicName: "Happy Pets Hospital",
                    location: "Chennai",
                    contactNumber: "+91 9876543214",
                    email: "karthik@vetscan.in",
                    availabilityStatus: "Available",
                    rating: 4.8,
                    profilePhoto: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200"
                },
                {
                    _id: "sample6",
                    doctorName: "Dr. Meera Nair",
                    qualification: "MVSc Dairy",
                    yearsOfExperience: 11,
                    specialization: "Dairy Animal Specialist",
                    clinicName: "Milk-Way Vet Services",
                    location: "Kochi",
                    contactNumber: "+91 9876543215",
                    email: "meera@vetscan.in",
                    availabilityStatus: "Available",
                    rating: 4.9,
                    profilePhoto: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=200&h=200"
                }
            ];
        }
        res.json(profiles);
    } catch (err) {
        res.status(500).json({ message: "Error fetching doctors" });
    }
});

module.exports = router;

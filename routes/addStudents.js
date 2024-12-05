const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Degree = require("../models/Degree");

const router = express.Router();

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "college_photos",
        allowed_formats: ["jpg", "png", "jpeg"],
    },
});
const upload = multer({ storage });

// Render form
router.get("/", (req, res) => {
    res.render("addStudents", { success: req.flash("success"), error: req.flash("error") });
});

// Handle form submission
router.post("/", upload.single("photo"), async (req, res) => {
    try {
        const { rollno, department, year } = req.body;

        // Check if the roll number already exists
        const existingStudent = await Degree.findOne({ rollno });
        if (existingStudent) {
            // Flash error message and redirect if roll number exists
            req.flash("error", "Roll number already exists.");
            return res.redirect("/addStudents");
        }

        const photoUrl = req.file.path;

        // Save new student data
        const degree = new Degree({ rollno, department, year, photoUrl });
        await degree.save();

        // Flash success message
        req.flash("success", "Data saved successfully!");
        res.redirect("/viewStudents"); // Redirect to show the success message
    } catch (err) {
        console.error(err);

        // Flash error message
        req.flash("error", "Error saving data.");
        res.redirect("/addStudents"); // Redirect to show the error message
    }
});



module.exports = router;
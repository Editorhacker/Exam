const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Papers = require("../models/Papers");

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
        folder: "college_papers",
        allowed_formats: ["pdf", "jpg", "png", "jpeg"],
    },
});
const upload = multer({ storage });

// Render the upload form
router.get("/", (req, res) => {
    res.render("ExamDepartment/uploadPapers", { success: req.flash("success"), error: req.flash("error") });
});

// Handle form submission
router.post("/", upload.single("file"), async (req, res) => {
    try {
        const { department, year, subject, qpCode } = req.body;
        const fileUrl = req.file.path;

        // Save to database
        const paper = new Papers({ department, year, subject, qpCode, fileUrl });
        await paper.save();

        // Flash success message
        req.flash("success", "Paper uploaded successfully!");
        res.redirect("/uploadPapers");
    } catch (err) {
        console.error(err);

        // Flash error message
        req.flash("error", "Error uploading paper.");
        res.redirect("/uploadPapers");
    }
});

module.exports = router;

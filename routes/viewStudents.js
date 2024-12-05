const express = require("express");
const router = express.Router();
const Degree = require("../models/Degree");

// Render Students List
router.get("/", async (req, res) => {
    try {
        const students = await Degree.find(); // Fetch all students
        res.render("viewStudents", { students });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Delete Student
router.post("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete student by ID
        await Degree.findByIdAndDelete(id);

        // Flash success message
        req.flash("success", "Student deleted successfully!");
        res.redirect("/viewStudents");
    } catch (err) {
        console.error(err);
        req.flash("error", "Error deleting student.");
        res.redirect("/viewStudents");
    }
});

module.exports = router;

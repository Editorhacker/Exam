const express = require("express");
const Papers = require("../models/Papers");

const router = express.Router();

// Show all papers
router.get("/", async (req, res) => {
    try {
        const papers = await Papers.find(); // Fetch all papers from the database
        res.render("ExamDepartment/showPapers", { papers });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching papers");
    }
});

// Delete a paper
router.post("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await Papers.findByIdAndDelete(id); // Delete the paper by ID
        req.flash("success", "Paper deleted successfully!");
        res.redirect("/showPapers");
    } catch (err) {
        console.error(err);
        req.flash("error", "Error deleting paper.");
        res.redirect("/showPapers");
    }
});

module.exports = router;

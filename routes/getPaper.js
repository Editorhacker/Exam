const express = require("express");
const router = express.Router();
const Paper = require("../models/Papers"); // Import your Paper model

// Endpoint to fetch paper by QP code
router.get("/", async (req, res) => {
    console.log("Received request to fetch paper.");
    console.log("Query Parameters:", req.query);

    const { qpCode } = req.query;

    if (!qpCode) {
        console.log("Error: Missing qpCode in query parameters.");
        return res.status(400).json({ success: false, message: "QP Code is required" });
    }

    console.log(`Searching for paper with QP Code: ${qpCode}`);

    try {
        const paper = await Paper.findOne({ qpCode }); // Find the paper by QP code

        if (!paper) {
            console.log(`No paper found for QP Code: ${qpCode}`);
            return res.status(404).json({ success: false, message: "Paper not found" });
        }

        console.log(`Paper found for QP Code: ${qpCode}`);
        console.log("Paper Data:", paper);

        // Return the Cloudinary URL stored in the fileUrl field
        res.json({
            success: true,
            data: paper.fileUrl, // Return the URL of the paper image from Cloudinary
        });
    } catch (error) {
        console.error("Error fetching paper:", error.message);
        console.error("Stack Trace:", error.stack);

        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;

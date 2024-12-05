const express = require("express");
const router = express.Router();
const Student = require("../models/Student"); // Import the Student model


router.get("/submit", (req, res) => {
    res.send("okk");
})
// Handle the POST request to save student dat
router.post("/submit", (req, res) => {
    const { rollNumber, roomId, image } = req.body;

    if (!rollNumber || !roomId || !image) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: rollNumber, roomId, or image.",
        });
    }

    const newStudent = new Student({
        rollNumber,
        roomId,
        image,
    });

    newStudent.save()
        .then(() => {
            res.status(200).json({
                success: true,
                message: "Participant validated and added to the room successfully.",
            });
        })
        .catch((error) => {
            console.error("Error saving student:", error);
            res.status(500).json({
                success: false,
                message: "Error saving student.",
                error: error.message,
            });
        });
});



module.exports = router;

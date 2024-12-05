const express = require("express");
const router = express.Router();
const Room = require("../models/Room"); // Assuming you have a Room model
const Degree = require("../models/Degree"); // Using Degree model for participant info

// Render Room Page with Participants List
router.get("/:roomId", async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await Room.findById(roomId).populate("participants"); // Assuming participants are stored as references in the Room model

        if (!room) {
            return res.status(404).send("Room not found");
        }

        // Fetch the details of participants from Degree model (only the required fields)
        const participants = await Degree.find({ _id: { $in: room.participants } }).select('photoUrl department year');

        res.render("room", { room, participants });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Add Participant to Room
router.post("/:roomId/participants", async (req, res) => {
    try {
        const { roomId } = req.params;
        const { rollNo, department, year, photoUrl } = req.body;

        // Create a new participant in the Degree model
        const newParticipant = new Degree({
            rollNo,
            department,
            year,
            photoUrl,
        });

        // Save the new participant
        await newParticipant.save();

        // Add the new participant to the room's participant list
        const room = await Room.findById(roomId);
        room.participants.push(newParticipant._id);
        await room.save();

        // Emit the new participant to all clients in the room via Socket.IO
        const io = req.app.get('io'); // Assuming Socket.IO instance is set up
        io.to(roomId).emit("participantJoined", {
            roomId,
            participant: newParticipant,
        });

        res.redirect(`/room/${roomId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding participant");
    }
});

// Remove Participant from Room
router.post("/:roomId/participants/remove/:participantId", async (req, res) => {
    try {
        const { roomId, participantId } = req.params;

        // Remove the participant from the room's participant list
        const room = await Room.findById(roomId);
        room.participants.pull(participantId);
        await room.save();

        // Delete the participant from the Degree model
        await Degree.findByIdAndDelete(participantId);

        // Emit the participant removal to all clients in the room via Socket.IO
        const io = req.app.get('io');
        io.to(roomId).emit("participantLeft", { roomId, participantId });

        res.redirect(`/room/${roomId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error removing participant");
    }
});

module.exports = router;

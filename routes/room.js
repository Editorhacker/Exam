const express = require("express");
const router = express.Router();
const Room = require("../models/Room"); // Assuming you have a Room model
const Participant = require("../models/Degree"); // Assuming you have a Participant model

// Render Room Page with Participants List
router.get("/:roomId", async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await Room.findById(roomId).populate("participants"); // Fetch room and its participants

        if (!room) {
            return res.status(404).send("Room not found");
        }

        res.render("room", { room });
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

        // Create a new participant
        const newParticipant = new Participant({
            rollNo,
            department,
            year,
            photoUrl,
            joinTime: new Date(),
        });

        // Save the participant
        await newParticipant.save();

        // Add the participant to the room
        const room = await Room.findById(roomId);
        room.participants.push(newParticipant);
        await room.save();

        // Emit the new participant to all clients in the room via Socket.IO
        const io = req.app.get('io'); // Assuming you have Socket.IO set up on the app
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

        // Remove participant from the room
        const room = await Room.findById(roomId);
        room.participants.pull(participantId);
        await room.save();

        // Delete the participant from the database
        await Participant.findByIdAndDelete(participantId);

        // Emit the removed participant to all clients in the room via Socket.IO
        const io = req.app.get('io');
        io.to(roomId).emit("participantLeft", { roomId, participantId });

        res.redirect(`/room/${roomId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error removing participant");
    }
});

module.exports = router;

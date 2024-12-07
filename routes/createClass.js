const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const Degree = require("../models/Degree");

module.exports = (io) => {
    // Function to generate a unique random 5-character alphanumeric string
    async function generateUniqueRoomId() {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let roomId = "";
        let isUnique = false;

        while (!isUnique) {
            roomId = "";
            for (let i = 0; i < 5; i++) {
                roomId += characters.charAt(Math.floor(Math.random() * characters.length));
            }

            // Check if the generated roomId already exists in the database
            const existingRoom = await Room.findOne({ roomId });
            if (!existingRoom) {
                isUnique = true;
            }
        }

        return roomId;
    }

    // Render the create class form
    router.get("/", (req, res) => {
        res.render("Examiner/createClass");
    });

    // Handle room creation
    router.post("/", async (req, res) => {
        const { roomName } = req.body;
        const roomId = await generateUniqueRoomId();

        try {
            const newRoom = new Room({
                roomName,
                roomId,
            });

            console.log("New Room Data:", newRoom);
            await newRoom.save();

            io.emit("roomCreated", {
                room: newRoom,
                message: `New classroom "${roomName}" has been created`,
            });

            req.flash("success", "Classroom created successfully!");
            res.redirect("/createClass/showRooms");
        } catch (error) {
            console.error("Error creating room:", error);
            req.flash("error", "Failed to create classroom.");
            res.redirect("/createClass");
        }
    });

    // Show all created rooms
    router.get("/showRooms", async (req, res) => {
        try {
            const rooms = await Room.find().sort({ createdAt: -1 });
            res.render("Examiner/showRooms", {
                rooms,
                moment: require("moment"),
            });
        } catch (error) {
            console.error("Error fetching rooms:", error);
            req.flash("error", "Failed to fetch classrooms.");
            res.redirect("/");
        }
    });

    // Join a specific room
    router.get("/room/:roomId", async (req, res) => {
        try {
            const room = await Room.findOne({ roomId: req.params.roomId });
            if (!room) {
                req.flash("error", "Classroom not found!");
                return res.redirect("/createClass/showRooms");
            }
            res.render("Examiner/room", { room, moment: require("moment") });
        } catch (error) {
            console.error("Error finding room:", error);
            req.flash("error", "Failed to fetch classroom details.");
            res.redirect("/createClass/showRooms");
        }
    });

    // Delete a room
    router.post("/deleteRoom/:roomId", async (req, res) => {
        const { roomId } = req.params;

        try {
            const deletedRoom = await Room.findOneAndDelete({ roomId });
            if (deletedRoom) {
                io.emit("roomDeleted", { roomId });
                req.flash("success", `Room "${deletedRoom.roomName}" deleted successfully.`);
            } else {
                req.flash("error", "Room not found.");
            }
        } catch (error) {
            console.error("Error deleting room:", error);
            req.flash("error", "Failed to delete the room.");
        }

        res.redirect("/createClass/showRooms");
    });

    // Validate room ID and add a participant
    router.post("/validateRoom", async (req, res) => {
        const { rollNumber, roomId } = req.body;
        console.log("Validating Room ID:", roomId);

        try {
            const room = await Room.findOne({ roomId });
            if (!room) {
                console.error("Room not found:", roomId);
                return res.status(404).json({
                    success: false,
                    message: "Room not found.",
                });
            }
            console.log("Room found:", room);

            const student = await Degree.findOne({ rollno: rollNumber });
            if (!student) {
                console.error(`Student not found for roll number: ${rollNumber}`);
                return res.status(400).json({
                    success: false,
                    message: "Invalid roll number. Student not found.",
                });
            }
            console.log("Student details:", student);

            const participant = {
                rollNo: rollNumber,
                department: student.department,
                year: student.year,
                photoUrl: student.photoUrl,
                joinTime: new Date(),
            };

            room.participants.push(participant);
            await room.save();

            io.to(roomId).emit("participantJoined", { roomId, participant });
            io.to(roomId).emit("logUpdate", {
                roomId,
                participantRollNo: rollNumber,
                timestamp: new Date(),
                logMessage: `Participant with Roll No ${rollNumber} has joined the room.`,
            });

            return res.status(200).json({
                success: true,
                message: "Participant validated and added to the room successfully.",
                studentDetails: {
                    rollNumber: student.rollno,
                    department: student.department,
                    year: student.year,
                    photoUrl: student.photoUrl,
                },
            });
        } catch (error) {
            console.error("Error validating room or adding participant:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error.",
            });
        }
    });

    // Handle log updates from Android app
    router.post("/logUpdate", async (req, res) => {
        const { roomId, participantRollNo, logMessage } = req.body;

        try {
            io.to(roomId).emit("logUpdate", {
                roomId,
                participantRollNo,
                timestamp: new Date(),
                logMessage,
            });

            return res.status(200).json({
                success: true,
                message: "Log update received and sent to clients.",
            });
        } catch (error) {
            console.error("Error receiving log update:", error);
            return res.status(500).json({
                success: false,
                message: "Error processing log update.",
            });
        }
    });

    return router;
};

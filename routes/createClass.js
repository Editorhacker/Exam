// Import the Log model
const Log = require("../models/Log");

router.post("/validateRoom", async (req, res) => {
    const { rollNumber, roomId } = req.body;
    console.log("Validating Room ID:", roomId);

    try {
        // Step 1: Validate the room
        const room = await Room.findOne({ roomId });
        if (!room) {
            console.error("Room not found:", roomId);
            return res.status(404).json({
                success: false,
                message: "Room not found.",
            });
        }
        console.log("Room found:", room);

        // Step 2: Validate the student
        const student = await Degree.findOne({ rollno: rollNumber });
        if (!student) {
            console.error(`Student not found for roll number: ${rollNumber}`);
            return res.status(400).json({
                success: false,
                message: "Invalid roll number. Student not found.",
            });
        }
        console.log("Student details:", student);

        // Step 3: Fetch logs associated with the student
        const logs = await Log.find({ rollNumber });
        console.log("Fetched logs for student:", logs);

        // Step 4: Transform logs into the desired format (only `event` and `timestamp`)
        const participantLogs = logs.map((log) => ({
            event: log.event,
            timestamp: log.timestamp,
        }));

        // Step 5: Add the validated participant with logs to the room
        const participant = {
            rollNo: rollNumber,
            department: student.department,
            year: student.year,
            photoUrl: student.photoUrl,
            joinTime: new Date(),
            logs: participantLogs, // Attach fetched logs
        };

        room.participants.push(participant);
        await room.save();

        console.log("Updated Room Data After Adding Participant:", room);

        // Emit event for real-time updates
        io.emit("participantJoined", { roomId, participant });

        return res.status(200).json({
            success: true,
            message: "Participant validated and added to the room successfully.",
            studentDetails: {
                rollNumber: student.rollno,
                department: student.department,
                year: student.year,
                photoUrl: student.photoUrl,
                logs: participantLogs, // Include logs in the response
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

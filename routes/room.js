const Degree = require("../models/Degree");

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("A user connected");

        socket.on("joinRoom", async (data) => {
            const { roomId, rollNo } = data;

            try {
                // Find the user by roll number
                const user = await Degree.findOne({ rollno: rollNo });
                if (user) {
                    // Join the room
                    socket.join(roomId);

                    // Emit user data to the room
                    io.to(roomId).emit("participantJoined", {
                        rollNo: user.rollno,
                        department: user.department,
                        year: user.year,
                        photoUrl: user.photoUrl,
                        joinTime: new Date(),
                    });

                    console.log(`User with roll no ${rollNo} joined room: ${roomId}`);
                } else {
                    // Emit error if roll number is not found
                    socket.emit("error", { message: "Roll number not found." });
                }
            } catch (err) {
                console.error("Error fetching user:", err);
                socket.emit("error", { message: "Server error. Please try again later." });
            }
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });
    });
};

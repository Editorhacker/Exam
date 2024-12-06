const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
    roomName: { type: String, required: true },
    roomId: { type: String, unique: true, required: true },
    createdAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    participants: [
        {
            rollNo: { type: String, required: true },
            department: { type: String },  // Department of the student
            year: { type: String },  // Year of the student
            photoUrl: { type: String },  // URL to the student's photo
            joinTime: { type: Date, default: Date.now },  // Time the student joined
        },
    ],
});

module.exports = mongoose.model("Room", RoomSchema);

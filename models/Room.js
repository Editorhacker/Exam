// models/Room.js
const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
    roomName: { type: String, required: true },
    roomId: { type: String, unique: true, required: true },
    createdAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    participants: [
        {
            rollNo: { type: String },
            joinTime: { type: Date, default: Date.now },
        },
    ],
});

module.exports = mongoose.model("Room", RoomSchema);

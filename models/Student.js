const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    rollNumber: { type: String, required: true },
    roomId: { type: String, required: true },
    image: { type: String, required: true }, // Base64-encoded image
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;

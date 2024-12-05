const mongoose = require("mongoose");

const degreeSchema = new mongoose.Schema({
    rollno: String,
    department: String,
    year: String,
    photoUrl: String,
});

const Degree = mongoose.model("Degree", degreeSchema);

module.exports = Degree;

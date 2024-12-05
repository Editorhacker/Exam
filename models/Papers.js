const mongoose = require("mongoose");

const papersSchema = new mongoose.Schema({
    department: { type: String, required: true },
    year: { type: String, required: true },
    subject: { type: String, required: true },
    qpCode: { type: String, required: true },
    fileUrl: { type: String, required: true }, // URL of the uploaded file
});

module.exports = mongoose.model("Papers", papersSchema);

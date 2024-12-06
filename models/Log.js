// models/Log.js
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    event: String,
    timestamp: { type: Date, default: Date.now },
    roomId: String, // You can associate logs with rooms if needed
});

const Log = mongoose.model('Log', logSchema);
module.exports = Log;

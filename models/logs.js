const mongoose = require('mongoose');

// Define the schema for logs
const logSchema = new mongoose.Schema({

  roomId: {
    type: String,
    required: true,
  },
  rollNumber: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create the Log model
const Log = mongoose.model('Log', logSchema);

module.exports = Log;

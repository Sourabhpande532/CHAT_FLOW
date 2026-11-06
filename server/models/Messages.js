const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true, trim: true },
    receiver: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Compound indexes for fast conversation queries and read-receipt updates
messageSchema.index({ sender: 1, receiver: 1, createdAt: 1 });
messageSchema.index({ sender: 1, receiver: 1, read: 1 });

module.exports = mongoose.model("Messages", messageSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = Schema({
  fromUserId: {
    type: String,
    required: true,
  },
  toUserId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: new Date(),
  },
  content: {
    type: String,
    required: true,
  },
  isUnread: {
    type: Boolean,
    required: true,
    default: true
  }
});

module.exports = mongoose.model("Message", MessageSchema);

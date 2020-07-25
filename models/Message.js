const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = Schema({
  userName: {
      type: String,
      required: true
  },
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
});

module.exports = mongoose.model("Message", MessageSchema);

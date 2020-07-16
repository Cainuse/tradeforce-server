const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = Schema({
  userId: {
    type: String,
    required: true,
  },
  type: {
    type: String, // newOffering, offeringRejected, offeringAccepted
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
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

module.exports = mongoose.model("Notification", NotificationSchema);

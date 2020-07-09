const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const OfferingSchema = Schema({
  comment: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  itemTitle: {
    type: String,
    required: true,
  },
  itemCondition: {
    type: String,
    required: true,
  },
  itemDescription: {
    type: String,
  },
  userId: {
    type: String,
    required: true,
  },
  postingId: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
});

let model = mongoose.model("Offering", OfferingSchema);

module.exports = model;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Item = Schema({
  category: {
    type: String,
  },
  condition: {
    type: String,
  },
  description: {
    type: String,
  },
  images: {
    type: [String],
  },
  nameOfItem: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
});

const OfferingSchema = Schema({
  comment: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: new Date(),
  },
  offeredItems: {
    type: [Item],
    default: [],
  },
  userId: {
    type: String,
    required: true,
  },
  postingId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

let model = mongoose.model("Offering", OfferingSchema);

module.exports = model;

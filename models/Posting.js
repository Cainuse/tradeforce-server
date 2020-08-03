const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Location = require("../models/User").Location;
const PostingSchema = Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: new Date(),
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  tags: {
    type: [String],
  },
  requestedItems: [String],
  images: [String],
  ownerId: {
    type: String,
    required: true,
  },
  location: Location,
  active: {
    type: Boolean,
    default: true,
  },
  offerings: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Offering",
      },
    ],
    default: [],
  },
});

PostingSchema.index({
  title: "text",
  description: "text",
  category: "text",
  condition: "text",
  tags: "text",
});

const model = mongoose.model("Posting", PostingSchema);

module.exports = model;

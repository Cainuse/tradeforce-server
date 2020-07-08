const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PostingSchema = Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
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
  ownerUsername: String, 
  location: String,
  active: {
    type: Boolean,
    default: true
  }
});

PostingSchema.index({
  title: "text",
  description: "text",
  category: "text",
  condition: "text",
  tags: "text",
});

let model = mongoose.model("Postings", PostingSchema);

module.exports = model;

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
  tags: [String],
  requestedItems: [String],
  // imgSrc: {
  //   data: Buffer,
  //   contentType: String,
  // },
  ownerId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Posting", PostingSchema);

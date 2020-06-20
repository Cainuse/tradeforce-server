const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PostingSchema = Schema({
  _id: Schema.Types.ObjectId,
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: String,
  category: String,
  condition: String,
  quantity: Number,
  tags: [String],
  requestedItem: [String],
  imgSrc: {
    data: Buffer,
    contentType: String,
  },
  ownerId: Number,
  postalCode: String,
  offerings: [],
});

module.exports = mongoose.model("Posting", PostingSchema);

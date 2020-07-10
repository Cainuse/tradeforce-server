const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = Schema({title: String, review: String, rating: Number, reviewUsername: String})

const UserSchema = Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: String,
  // postalCode: String,
  location: {
    type: String,
    default: "Vancouver, BC"
  },
  dateRegistered: {
    type: Date,
    default: Date.now,
  },
  isGoogleUser: {
    type: Boolean,
    required: true
  },
  profilePic: {
    type: String,
    default: ""
  },
  reviews: {
    type: [ReviewSchema],
    default: []
  }
});

module.exports = mongoose.model("User", UserSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = Schema({
  title: String,
  review: String,
  rating: {
    type: Number,
    required: true,
  },
  reviewUsername: {
    type: String,
    required: true,
  },
});

const UserSchema = Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    default: "V7Y 1G5", // pacific center postal code
  },
  location: {
    type: String,
    default: "Vancouver, BC",
  },
  dateRegistered: {
    type: Date,
    default: Date.now,
  },
  isGoogleUser: {
    type: Boolean,
    required: true,
  },
  profilePic: {
    type: String,
    default: "",
  },
  reviews: {
    type: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    default: [],
  },
});

const User = mongoose.model("User", UserSchema);
const Review = mongoose.model("Review", ReviewSchema);

module.exports = {
  User,
  Review,
};

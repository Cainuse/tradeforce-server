const mongoose = require("mongoose");
const { boolean } = require("@hapi/joi");
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

const Location = Schema({
  location: String,
  lat: Number,
  lon: Number,
});

const UserSchema = Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    default: "",
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
    type: Location,
  },
  dateRegistered: {
    type: Date,
    default: new Date(),
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
  isOnline: {
    type: Boolean,
    default: false,
  },
  socketId: {
    type: String,
    default: "",
  },
});

const User = mongoose.model("User", UserSchema);
const Review = mongoose.model("Review", ReviewSchema);

module.exports = {
  User,
  Review,
  Location,
};

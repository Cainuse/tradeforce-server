const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    required: true
  },
  profilePic: String,
  reviews: [{title: String, review: String, rating: Number}]
});

module.exports = mongoose.model("User", UserSchema);

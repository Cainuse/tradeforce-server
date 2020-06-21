const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = Schema({
  userName: {
    type: String,
    required: true,
  },
  email: String,
  password: String,
  postalCode: String,
  dateRegistered: {
    type: Date,
    default: Date.now,
  },
  // profilePic: {
  //   data: Buffer,
  //   contentType: String,
  // },
});

module.exports = mongoose.model("User", UserSchema);

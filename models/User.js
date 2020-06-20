const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = Schema({
  _id: Schema.Types.ObjectId,
  userName: String,
  email: String,
  password: String,
  postalCode: String,
  dateRegistered: Date,
});

module.exports = mongoose.model("User");

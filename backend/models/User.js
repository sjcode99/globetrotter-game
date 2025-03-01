const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: String,
  referralCode: { type: String, unique: true },
  correct: Number,
  incorrect: Number,
  referredBy: String, // Stores the referral code of the user who referred them
});

const User = mongoose.model("User", UserSchema);

module.exports = User;

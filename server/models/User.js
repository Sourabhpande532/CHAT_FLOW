const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

/* ON THIS PRE-SAVED SCHEMA:
   -> Some provision we can write methods on particular Schema
   -> Used during login check this methods
   -> password - comes from user end(req.body) & this.password - this already stored/present in db password we match it and move ahead.
   Then it start to compare and give result form of true/false
 */

const User = mongoose.model("User", UserSchema);
module.exports = User;

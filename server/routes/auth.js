const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const dotenv = require("dotenv");
const router = express.Router();
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/register", async (req, res) => {
  const rawUsername = typeof req.body?.username === "string" ? req.body.username.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!rawUsername || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  if (rawUsername.length < 3) {
    return res.status(400).json({ message: "Username must be at least 3 characters." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  try {
    const existingUser = await User.findOne({ username: rawUsername });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists. Please Login" });
    }
    // Salt and hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({ username: rawUsername, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "6h" });
    res.status(201).json({
      success: true,
      message: "Registered successfully",
      token,
      username: rawUsername,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/login", async (req, res) => {
  const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found." });
    // Compare provided password with hashed password stored in DB
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch)
      return res.status(400).json({ message: "Invalid Credentials" });
    res.status(200).json({
      success: true,
      message: "Login successful",
      username: user.username,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error while login",
    });
  }
});

module.exports = router;

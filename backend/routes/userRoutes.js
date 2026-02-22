const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// CREATE USER
router.post("/", auth, async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

// READ ALL USERS
router.get("/", auth, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// UPDATE USER
router.put("/:id", auth, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(user);
});

// DELETE USER
router.delete("/:id", auth, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.send("User Deleted");
});

module.exports = router;
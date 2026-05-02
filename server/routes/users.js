const router = require("express").Router();
const User = require("../models/User");
const { auth } = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;

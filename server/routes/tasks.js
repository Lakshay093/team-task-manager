const router = require("express").Router();
const Task = require("../models/Task");
const { auth, isAdmin } = require("../middleware/auth");

router.post("/", auth, isAdmin, async (req, res) => {
  try {
    const task = await Task.create(req.body);
    req.app.get("io").emit("taskUpdated", task);
    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/", auth, async (req, res) => {
  const tasks = await Task.find().populate("assignedTo project");
  res.json(tasks);
});

router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    req.app.get("io").emit("taskUpdated", task);
    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.delete("/:id", auth, isAdmin, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    req.app.get("io").emit("taskDeleted", req.params.id);
    res.json({ msg: "Task removed" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
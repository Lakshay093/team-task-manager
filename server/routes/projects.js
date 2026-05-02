const router = require("express").Router();
const Project = require("../models/Project");
const { auth, isAdmin } = require("../middleware/auth");

router.post("/", auth, isAdmin, async (req, res) => {
  const project = await Project.create(req.body);
  res.json(project);
});

router.get("/", auth, async (req, res) => {
  const projects = await Project.find().populate("members");
  res.json(projects);
});

module.exports = router;
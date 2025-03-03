const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");

router.post("/track", async (req, res) => {
  const { username, website, timeSpent } = req.body;
  let activity = await Activity.findOne({ username, website });
  if (activity) {
    activity.timeSpent += timeSpent;
    await activity.save();
  } else {
    activity = new Activity({ username, website, timeSpent });
    await activity.save();
  }
  res.send("Activity Tracked");
});


router.get("/report/:username", async (req, res) => {
  const activities = await Activity.find({ username: req.params.username });
  res.json(activities);
});

module.exports = router;
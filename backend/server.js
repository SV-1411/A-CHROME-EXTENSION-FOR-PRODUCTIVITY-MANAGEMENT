const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/productivityDB");

const userRoutes = require("./routes/userRoutes");
const activityRoutes = require("./routes/activityRoutes");

app.use("/user", userRoutes);
app.use("/activity", activityRoutes);

app.get("/activity/report/:username", async (req, res) => {
  try {
    const activities = await Activity.find({ username: req.params.username });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "Error fetching activity report" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));

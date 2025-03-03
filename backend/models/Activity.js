const mongoose = require("mongoose");
const ActivitySchema = new mongoose.Schema({ username: String, website: String, timeSpent: Number });
module.exports = mongoose.model("Activity", ActivitySchema);
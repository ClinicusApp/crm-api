// Use this as a template
const mongoose = require("mongoose");
const schema = mongoose.Schema({
  alias: String,
  serial_number: String,
  appointment_date: Date,
  created: { type: Date, default: Date.now },
});
module.exports = mongoose.model("appointment", schema);
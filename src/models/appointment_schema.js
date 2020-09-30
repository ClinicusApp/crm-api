// Use this as a template
const mongoose = require("mongoose");
const schema = mongoose.Schema({
  patient_id: String,
  professional_id: String,
  appointment_date: Date,
  alias: String,
  serial_number: String,
  created: { type: Date, default: Date.now },
});
module.exports = mongoose.model("appointment", schema);
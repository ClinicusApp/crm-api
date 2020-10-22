const mongoose = require("mongoose");

const specializationsSchema = mongoose.Schema({
  specialization: String,
})

const schema = mongoose.Schema({
  avatars: String,
  username: String,
  email: String,
  first_name: { type: String, default: "" },
  last_name: { type: String, default: "" },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  password: String,

  status: { data: String, type: String, default: "not_activate" },
  activated_token: { type: String, default: "" },
  resetPasswordToken: { type: String, default: "" },

  level: { type: String, default: "staff" },
  specializations: [specializationsSchema],

  // identification props
  RG: { type: String, default: "" },
  CPF: { type: String, default: "" },

  // professional props
  CRP: { type: String, default: "" },
  description: { type: String, default: "" },

  created: { type: Date, default: Date.now },
});
 
schema.index({ email: 1 }, { unique: true });
module.exports = mongoose.model("users", schema);
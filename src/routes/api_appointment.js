// Use this as a template
const express = require("express");
const router = express.Router();
const Appointment = require("../models/appointment_schema");
// new api endpoint start here

// INDEX operation
router.get("/appointment", async (req, res) => {
  try {
    let data = await Appointment.find({}).sort({ created: -1 });
    res.json({
      result: "success",
      message: "Fetch Appointment data Successfully",
      data: data,
    });
  } catch (err) {
    res.json({ result: "error", message: err.msg });
  }
});

// CREATE operation
router.post("/appointment", async (req, res) => {
  try {
    let doc = await Appointment.create(req.body);
    console.log(doc)
    console.log(req.body)
 
    res.json({
      result: "success",
      message: "Create new data Successfully",
    });
  } catch (err) {
    res.json({ result: "error", message: err.errmsg });
  }
});

// UPDATE operation
// Find By Id
router.get("/appointment/:id", async (req, res) => {
  try {
    let data = await Appointment.findById({ _id: req.params.id });
    res.json({
      result: "success",
      message: "Fetch Single data Successfully",
      data: data,
    });
  } catch (err) {
    res.json({ result: "error", message: err.msg });
  }
});

// Then Update
router.put("/appointment", async (req, res) => {
  try {
    let doc = await Appointment.findByIdAndUpdate(
      { _id: req.body._id },
      req.body
    );
 
    res.json({
      result: "success",
      message: "Update data Successfully",
    });
  } catch (err) {
    res.json({ result: "error", message: err.msg });
  }
});

// DELETE operation
router.delete("/appointment/:id", async (req, res) => {
  try {
    let response = await Appointment.findOneAndDelete({ _id: req.params.id });

    res.json({
      result: "success",
      message: "Delete POS data Successfully",
    });
  } catch (err) {
    res.json({ result: "error", message: err.msg });
  }
});

module.exports = router;
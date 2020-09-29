// Use this as a template
const express = require("express");
const router = express.Router();
const User = require("../models/user_schema");
const axios = require('axios');
// new api endpoint start here

// INDEX operation
router.get("/fetchUser/:level", async (req, res) => {
  try {
    let data = await User.find({ level: req.params.level }).sort({ created: -1 });
    res.json({
      result: "success",
      message: "Fetch Users data Successfully",
      data: data,
    });
  } catch (err) {
    res.json({ result: "error", message: err.msg });
  }
});

// CREATE operation
// router.post("/crud", async (req, res) => {
//   try {
//     let doc = await CRUD.create(req.body);
 
//     res.json({
//       result: "success",
//       message: "Create new data Successfully",
//     });
//   } catch (err) {
//     res.json({ result: "error", message: err.errmsg });
//   }
// });

// Find By Level Users
router.get("/fetchUser/:level", async (req, res) => {
  try {
    let data = User.find({ _id: req.params.level });
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
// router.put("/crud", async (req, res) => {
//   try {
//     let doc = await CRUD.findByIdAndUpdate(
//       { _id: req.body._id },
//       req.body
//     );
 
//     res.json({
//       result: "success",
//       message: "Update data Successfully",
//     });
//   } catch (err) {
//     res.json({ result: "error", message: err.msg });
//   }
// });

// DELETE operation
// router.delete("/crud/:id", async (req, res) => {
//   try {
//     let response = await CRUD.findOneAndDelete({ _id: req.params.id });

//     res.json({
//       result: "success",
//       message: "Delete POS data Successfully",
//     });
//   } catch (err) {
//     res.json({ result: "error", message: err.msg });
//   }
// });

module.exports = router;
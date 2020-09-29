const express = require("express")
const router = express.Router()
require("../utils/db")
router.use(require("./api_auth"))
router.use(require("./api_crud"))
router.use(require("./api_user"))
module.exports = router
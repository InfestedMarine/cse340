const express = require("express")
const router = express.Router()
const errorController = require("../controllers/errorController")

// route that intentionally throws an error
router.get("/trigger-error", errorController.triggerError)

module.exports = router
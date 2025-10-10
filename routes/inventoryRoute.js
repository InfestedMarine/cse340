// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to inventory management views
router.get("/", invController.buildManagement)

// Route to add inventory views
router.get("/add-inventory", invController.buildAddInventory)
router.post("/add-inventory", invController.addInventory)

// Route to add classification views
router.get("/add-classification", invController.buildAddClassification)
router.post("/add-classification", invController.addClassification)

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build a vehicle detail view
router.get("/detail/:inv_id", invController.buildById);

module.exports = router;
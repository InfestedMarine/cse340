// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const { newInventoryRules, checkUpdateData } = require("../utilities/inventory-validation")

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

// Route for getting inventory JSON data
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to show the edit inventory form
router.get("/edit/:inv_id", utilities.checkJWTToken, utilities.checkAdminOrEmployee, utilities.handleErrors(invController.editInventoryView))

// Route to process updates to an existing inventory item
router.post("/update",newInventoryRules(),checkUpdateData, utilities.handleErrors(invController.updateInventory))

// Deliver delete confirmation view
router.get("/delete/:inv_id", invController.deleteInventoryView);

// Handle actual delete
router.post("/delete", invController.deleteInventory);


module.exports = router;
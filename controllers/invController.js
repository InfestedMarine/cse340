const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { buildClassificationList } = utilities

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("inventory/classification.ejs", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* **************************************
* Build vehicle detail view by ID
* ************************************ */
invCont.buildById = async function (req, res, next) {
  const invId = req.params.inv_id
  const vehicle = await invModel.getVehicleById(invId)  // ✅ directly get vehicle
  let nav = await utilities.getNav()

  res.render("inventory/detail", {
    title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    vehicle
  })
}

/* ***************************
 *  Deliver add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null
  })
}

/* ***************************
 *  Handle add classification POST
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const nav = await utilities.getNav()
  const { classification_name } = req.body

  const result = await invModel.addClassification(classification_name)
  if (result) {
    req.flash("notice", `"${classification_name}" added successfully.`)
    return res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      message: req.flash("notice")
    })
  } else {
    req.flash("notice", "Failed to add classification.")
    return res.status(500).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null
    })
  }
}

/* ****************************************
*  Deliver inventory management view
* *************************************** */
invCont.buildManagement = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    message: req.flash("notice")
  })
}

/* ***************************
 *  Deliver add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classifications = await invModel.getClassifications() // For dropdown list
  res.render("inventory/add-inventory", {
    title: "Add New Inventory Item",
    nav,
    classifications: classifications.rows, // send to EJS
    errors: null
  })
}

/* ***************************
 *  Handle add inventory POST
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  const nav = await utilities.getNav()
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  } = req.body

  const result = await invModel.addInventoryItem(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  )

  if (result) {
    req.flash("notice", `"${inv_make} ${inv_model}" added successfully.`)
    res.redirect("/inv")
  } else {
    req.flash("notice", "Failed to add inventory item.")
    res.status(500).render("inventory/add-inventory", {
      title: "Add New Inventory Item",
      nav,
      errors: null
    })
  }
}

 module.exports = invCont
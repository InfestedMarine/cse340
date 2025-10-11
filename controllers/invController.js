const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { buildClassificationList } = utilities
const invCont = {}
const he = require('he'); // at the top of invController.js

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
  const vehicle = await invModel.getVehicleById(invId) 
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

  // 🔒 Validate before inserting
  if (!classification_name || classification_name.trim() === "") {
    req.flash("notice", "Classification name is required.")
    return res.status(400).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null
    })
  }

  const result = await invModel.addClassification(classification_name.trim())
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
  try {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    const message = req.flash("notice") || null 

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      errors: null,
      message  
    })
  } catch (error) {
    next(error)
  }
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
    res.redirect("/account/")
    } else {
    req.flash("notice", "Failed to add inventory item.")
    const classifications = await invModel.getClassifications()
    res.status(500).render("inventory/add-inventory", {
      title: "Add New Inventory Item",
      nav,
      classifications: classifications.rows,
      errors: null
    })
  }
}


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()

  // Fetch inventory item from DB
  const itemData = await invModel.getVehicleById(inv_id)

  // Build classification drop-down with the item's current classification selected
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  // Decode HTML entities to prevent &#x2F; in the DB
  inv_image = he.decode(inv_image)
  inv_thumbnail = he.decode(inv_thumbnail)

  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/account/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
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
    })
  }
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  
  const itemData = await invModel.getVehicleById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price
  })
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult.rowCount > 0) {
    req.flash("notice", "Inventory item successfully deleted.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, deletion failed.")
    res.redirect(`/inv/delete/${inv_id}`)
  }
}

 module.exports = invCont
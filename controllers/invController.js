const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

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

 module.exports = invCont
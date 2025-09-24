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

async function buildById(req, res, next) {
  const invId = req.params.inv_id;
  const vehicleData = await invModel.getVehicleById(invId);
  const html = utilities.buildVehicleDetailHTML(vehicleData);
  res.render("inventory/detail", {
    title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
    nav,
    content: html
  });
}

 module.exports = invCont
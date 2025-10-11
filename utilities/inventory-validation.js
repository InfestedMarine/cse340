const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification must not contain spaces or special characters."),
  ]
}

validate.checkClassification = async (req, res, next) => {
  const { classification_name } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      classification_name,
    })
    return
  }
  next()
}

/* Inventory validation rules */
validate.inventoryRules = () => {
  return [
    body("classification_id").trim().notEmpty().withMessage("Please select a classification."),
    body("inv_make").trim().escape().notEmpty().withMessage("Please provide the vehicle make."),
    body("inv_model").trim().escape().notEmpty().withMessage("Please provide the vehicle model."),
    body("inv_year").trim().escape().notEmpty().isInt({ min: 1900, max: 2100 }).withMessage("Provide a valid year."),
    body("inv_description").trim().escape().notEmpty().withMessage("Please provide a description."),
    body("inv_image").trim().escape().notEmpty().withMessage("Please provide the image path."),
    body("inv_thumbnail").trim().escape().notEmpty().withMessage("Please provide the thumbnail path."),
    body("inv_price").trim().notEmpty().isFloat({ min: 0 }).withMessage("Provide a valid price."),
    body("inv_miles").trim().notEmpty().isInt({ min: 0 }).withMessage("Provide valid mileage."),
  ]
}

validate.checkInventory = async (req, res, next) => {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
  } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    // build classification list with sticky selected classification
    const classificationList = await utilities.buildClassificationList(classification_id)
    res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      errors,
      classificationList,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
    })
    return
  }
  next()
}

/* New inventory rules for update */
validate.newInventoryRules = () => {
  return [
    body("classification_id").trim().notEmpty().withMessage("Please select a classification."),
    body("inv_make").trim().escape().notEmpty().withMessage("Please provide the vehicle make."),
    body("inv_model").trim().escape().notEmpty().withMessage("Please provide the vehicle model."),
    body("inv_year").trim().escape().notEmpty().isInt({ min: 1900, max: 2100 }).withMessage("Provide a valid year."),
    body("inv_description").trim().escape().notEmpty().withMessage("Please provide a description."),
    body("inv_image").trim().escape().notEmpty().withMessage("Please provide the image path."),
    body("inv_thumbnail").trim().escape().notEmpty().withMessage("Please provide the thumbnail path."),
    body("inv_price").trim().notEmpty().isFloat({ min: 0 }).withMessage("Provide a valid price."),
    body("inv_miles").trim().notEmpty().isInt({ min: 0 }).withMessage("Provide valid mileage."),
  ]
}

/* Check update data */
validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_id,
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  } = req.body

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)
    res.status(400).render("inventory/edit-inventory", {
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      errors,
      classificationList,
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
    return
  }
  next()
}

module.exports = validate

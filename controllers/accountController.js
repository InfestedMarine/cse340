const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver Login View
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}

/* ****************************************
*  Deliver Registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}
/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Check for existing email
  const existingEmail = await accountModel.checkExistingEmail(account_email)
  if (existingEmail) {
    req.flash("notice", "This email already exists. Please log in or use a different email.")
    return res.status(400).render("account/register", {
      title: "Register",
      nav,
      errors: null
    })
  }

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)

    // Save the new account with the hashed password
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Register",
        nav,
      })
    }
  } catch (error) {
    console.error("Error registering account:", error)
    req.flash("notice", "An unexpected error occurred. Please try again.")
    res.status(500).render("account/register", {
      title: "Register",
      nav,
    })
  }
}

/* ****************************************
*  Process login
* *************************************** */
async function accountLogin(req, res, next) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Invalid email or password.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  }

  try {
    const match = await bcrypt.compare(account_password, accountData.account_password)
    if (!match) {
      req.flash("notice", "Invalid email or password.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
      })
    }

    // Create JWT
    const token = jwt.sign(
      { 
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_type: accountData.account_type
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    )

    res.cookie("jwt", token, { httpOnly: true, secure: true, maxAge: 3600000 })
    return res.redirect("/account/")

  } catch (error) {
    console.error("Login error:", error)
    req.flash("notice", "An unexpected error occurred during login.")
    res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email]
    )
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* ****************************************
*  Deliver Account Management view
* *************************************** */
async function buildManagement(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const accountData = res.locals.accountData
    const message = req.flash("notice") || null
    const classificationSelect = await utilities.buildClassificationList()

    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      accountData,
      message,
      classificationSelect 
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {buildLogin, buildRegister, registerAccount, accountLogin, getAccountByEmail, buildManagement}


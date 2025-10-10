const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

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
  const { account_email, account_password } = req.body
  console.log("Login attempt:", account_email)
  // TODO: check credentials from database later
  res.send("Login POST route working!")
}

module.exports = {buildLogin, buildRegister, registerAccount, accountLogin}


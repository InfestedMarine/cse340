/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const errorRoutes = require("./routes/errorRoute")
const session = require("express-session")
const pool = require('./database/')
const accountRoute = require("./routes/accountRoute")
const bodyParser = require("body-parser")


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout.ejs") // not at views root
app.use("/error", errorRoutes)

/* ***********************
 * Middleware
 *************************/
const utilities = require("./utilities/")

app.use(async (err, req, res, next) => {
  console.error("Error stack trace:", err.stack)
  const nav = await utilities.getNav() 
  res.status(500).render("error", { 
    message: "Something went wrong: " + err.message,
    nav
  })

})

 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
  
})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for form submissions



/* ***********************
 * Routes
 *************************/
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/img', express.static(__dirname + 'public/img'))
// Index Route
app.get("/", baseController.buildHome)
// Inventory routes
app.use("/inv", inventoryRoute)
// Account Route
app.use("/account", accountRoute)

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT 
const host = process.env.HOST


/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})

const errorController = {}

errorController.triggerError = (req, res, next) => {
  try {
    // Intentionally throw an error to test middleware
    throw new Error("Intentional error for testing Task 3")
  } catch (err) {
    next(err) // send to error-handling middleware
  }
}

module.exports = errorController
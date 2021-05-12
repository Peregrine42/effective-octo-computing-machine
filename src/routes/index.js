var express = require("express")
var router = express.Router()
const { router: authRouter } = require("./authRouter")
const { router: usersRouter } = require("./usersRouter")

router.use("/auth", authRouter)
router.use("/users", usersRouter)

module.exports = { router }
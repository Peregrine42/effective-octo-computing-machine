const express = require("express")
const { configurePreRouting, configurePostRouting } = require("./config")
const { router } = require("./routes");
const { renderFormWithCSRF } = require('./renderFormWithCSRF');
const { verifyUser } = require("./verifyUser")

const app = express()

configurePreRouting(app)
app.use("/", router)
app.get("/status", (req, res) => {
	res.send("OK")
})

app.get("/", async (req, res) => {
	if (await verifyUser(req)) {
		renderFormWithCSRF(req, res, "home")
	} else {
		res.redirect("/auth/sign-in")
	}
})
configurePostRouting(app)

const httpPort = 8080
const httpPromise = new Promise(res => {
	app.listen(httpPort, () => {
		res()
	})
})

Promise.all([
	httpPromise
]).then(() => {
	console.log(`App listening at http://localhost:${httpPort}`)
})
const express = require("express")
const argon2 = require("argon2")
const router = express.Router()
const { renderFormWithCSRF } = require("../renderFormWithCSRF")
const { sequelize } = require("../sequelize")

router.get("/sign-in", function (req, res) {
	if (req.session.userId) {
		res.redirect("/")
	} else {
		renderFormWithCSRF(req, res, "auth/sign-in")
	}
})

router.post("/sign-out", async function (req, res) {
	await new Promise(resolve => req.session.destroy(resolve))
	res.redirect("/")
})

router.post("/sign-in", async function (req, res) {
	const username = req.body.username
	const password = req.body.password

	const [result] = await sequelize.query(
		`
          	select id, encrypted_password
		  	from users 
		 	where username = $username
			and enabled = 't'
		`,
		{
			bind: { username }
		}
	)

	if (result.length !== 1) { return false }

	const { id: userId, encrypted_password: encryptedPassword } = result[0]

	if (await argon2.verify(encryptedPassword, password)) {
		req.session.userId = userId

		req.session.sessionFlash = {
			type: 'success',
			message: 'Sign in complete'
		}

		res.redirect("/")
	} else {
		renderFormWithCSRF(req, res, "auth/sign-in", { username })
	}
})

module.exports = {
	router
}
const express = require("express")
const router = express.Router()
const { renderFormWithCSRF } = require("../renderFormWithCSRF")
const { sequelize } = require("../sequelize")
const { encrypt } = require("../encrypt")

router.get("/", async function (req, res) {
	const users = await listUsers()
	renderFormWithCSRF(req, res, "users/list", { users })
})

router.post("/", async function (req, res) {
	const username = req.body.username
	const password = req.body.password
	const passwordConfirm = req.body.passwordConfirm
	const authority = req.body.authority

	const { success, errors } = await saveUser(authority, username, password, passwordConfirm)

	if (success) {
		res.redirect("/users")
	} else {
		renderFormWithCSRF(req, res, "users/new", { username, errors })
	}
})

router.get("/new", function (req, res) {
	renderFormWithCSRF(req, res, "users/new")
})

function validateUserForm(
	authority,
	username,
	password,
	passwordConfirm
) {
	let errors = {
		username: [],
		password: [],
		authority: [],
	}

	if (password !== passwordConfirm) {
		errors.password.push("Password must match password confirmation")
	}
	if (password.length < 12) {
		errors.password.push("Password is too short - it must be longer than 12 characters.")
	}
	if (password.length >= 300) {
		errors.password.push("Password is too long - it must be shorter than 300 characters.")
	}
	if (!password.match(/^[A-Za-z0-9\-\!\_\.\,\/\\]+$/)) {
		errors.password.push("Password contains invalid characters. Please only use: A-Z a-z 0-9 - ! _ . , / \\")
	}
	if (username.length < 3) {
		errors.username.push("Username is too short - it must be longer than 3 characters.")
	}
	if (username.length >= 300) {
		errors.username.push("Username is too long - it must be shorter than 300 characters.")
	}
	if (!username.match(/^[A-Za-z0-9\_\-]+$/)) {
		errors.username.push("Username contains invalid characters. Please only use: A-Z a-z 0-9 - _")
	}
	if (authority.length < 3) {
		errors.authority.push("Authority is too short - it must be longer than 1 character.")
	}
	if (authority.length >= 300) {
		errors.authority.push("Authority is too long - it must be shorter than 300 characters.")
	}
	if (!authority.match(/^[A-Za-z0-9\_\-]+$/)) {
		errors.authority.push("Authority contains invalid characters. Please only use: A-Z a-z 0-9 - _")
	}

	return errors
}

async function saveUser(authority, username, password, passwordConfirm) {
	let errors = validateUserForm(
		authority,
		username,
		password,
		passwordConfirm
	)

	let result = null
	if (noErrors(errors)) {
		const t = await sequelize.transaction()

		try {
			[rows] = await sequelize.query(
				`
					insert into users 
					(
						username,
						encrypted_password,
						enabled
					) 
					values 
					(
						$username,
						$password,
						't'
					)
					returning id
				`,
				{
					bind: { username, password: await encrypt(password) }
				}
			)

			result = rows[0]

			await sequelize.query(
				`
					insert into roles
					(
						username,
						authority,
						enabled
					)
					values
					(
						$username,
						$authority,
						't'
					);
				`,
				{
					bind: { username, authority }
				}
			)
			await t.commit()
		} catch (e) {
			await t.rollback()
			console.error(e)
			if (typeof (e) === "UniqueConstraintError") {
				errors.username.push("That username is already taken.")
			}
		}
	}

	if (noErrors(errors)) {
		return { success: true, result }
	} else {
		return { success: false, errors }
	}
}

function noErrors(errorsObj) {
	const keys = Object.keys(errorsObj)
	let key
	for (let i = 0; i < keys.length; i += 1) {
		key = keys[i]
		if (errorsObj[key].length > 0) {
			return false
		}
	}
	return true
}

async function listUsers() {
	const [result] = await sequelize.query(
		`
			select 
				users.username as username, 
				string_agg(CAST(roles.authority as text), ', ') as authorities 
			from users
			left join roles on roles.username = users.username
			where users.enabled = 't'
			and roles.enabled = 't'
			group by users.username
			order by users.username asc
		`
	)
	return result
}

module.exports = {
	router,
	validateUserForm
}

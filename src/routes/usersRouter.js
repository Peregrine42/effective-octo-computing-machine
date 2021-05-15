const express = require("express")

const router = express.Router()
const { renderFormWithCSRF } = require("../renderFormWithCSRF")
const { sequelize, SequelizeUniqueConstraintError } = require("../sequelize")
const { encrypt } = require("../encrypt")

const VALID_ROLES = ["Admin", "Member"]

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
		renderFormWithCSRF(req, res, "users/new", { username, authority, errors })
	}
})

router.get("/new", function (req, res) {
	const errors = generateErrorsObj()
	renderFormWithCSRF(req, res, "users/new", { errors })
})

function generateErrorsObj(validRoles = VALID_ROLES) {
	return {
		username: {
			tooShort: {
				desc: "Username must be longer than 3 characters.",
			},
			tooLong: {
				desc: "Username must be shorter than 300 characters.",
				hideByDefault: true
			},
			invalidChars: {
				desc: "Please only use these characters: A-Z a-z 0-9 - _"
			},
			alreadyTaken: {
				desc: "That username is already taken.",
				hideByDefault: true
			}
		},
		password: {
			confirm: {
				desc: "Password must match password confirmation."
			},
			tooShort: {
				desc: "Password must be longer than 3 characters.",
			},
			tooLong: {
				desc: "Pasword must be shorter than 300 characters.",
				hideByDefault: true
			},
			invalidChars: {
				desc: "Please only use these characters: A-Z a-z 0-9 - ! _ . , / \\"
			}
		},
		authority: {
			oneOf: {
				desc: `Authority must be one of: ${validRoles.join(", ")}.`
			},
		},
		general: []
	}
}

function validateUserForm(
	authority,
	username,
	password,
	passwordConfirm,
	validRoles = VALID_ROLES
) {
	const errors = generateErrorsObj(validRoles)

	if (username.length < 3) {
		errors.username.tooShort.error = true
	}
	if (username.length >= 300) {
		errors.username.tooLong.error = true
	}
	if (!username.match(/^[A-Za-z0-9\_\-]+$/)) {
		errors.username.invalidChars.error = true
	}
	if (password !== passwordConfirm) {
		errors.password.confirm.error = true
	}
	if (password.length < 12) {
		errors.password.tooShort.error = true
	}
	if (password.length >= 300) {
		errors.password.tooLong.error = true
	}
	if (!password.match(/^[A-Za-z0-9\-\!\_\.\,\/\\]+$/)) {
		errors.password.invalidChars.error = true
	}
	if (!validRoles.map(vR => vR.toLowerCase()).includes(authority.toLowerCase())) {
		errors.authority.oneOf.error = true
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
					bind: { username, authority: authority.toLowerCase() }
				}
			)
			await t.commit()
		} catch (e) {
			await t.rollback()
			console.error(e.type)
			if (e instanceof SequelizeUniqueConstraintError) {
				errors.username.alreadyTaken.error = true
			} else {
				errors.general.push("An unknown error occurred.")
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
	let sections = Object.keys(errorsObj)
	let section
	for (let j = 0; j < sections.length; j += 1) {
		section = errorsObj[sections[j]]
		let keys = Object.keys(section)
		let key
		for (let i = 0; i < keys.length; i += 1) {
			key = keys[i]
			if (section[key].error) {
				return false
			}
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
	validateUserForm,
	noErrors,
}

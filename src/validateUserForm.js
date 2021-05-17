const VALID_ROLES = ["Admin", "Member"]

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

module.exports = {
	validateUserForm, noErrors
}
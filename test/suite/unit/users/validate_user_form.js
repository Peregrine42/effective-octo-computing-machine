const { validateUserForm, noErrors } = require("../../../../src/validateUserForm")
const expect = require('chai').expect

function stringRepeat(string, reps) {
	result = ""
	for (let i = 0; i < reps; i += 1) {
		result += string
	}
	return result
}

describe("validateUserForm", function () {
	xit('attaches an error when the given username is invalid', function () {
		expect(validateUserForm(
			"Admin",
			"",
			"passwordpassword",
			"passwordpassword"
		).username.tooShort.error).to.equal(true)

		expect(validateUserForm(
			"Admin",
			"aa",
			"passwordpassword",
			"passwordpassword"
		).username.tooShort.error).to.equal(true)

		const chars299 = stringRepeat("0123456789", 29) + "012345678"
		expect(chars299.length).to.equal(299)
		expect(noErrors(validateUserForm(
			"Admin",
			chars299,
			"passwordpassword",
			"passwordpassword"
		))).to.equal(true)

		const chars300 = stringRepeat("0123456789", 30)
		expect(chars300.length).to.equal(300)
		expect(validateUserForm(
			"Admin",
			chars300,
			"passwordpassword",
			"passwordpassword"
		).username.tooLong.error).to.equal(true)

		expect(validateUserForm(
			"Admin",
			"aa%%%",
			"passwordpassword",
			"passwordpassword"
		).username.invalidChars.error).to.equal(true)
	});

	xit('attaches an error when the given password is invalid', function () {
		expect(validateUserForm(
			"Admin",
			"usernameusername",
			"",
			""
		).password.tooShort.error).to.equal(true)

		expect(validateUserForm(
			"Admin",
			"usernameusername",
			"aa",
			"aa"
		).password.tooShort.error).to.equal(true)

		const chars299 = stringRepeat("0123456789", 29) + "012345678"
		expect(chars299.length).to.equal(299)
		expect(noErrors(validateUserForm(
			"Admin",
			"usernameusername",
			chars299,
			chars299
		))).to.equal(true)

		const chars300 = stringRepeat("0123456789", 30)
		expect(chars300.length).to.equal(300)
		expect(validateUserForm(
			"Admin",
			"usernameusername",
			chars300,
			chars300,
		).password.tooLong.error).to.equal(true)

		expect(validateUserForm(
			"Admin",
			"usernameusername",
			"passwordpassword&&&",
			"passwordpassword&&&"
		).password.invalidChars.error).to.equal(true)
	});

	xit('attaches an error when the given authority is invalid', function () {
		expect(validateUserForm(
			"FooMember",
			"usernameusername",
			"passwordpassword",
			"passwordpassword"
		).authority.oneOf.error).to.equal(true)

		expect(noErrors(validateUserForm(
			"Admin",
			"usernameusername",
			"passwordpassword",
			"passwordpassword"
		))).to.equal(true)
	});

	xit("allows only matching passwords", function () {
		expect(validateUserForm(
			"Admin",
			"usernameusername",
			"passwordpassword",
			"nonmatchingpassword"
		).password.confirm.error).to.equal(true)

		expect(noErrors(validateUserForm(
			"Admin",
			"usernameusername",
			"passwordpassword",
			"passwordpassword"
		))).to.equal(true)
	})
});
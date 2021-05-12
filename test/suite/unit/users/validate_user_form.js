const { validateUserForm } = require("../../../../src/routes/usersRouter")
const expect = require('chai').expect

function stringRepeat(string, reps) {
	result = ""
	for (let i = 0; i < reps; i += 1) {
		result += string
	}
	return result
}

describe("validateUserForm", function () {
	it('attaches an error when the given username is invalid', function () {
		expect(validateUserForm(
			"admin",
			"",
			"passwordpassword",
			"passwordpassword"
		).username[0]).to.match(/Username is too short/)

		expect(validateUserForm(
			"admin",
			"aa",
			"passwordpassword",
			"passwordpassword"
		).username[0]).to.match(/Username is too short/)

		const chars299 = stringRepeat("0123456789", 29) + "012345678"
		expect(chars299.length).to.equal(299)
		expect(validateUserForm(
			"admin",
			chars299,
			"password",
			"passwordpassword"
		).username).to.be.empty

		const chars300 = stringRepeat("0123456789", 30)
		expect(chars300.length).to.equal(300)
		expect(validateUserForm(
			"admin",
			chars300,
			"passwordpassword",
			"passwordpassword"
		).username[0]).to.match(/Username is too long/)

		expect(validateUserForm(
			"admin",
			"aa%%%",
			"passwordpassword",
			"passwordpassword"
		).username[0]).to.match(/Username contains invalid characters/)
	});

	it('attaches an error when the given password is invalid', function () {
		expect(validateUserForm(
			"admin",
			"usernameusername",
			"",
			""
		).password[0]).to.match(/Password is too short/)

		expect(validateUserForm(
			"admin",
			"usernameusername",
			"aa",
			"aa"
		).password[0]).to.match(/Password is too short/)

		const chars299 = stringRepeat("0123456789", 29) + "012345678"
		expect(chars299.length).to.equal(299)
		expect(validateUserForm(
			"admin",
			"usernameusername",
			chars299,
			chars299
		).password).to.be.empty

		const chars300 = stringRepeat("0123456789", 30)
		expect(chars300.length).to.equal(300)
		expect(validateUserForm(
			"admin",
			"usernameusername",
			chars300,
			chars300,
		).password[0]).to.match(/Password is too long/)

		expect(validateUserForm(
			"admin",
			"usernameusername",
			"passwordpassword&&&",
			"passwordpassword&&&"
		).password[0]).to.match(/Password contains invalid characters/)
	});

	it('attaches an error when the given authority is invalid', function () {
		expect(validateUserForm(
			"",
			"usernameusername",
			"passwordpassword",
			"passwordpassword"
		).authority[0]).to.match(/Authority is too short/)

		expect(validateUserForm(
			"aa",
			"usernameusername",
			"passwordpassword",
			"passwordpassword"
		).authority[0]).to.match(/Authority is too short/)

		const chars299 = stringRepeat("0123456789", 29) + "012345678"
		expect(chars299.length).to.equal(299)
		expect(validateUserForm(
			chars299,
			"usernameusername",
			"passwordpassword",
			"passwordpassword"
		).authority).to.be.empty

		const chars300 = stringRepeat("0123456789", 30)
		expect(chars300.length).to.equal(300)
		expect(validateUserForm(
			chars300,
			"usernameusername",
			"passwordpassword",
			"passwordpassword"
		).authority[0]).to.match(/Authority is too long/)

		expect(validateUserForm(
			"aa<><><><>",
			"usernameusername",
			"passwordpassword",
			"passwordpassword"
		).authority[0]).to.match(/Authority contains invalid characters/)
	});

	it("allows only matching passwords", function () {
		expect(validateUserForm(
			"admin",
			"usernameusername",
			"passwordpassword",
			"nonmatchingpassword"
		).password[0]).to.match(/Password must match/)

		expect(validateUserForm(
			"admin",
			"usernameusername",
			"passwordpassword",
			"passwordpassword"
		).password).to.be.empty
	})
});
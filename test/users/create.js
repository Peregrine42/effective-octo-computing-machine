const assert = require("assert")
const TestHarness = require("../test_harness/TestHarness")

describe('Users Create', function () {
	this.settings.start_session = false;

	before(async () => {
		this.harness = new TestHarness()
		await this.harness.init(this)
	});

	it("creates a user", async function (nightwatch) {
		await this.browser.url("localhost:8080");
		await assertCanSignInWith(this, nightwatch, "testuser", "testpassword")

		console.log("new page: ", await this.browser.getTitle())

		const users = await this.browser.$("#users")
		await users.click()
		console.log("new page: ", await this.browser.getTitle())
		const create = await this.browser.$("#create")
		await create.click()
		console.log("new page: ", await this.browser.getTitle())
		const username = await this.browser.$("#username")
		await username.setValue("newuser")
		const password = await this.browser.$("#password")
		await password.setValue("testpassword")
		const passwordConfirm = await this.browser.$("#password-confirm")
		await passwordConfirm.setValue("testpassword")
		const submit = await this.browser.$("#submit")
		await submit.click()
		console.log("new page: ", await this.browser.getTitle())
		const signOut = await this.browser.$("#sign-out")
		await signOut.click()
		console.log("new page: ", await this.browser.getTitle())

		await assertCanSignInWith(this, nightwatch, "newuser", "testpassword")
	});

	afterEach(async (nightwatch) => {
		if (nightwatch.currentTest.results.errors > 0) {
			console.log("The test failed: printing last page in browser to help debug...")
			const result = await (await this.browser.$("html")).getHTML()
			console.log(result)
		}
	})

	after(async () => {
		await this.harness.deleteEverything()
	});
});

async function assertCanSignInWith(nwThis, nightwatch, username, password) {
	const usernameField = await nwThis.browser.$("#username")
	await usernameField.setValue(username)
	const passwordField = await nwThis.browser.$("#password")
	await passwordField.setValue(password)
	const submit = await nwThis.browser.$("#submit")
	await submit.click()
	console.log("new page: ", await nwThis.browser.getTitle())

	const signInMessage = await nwThis.browser.$("#success")
	const signInMessageResult = (await nightwatch.getText(signInMessage)).value
	assert.strictEqual(signInMessageResult, "Sign in complete")
}

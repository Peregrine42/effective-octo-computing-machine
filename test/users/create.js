const TestHarness = require("../test_harness/TestHarness")

describe('Users Create', function () {
	this.settings.start_session = false;

	before(async () => {
		this.harness = new TestHarness()
		await this.harness.init(this)
	});

	it("creates a user", async function (nightwatch) {
		await this.browser.url("localhost:8080");

		const users = await this.browser.$("#users")
		await users.click()
		const create = await this.browser.$("#create")
		await create.click()
		const username = await this.browser.$("#username")
		await username.setValue("testuser")
		const password = await this.browser.$("#password")
		await password.setValue("testpassword")
		const submit = await this.browser.$("#submit")
		await submit.click()

		await assertCanSignInWith(this, nightwatch, "testuser", "testpassword")
	});

	after(async () => {
		await this.harness.deleteEverything()
	});
});

async function assertCanSignInWith(nwThis, nightwatch, username, password) {
	const signOut = await nwThis.browser.$("#sign-out")
	await signOut.click()
	const signIn = await nwThis.browser.$("#sign-in")
	await signIn.click()
	const usernameField = await nwThis.browser.$("#username")
	await usernameField.setValue("testuser")
	const passwordField = await nwThis.browser.$("#password")
	await passwordField.setValue("testpassword")
	const submit = await nwThis.browser.$("#submit")
	await submit.click()

	const signInMessage = await nwThis.browser.$("#sign-in-message")
	const signInMessageResult = (await nightwatch.getText(signInMessage)).value
	assert.strictEqual(signInMessageResult, "Sign in complete")
}

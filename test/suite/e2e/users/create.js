const expect = require('chai').expect
const { browserLog } = require("../../../helpers/browserLog")
const { buildBrowser } = require("../../../helpers/buildBrowser")
const { getDbConnection } = require("../../../helpers/getDbConnection")
const { tryToSignInWith } = require("../../../helpers/tryToSignInWith")
const { resetDb } = require("../../../helpers/resetDb")
const { addTestAdminUser } = require("../../../helpers/addTestAdminUser")

let browser
let sequelize

describe("Users", function () {
	beforeEach(async () => {
		browser = await buildBrowser()
		await browser.deleteCookies()
		sequelize = getDbConnection()
	})

	it('creates a new user', async function () {
		await resetDb(sequelize)
		await addTestAdminUser(sequelize, "testuser", "testpassword")
		await browser.url("localhost:8080")

		const loginResult = await tryToSignInWith("testuser", "testpassword")
		if (!loginResult) throw new Error("Cannot sign in as test user.")
		browserLog("new page: ", await browser.getTitle())

		const users = await browser.$("#users")
		await users.click()
		browserLog("new page: ", await browser.getTitle())
		const create = await browser.$("#create")
		await create.click()
		browserLog("new page: ", await browser.getTitle())
		const username = await browser.$("#username")
		await username.setValue("newuser")
		const password = await browser.$("#password")
		await password.setValue("testpassword")
		const passwordConfirm = await browser.$("#passwordConfirm")
		await passwordConfirm.setValue("testpassword")
		const authority = await browser.$("#authority")
		await authority.setValue("Admin")
		const submit = await browser.$("#submit")
		await submit.click()
		browserLog("new page: ", await browser.getTitle())
		const signOut = await browser.$("#sign-out")
		await signOut.click()
		browserLog("new page: ", await browser.getTitle())

		const result = await tryToSignInWith("newuser", "testpassword")
		expect(result).to.equal(true)
	});

	it('shows validation errors when given bad input', async function () {
		await resetDb(sequelize)
		await addTestAdminUser(sequelize, "testuser", "testpassword")
		await browser.url("localhost:8080")

		const loginResult = await tryToSignInWith("testuser", "testpassword")
		if (!loginResult) throw new Error("Cannot sign in as test user.")
		browserLog("new page: ", await browser.getTitle())

		const users = await browser.$("#users")
		await users.click()
		browserLog("new page: ", await browser.getTitle())
		const create = await browser.$("#create")
		await create.click()
		browserLog("new page: ", await browser.getTitle())
		const username = await browser.$("#username")
		await username.setValue("testuser")
		const password = await browser.$("#password")
		await password.setValue("testpassword")
		const passwordConfirm = await browser.$("#passwordConfirm")
		await passwordConfirm.setValue("testpassword")
		const authority = await browser.$("#authority")
		await authority.setValue("Admin")
		const submit = await browser.$("#submit")
		await submit.click()
		browserLog("new page: ", await browser.getTitle())
		const result = await (await browser.$("#username-errors")).getText()

		expect(result).to.match(/already taken/)
	});
});
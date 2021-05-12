const expect = require('chai').expect
const { browserLog } = require("../../../helpers/browserLog")
const { buildBrowser } = require("../../../helpers/buildBrowser")
const { getDbConnection } = require("../../../helpers/getDbConnection")
const { tryToSignInWith } = require("../../../helpers/tryToSignInWith")
const { resetDb } = require("../../../helpers/resetDb")
const { addTestUser } = require("../../../helpers/addTestUser")
const { addTestRole } = require("../../../helpers/addTestRole")

let browser
let sequelize

describe("Users", function () {
	beforeEach(async () => {
		browser = await buildBrowser()
		await browser.deleteCookies()
		sequelize = getDbConnection()
	})

	it('list all users', async function () {
		await resetDb(sequelize)
		await addTestUser(sequelize, "testuser", "testpassword")
		await addTestUser(sequelize, "testuser2", "testpassword2")
		await addTestRole(sequelize, "testuser", "FOO")
		await addTestRole(sequelize, "testuser2", "BAR")
		await addTestRole(sequelize, "testuser2", "BAZ")
		await browser.url("localhost:8080")

		const loginResult = await tryToSignInWith("testuser", "testpassword")
		if (!loginResult) throw new Error("Cannot sign in as test user.")
		browserLog("new page: ", await browser.getTitle())

		const users = await browser.$("#users")
		await users.click()
		browserLog("new page: ", await browser.getTitle())
		const listItem1 = await browser.$("#list-item-0")
		const listItem2 = await browser.$("#list-item-1")
		expect((await listItem1.getText())).to.equal("testuser FOO")
		expect((await listItem2.getText())).to.equal("testuser2 BAR, BAZ")
	});
});
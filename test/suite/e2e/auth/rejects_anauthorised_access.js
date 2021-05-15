const expect = require('chai').expect
const { browserLog } = require("../../../helpers/browserLog")
const { buildBrowser } = require("../../../helpers/buildBrowser")
const { getDbConnection } = require("../../../helpers/getDbConnection")
const { tryToSignInWith } = require("../../../helpers/tryToSignInWith")
const { resetDb } = require("../../../helpers/resetDb")
const { addTestAdminUser } = require("../../../helpers/addTestAdminUser")

let browser
let sequelize

describe("Auth", function () {
	beforeEach(async () => {
		browser = await buildBrowser()
		await browser.deleteCookies()
		sequelize = getDbConnection()
	})

	it("rejects the user when they access another page without signing in", async function () {
		await resetDb(sequelize)
		await addTestAdminUser(sequelize, "testuser", "testpassword")
		await browser.url("localhost:8080/users")
		browserLog("new page: ", await browser.getTitle())
		const result = await browser.getTitle()
		expect(result).to.equal("Forbidden")
	});
});
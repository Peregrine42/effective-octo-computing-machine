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

	it('rejects the user when they enter no password', async function () {
		await resetDb(sequelize)
		await addTestAdminUser(
			sequelize,
			process.env.TEST_USERNAME,
			process.env.TEST_PASSWORD
		)
		await browser.url("localhost:8080")
		const result = await tryToSignInWith(process.env.TEST_USERNAME, "")
		browserLog("new page: ", await browser.getTitle())
		expect(result).to.equal(false)
	});
});

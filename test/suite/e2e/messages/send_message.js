const expect = require('chai').expect
const { browserLog } = require("../../../helpers/browserLog")
const { buildBrowser } = require("../../../helpers/buildBrowser")
const { getDbConnection } = require("../../../helpers/getDbConnection")
const { tryToSignInWith } = require("../../../helpers/tryToSignInWith")
const { resetDb } = require("../../../helpers/resetDb")
const { addTestAdminUser } = require("../../../helpers/addTestAdminUser")

let browser
let sequelize

describe("Messages", function () {
	beforeEach(async () => {
		browser = await buildBrowser()
		await browser.deleteCookies()
		sequelize = getDbConnection()
	})

	it('can send a message', async function () {
		await resetDb(sequelize)
		await addTestAdminUser(
			sequelize, process.env.TEST_USERNAME, process.env.TEST_PASSWORD
		)

		await addTestAdminUser(
			sequelize, process.env.TEST_USERNAME + "2", process.env.TEST_PASSWORD
		)

		await browser.url("localhost:8080")
		browserLog("new page: ", await browser.getTitle())

		let loginResult = await tryToSignInWith(
			process.env.TEST_USERNAME, process.env.TEST_PASSWORD
		)
		browserLog("new page: ", await browser.getTitle())
		expect(loginResult).to.equal(true)

		const chatBox = await browser.$("#chat-box")
		await chatBox.setValue("hello from browser1")
		const chatSubmit = await browser.$("#chat-submit")
		await chatSubmit.click()
		expect(await chatBox.getValue()).to.equal("")

		await browser.deleteCookies()
		await browser.url("localhost:8080")
		loginResult = await tryToSignInWith(
			process.env.TEST_USERNAME + "1", process.env.TEST_PASSWORD
		)
		browserLog("new page: ", await browser.getTitle())
		expect(loginResult).to.equal(true)

		const messageBox = await browser.$("#message-box")
		const message = await messageBox.getText()
		expect(message).to.match(/hello from browser1/)
	});
});
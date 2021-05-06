const expect = require('chai').expect
const { browserLog } = require("../../../helpers/browserLog")
const { buildBrowser } = require("../../../helpers/buildBrowser")
const { getDbConnection } = require("../../../helpers/getDbConnection")
const { tryToSignInWith } = require("../../../helpers/tryToSignInWith")
const { resetDb } = require("../../../helpers/resetDb")
const { addTestUser } = require("../../../helpers/addTestUser")

let browser
let sequelize

describe("Auth", function () {
    beforeEach(async () => {
        browser = await buildBrowser()
        await browser.deleteCookies()
        sequelize = getDbConnection()
    })

    it("rejects the user when CSRF isn't present", async function () {
        await resetDb(sequelize)
        await addTestUser(sequelize, "testuser", "testpassword")
        await browser.url("localhost:8080")

        const script = `
            document.getElementById("csrf").remove()
        `
        await browser.execute(script)
        const result = await tryToSignInWith("testuser", "testpassword")
        browserLog("new page: ", await browser.getTitle())
        expect(result).to.equal(false)
    });
});
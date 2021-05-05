const expect = require('chai').expect
const { browserLog } = require("../../../helpers/browserLog")
const { buildBrowser } = require("../../../helpers/buildBrowser")
const argon2 = require("argon2")
const Sequelize = require("sequelize")

let browser

describe("Auth", function () {
    beforeEach(async () => {
        browser = await buildBrowser()
        await browser.deleteCookies()
    })

    it('rejects the user when they enter an incorrect password', async function () {
        const sequelize = new Sequelize(
            process.env.DATABASE_NAME,
            process.env.DATABASE_USERNAME,
            process.env.DATABASE_PASSWORD,
            {
                host: process.env.DATABASE_HOST,
                port: process.env.DATABASE_PORT,
                dialect: 'postgres'
            }
        );

        await sequelize.query(
            `
              delete from roles
            `,
        );

        await sequelize.query(
            `
              delete from users
            `,
        );

        await sequelize.query(
            `
              insert into users (
                  username,
                  encrypted_password,
                  enabled
              ) values (
                  'testuser',
                  $password,
                  't'
              )
            `,
            {
                bind: { password: await encrypt("testpassword") }
            }
        );

        await sequelize.query(
            `
              insert into roles (
                  username,
                  authority,
                  enabled
              ) values (
                  'testuser',
                  'ADMIN',
                  't'
              )
            `,
            {
                bind: {}
            }
        );

        await browser.url("localhost:8080");
        const result = await tryToSignInWith("testuser", "wrong-testpassword")
        browserLog("new page: ", await browser.getTitle())
        expect(result).to.equal(false)
    });
});

async function tryToSignInWith(username, password) {
    const usernameField = await browser.$("#username")
    await usernameField.setValue(username)
    const passwordField = await browser.$("#password")
    await passwordField.setValue(password)
    const submit = await browser.$("#submit")
    await submit.click()
    browserLog("new page: ", await browser.getTitle())

    const signInMessage = await browser.$("#success")
    if (await signInMessage.isExisting()) {
        return (await signInMessage.getText()) === "Sign in complete"
    } else {
        return false
    }
}

async function encrypt(password) {
    const result = await argon2.hash(password, { type: argon2.argon2id })
    return result
}
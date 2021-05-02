const { remote } = require('webdriverio')
const expect = require('chai').expect
const { browserLog } = require("../../../helpers/browserLog")
const { buildBrowser } = require("../../../helpers/buildBrowser")
const argon2 = require("argon2")
const Sequelize = require("sequelize")

let browser

beforeEach(async function () {
    browser = await buildBrowser(remote)
});

describe("Users", function () {
    it('creates a new user', async function () {
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
        await assertCanSignInWith("testuser", "testpassword")
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
        const passwordConfirm = await browser.$("#password-confirm")
        await passwordConfirm.setValue("testpassword")
        const submit = await browser.$("#submit")
        await submit.click()
        browserLog("new page: ", await browser.getTitle())
        const signOut = await browser.$("#sign-out")
        await signOut.click()
        browserLog("new page: ", await browser.getTitle())

        await assertCanSignInWith("newuser", "testpassword")
    });
});

async function assertCanSignInWith(username, password) {
    const usernameField = await browser.$("#username")
    await usernameField.setValue(username)
    const passwordField = await browser.$("#password")
    await passwordField.setValue(password)
    const submit = await browser.$("#submit")
    await submit.click()
    browserLog("new page: ", await browser.getTitle())

    const signInMessage = await browser.$("#success")
    const signInMessageResult = await signInMessage.getText()
    expect(signInMessageResult).to.equal("Sign in complete")
}

async function encrypt(password) {
    const result = await argon2.hash(password, { type: argon2.argon2id })
    return result
}
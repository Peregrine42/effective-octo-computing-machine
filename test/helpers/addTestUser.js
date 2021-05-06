const argon2 = require("argon2")

module.exports.addTestUser = async function (sequelize) {
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
}

async function encrypt(password) {
    const result = await argon2.hash(password, { type: argon2.argon2id })
    return result
}
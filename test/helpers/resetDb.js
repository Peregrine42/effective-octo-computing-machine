module.exports.resetDb = async function (sequelize) {
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
}
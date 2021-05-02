module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `
        create table users (
            id serial,
            username text unique,
            encrypted_password text,
            enabled boolean
        )
      `
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `
        drop table users
      `
    );
  }
};

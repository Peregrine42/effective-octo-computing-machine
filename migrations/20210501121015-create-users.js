module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `
        create table users (
            id serial,
            username text,
            encrypted_password text
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

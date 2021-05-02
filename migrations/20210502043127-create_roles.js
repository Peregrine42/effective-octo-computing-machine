'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `
        create table roles (
            id serial,
            username text unique not null,
            FOREIGN KEY (username) REFERENCES users(username),
            authority text not null,
            enabled boolean default true
        );
        CREATE UNIQUE INDEX role_username_authority on roles (username,authority)
      `
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `
        drop table roles
      `
    );
  }
};

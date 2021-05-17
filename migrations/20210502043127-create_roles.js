'use strict';

module.exports = {
	up: async (queryInterface, _Sequelize) => {
		await queryInterface.sequelize.query(
			`
				create table roles (
					id serial,
					username text not null,
					foreign key (username) references users(username),
					authority text not null,
					enabled boolean default true
				);
				create unique index role_username_authority on roles (username,authority)
			`
		)
	},

	down: async (queryInterface, _Sequelize) => {
		await queryInterface.sequelize.query(
			`
				drop table roles
			`
		);
	}
};

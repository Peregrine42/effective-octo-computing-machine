'use strict';

module.exports = {
	up: async (queryInterface, _Sequelize) => {
		await queryInterface.sequelize.query(
			`
				create table messages (
					id serial,
					sender text not null,
					recipient text not null,
					message jsonb not null,
					enabled boolean default true,
					created_at timestamp not null
				);
				create index messages_sender on messages (sender);
				create index messages_recipient on messages (recipient);
			`
		)
	},

	down: async (queryInterface, _Sequelize) => {
		await queryInterface.sequelize.query(
			`
				drop table messages
			`
		);
	}
};

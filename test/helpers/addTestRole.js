module.exports.addTestRole = async function (sequelize, username, authority) {
	await sequelize.query(
		`
          insert into roles (
              username,
              authority,
              enabled
          ) values (
              $username,
              $authority,
              't'
          )
        `,
		{
			bind: { username, authority }
		}
	);
}
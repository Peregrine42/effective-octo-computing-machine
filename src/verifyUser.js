const { sequelize } = require("./sequelize")

async function verifyUser(req) {
	if (!req.session.userId) { return false }
	const [response] = await sequelize.query(
		`
          	select username
		  	from users 
		  	where id = $userId
			and enabled = 't'
		`,
		{
			bind: { userId: req.session.userId }
		}
	)

	return response.length === 1
}

module.exports = {
	verifyUser
}
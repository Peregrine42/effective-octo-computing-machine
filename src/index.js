const Hapi = require("@hapi/hapi")
const Nunjucks = require('nunjucks')
const Vision = require('@hapi/vision')
const Cookie = require('@hapi/cookie')
const Crumb = require('@hapi/crumb')
const Inert = require("@hapi/inert")
const Yar = require("@hapi/yar")
const Sequelize = require("sequelize")
const path = require('path')
const argon2 = require("argon2")

const flashesFrom = (request) => {
	return {
		success: request.yar.flash("success"),
		error: request.yar.flash("error"),
		info: request.yar.flash("info"),
	}
}

const dbPlugin = {
	name: 'dbPlugin',
	register: function (server, _options) {
		server.realm.sequelize = new Sequelize(
			process.env.DATABASE_NAME,
			process.env.DATABASE_USERNAME,
			process.env.DATABASE_PASSWORD,
			{
				host: process.env.DATABASE_HOST,
				port: process.env.DATABASE_PORT,
				dialect: 'postgres'
			}
		)

		server.decorate("request", "getDb", () => {
			return server.realm.sequelize
		})
	}
}

const checkForUser = async (sequelize, username, password) => {
	const [[{ id, encrypted_password: encryptedPassword }]] = await sequelize.query(
		`
          	select id, encrypted_password
		  	from users 
		  	where username = $username
			and enabled = 't'
		`,
		{
			bind: { username }
		}
	)

	if (await argon2.verify(encryptedPassword, password)) {
		return {
			id
		}
	} else {
		return false
	}
}

const findByUserId = async (sequelize, userId) => {
	const [result] = await sequelize.query(
		`
          	select id, username
		  	from users 
		  	where id = $userId
			and enabled = 't'
		`,
		{
			bind: { userId }
		}
	)
	if (result.length === 1) {
		return result[0]
	} else {
		return false
	}
}

const init = async () => {
	const server = Hapi.server({
		port: 8080,
		host: "localhost",
		routes: {
			files: {
				relativeTo: path.join(__dirname, '..', 'static')
			}
		}
	})

	await server.register(Cookie)
	await server.register(dbPlugin)
	await server.register(Vision)
	await server.register(Inert)
	await server.register({
		plugin: Yar,
		options: {
			cookieOptions: {
				password: process.env.SESSION_SECRET,
				isSecure: process.env.DEV_MODE !== "true",
			}
		}
	})
	await server.register({
		plugin: Crumb,

		options: {
			key: "csrf",
			cookieOptions: {
				isSecure: process.env.DEV_MODE !== "true"
			}
		}
	});

	server.auth.strategy('session', 'cookie', {
		cookie: {
			name: 'effective-octo',
			password: process.env.SESSION_SECRET,
			isSecure: process.env.DEV_MODE !== "true"
		},

		redirectTo: '/sign-in',

		validateFunc: async (request, session) => {
			if (typeof (session.id) !== "undefined") {
				const account = await findByUserId(request.getDb(), session.id)
				if (account) {
					return { valid: true, credentials: account }
				}
			}
			return { valid: false };
		}
	})

	server.auth.default('session')

	server.views({
		engines: {
			njk: {
				compile: (src, options) => {
					const template = Nunjucks.compile(src, options.environment)
					return (context) => {
						return template.render(context)
					}
				},

				prepare: (options, next) => {
					options.compileOptions.environment = Nunjucks.configure(
						options.path, { watch: false, autoescape: true }
					)
					return next()
				}
			}
		},
		relativeTo: __dirname + "/..",
		path: 'views/'
	})

	server.route({
		method: "GET",
		path: "/status",
		handler: (_request, _h) => {
			return "OK"
		},
		options: {
			auth: false
		}
	})

	server.route([
		{
			method: 'GET',
			path: '/',
			options: {
				handler: (request, h) => {
					return h.view("home", {
						credentials: request.auth.credentials,
						...flashesFrom(request)
					});
				},
			}
		}
	])

	server.route([
		{
			method: 'GET',
			path: '/sign-in',
			options: {
				auth: {
					mode: 'try'
				},
				plugins: {
					'hapi-auth-cookie': {
						redirectTo: false
					}
				},
				handler: async (request, h) => {
					if (request.auth.isAuthenticated) {
						return h.redirect('/');
					}
					return h.view("auth/sign-in.njk", { ...flashesFrom(request) })
				}
			}
		},
		{
			method: 'POST',
			path: '/sign-in',
			options: {
				auth: {
					mode: 'try'
				},
				handler: async (request, h) => {
					const { username, password } = request.payload;
					if (!username) {
						return h.view("auth/sign-in");
					}

					if (!password) {
						return h.view("auth/sign-in", {
							username
						});
					}

					const account = await checkForUser(request.getDb(), username, password)
					if (account) {
						request.cookieAuth.set({ id: account.id });
						request.yar.flash("success", "Sign in complete", true)
						return h.redirect('/');
					}

					return h.view("auth/sign-in", {
						username
					});
				}
			}
		},
		{
			method: 'POST',
			path: '/sign-out',
			options: {
				handler: (request, h) => {
					request.cookieAuth.clear();
					return h.redirect('/', { ...flashesFrom(request) });
				}
			}
		}
	])

	server.route({
		method: 'GET',
		path: '/public/{param*}',
		options: {
			auth: false
		},
		handler: {
			directory: {
				path: './public',
				redirectToSlash: true
			}
		}
	})

	server.route({
		method: 'GET',
		path: '/protected/{param*}',
		options: {},
		handler: {
			directory: {
				path: './protected',
				redirectToSlash: true
			}
		}
	})

	server.route({
		method: ["*"],
		path: '/{any*}',
		options: {
			auth: false
		},
		handler: (_request, h) => {
			return h.view('404.njk').code(404)
		}
	})

	if (process.env.DEV_MODE === "true") {
		server.events.on('response', function (request) {
			console.log(
				request.info.remoteAddress +
				': ' +
				request.method.toUpperCase() +
				' ' +
				request.url +
				': ' +
				request.response.statusCode
			);
		});
	}

	await server.start()

	console.log(`Server running on ${server.info.uri}`)
}

process.on("unhandledRejection", (err) => {
	console.error(err)
	process.exit(1)
})

init()
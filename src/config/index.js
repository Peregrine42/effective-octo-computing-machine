var express = require("express")
const nunjucks = require("nunjucks")
const session = require("express-session")
const csurf = require("csurf")
const morgan = require('morgan')
const helmet = require('helmet')
const { expressCspHeader, NONCE } = require('express-csp-header');
const rateLimiterMiddleware = require('./tooManyRequests');

function configurePreRouting(app) {
	app.set("view engine", "njk")
	nunjucks.configure("views", {
		autoescape: true,
		express: app
	})
	app.use(express.urlencoded({ extended: false }))
	app.use(session({
		secret: process.env.SESSION_SECRET,
		saveUninitialized: false,
		resave: false,
		name: 'effectiveOctoId',
		domain: !process.env.DOMAIN,
		unset: 'destroy',
		cookie: {
			maxAge: 1000 * 60 * 60 * 12,
			sameSite: true,
			httpOnly: true,
			secure: !process.env.DEV_MODE,
		}
	}))
	app.use(csurf())
	app.use(morgan('combined'))
	app.use(function (err, _req, res, next) {
		if (err.status === 403) {
			res.status(403).render("403")
		} else {
			next()
		}
	})
	app.use(express.static(__dirname + '/../../public'))
	app.use(helmet({
		contentSecurityPolicy: false, // this is handled by expressCspHeader
		crossOriginResourcePolicy: true,
		crossOriginEmbedderPolicy: true,
		crossOriginOpenerPolicy: true,
		originAgentCluster: true
	}))

	const dev = {
		...helmet.contentSecurityPolicy.getDefaultDirectives()
	}

	const prod = {
		...helmet.contentSecurityPolicy.getDefaultDirectives(),
		"script-src": ["'unsafe-inline'", "'strict-dynamic'", "https:", NONCE],
	}
	app.use(expressCspHeader({
		directives: process.env.DEV_MODE ? dev : prod
	}))
	app.use(function (req, res, next) {
		res.set(
			"Content-Security-Policy", `${res.get("Content-Security-Policy")};  require-trusted-types-for 'script'`
		)
		next()
	})
	app.use(rateLimiterMiddleware)
	app.use(function (req, res, next) {
		// if there's a flash message in the session request, 
		// make it available in the response, then delete it
		res.locals.sessionFlash = req.session.sessionFlash;
		delete req.session.sessionFlash;
		next();
	});

	return app
}

function configurePostRouting(app) {
	app.use(function (_req, res) {
		res.status(404).render("404")
	})
}

module.exports = { configurePreRouting, configurePostRouting }
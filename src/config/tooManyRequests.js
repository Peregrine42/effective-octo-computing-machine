const { RateLimiterMemory } = require('rate-limiter-flexible');

const rateLimiter = new RateLimiterMemory({
	keyPrefix: 'middleware',
	points: 20, // x requests
	duration: 1, // per x second(s) by IP
});

const rateLimiterMiddleware = (req, res, next) => {
	rateLimiter.consume(req.ip)
		.then(() => {
			next();
		})
		.catch((err) => {
			console.log(err)
			res.status(429).render("429");
		});
};

module.exports = rateLimiterMiddleware;
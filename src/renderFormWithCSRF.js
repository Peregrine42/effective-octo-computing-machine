function renderFormWithCSRF(req, res, view, vars) {
	let flashes = {}
	if (res.locals.sessionFlash) {
		if (res.locals.sessionFlash.type === "success") {
			flashes.success = res.locals.sessionFlash.message
		}
	}

	res.render(
		view,
		{
			...flashes,
			...vars,
			authenticated: !!(req.session && req.session.userId),
			csrf: {
				parameterName: "_csrf", token: req.csrfToken()
			},
			csp: {
				nonce: req.nonce
			}
		}
	)
}

module.exports = {
	renderFormWithCSRF
}
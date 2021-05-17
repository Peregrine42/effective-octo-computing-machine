const expect = require('chai').expect
const { browserLog } = require("../../../helpers/browserLog")
const { buildBrowser } = require("../../../helpers/buildBrowser")
const { getDbConnection } = require("../../../helpers/getDbConnection")
const { tryToSignInWith } = require("../../../helpers/tryToSignInWith")
const { resetDb } = require("../../../helpers/resetDb")
const { addTestAdminUser } = require("../../../helpers/addTestAdminUser")
const axios = require("axios")

describe("Auth", function () {
	it('rejects too many requests in a short space of time', async function () {
		let promises = []
		let errorResponses = []
		let successes = []
		for (let i = 0; i < 55; i += 1) {
			promises.push(axios.get("http://localhost:8080/sign-in")
				.then(r => {
					successes.push(r)
				})
				.catch(e => {
					errorResponses.push(e)
				}))
		}

		await Promise.all(promises)

		const tooManyRequestsCount = errorResponses
			.filter(e => e.response.status === 429)
			.length

		const successfulRequestsCount = successes
			.filter(r => r.status === 200)
			.length
		expect(tooManyRequestsCount).to.be.greaterThan(0)
		expect(successfulRequestsCount).to.be.greaterThan(0).and.lessThan(55)
	});
});
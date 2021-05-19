const axios = require("axios")
const FormData = require("form-data")


const init = async () => {
	const host = "http://localhost:8080"

	const csrfResponse = (await axios.get(host + "/sign-in", { withCredentials: true })).data

	const csrf = csrfResponse.match(/value=\"(\w+)\"/)[1]

	const form = new FormData()

	form.append("username", process.env.TEST_USERNAME)
	form.append("password", process.env.TEST_PASSWORD)
	form.append("csrf", csrf)

	const signInResponse = (await axios.post(host + "/sign-in", { withCredentials: true })).data

	console.log(signInResponse)

	const method = process.env.METHOD
	const path = process.env.PATH_PART

	let payload = process.env.PAYLOAD
	if (payload) {
		payload = JSON.parse(payload)
		await axios[method](path, payload)
	}
	console.log((await axios[method](host + path), { withCredentials: true }).data)
}

process.on("unhandledRejection", (err) => {
	console.log(err)
	process.exit(1)
})

init()
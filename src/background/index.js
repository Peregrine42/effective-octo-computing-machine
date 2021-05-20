const axios = require("axios")

function sleep(interval) {
	return new Promise(res => {
		setTimeout(res, interval)
	})
}

const init = async () => {
	console.log("setting up background...")
	console.log("background ready, pinging...")
	try {
		await axios.get("http://localhost:8081/done")
	} catch (e) {
	}
	console.log("ping sent.")

	while (true) {
		console.log("looping")
		await sleep(2000)
	}
}

process.on("unhandledRejection", (err) => {
	console.error(err)
	process.exit(1)
})

init()
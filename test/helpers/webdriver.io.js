const shell = require("shelljs")
const kill = require("tree-kill")
const execa = require('execa')
const axios = require("axios").default
const cp = require('child_process')

let driverChild
let testChild
let child
let backgroundChild
let backgroundReadyChild
let verbose = !!process.env.DEBUG

function debug(...messages) {
	if (verbose) {
		console.debug(...messages)
	}
}

function sleep(interval) {
	return new Promise(res => {
		setTimeout(res, interval)
	})
}

async function killAll(child) {
	await new Promise(res => {
		kill(child.pid, res)
	})
	await driverChild.kill()
}

process.on("unhandledRejection", async (err) => {
	console.error(err)
	process.exit(1)
})

async function deleteEverything() {
	if (driverChild) {
		debug("deleting driver")
		await killAll(driverChild)
		debug("deleted driver")
	}

	if (child) {
		debug("deleting server")
		await killAll(child)
		debug("deleted server")
	}

	if (backgroundChild) {
		debug("deleting background")
		await killAll(backgroundChild)
		debug("deleted background")
	}

	if (backgroundReadyChild) {
		debug("deleting background ready server")
		await killAll(backgroundReadyChild)
		debug("deleted background ready server")
	}

	console.log("cleanup")
}

async function poll(url, expectedErrorCode = null) {
	for (let i = 0; i < 120; i++) {
		try {
			debug("getting...")
			await axios.get(url)
			debug("success! the server is up")
			return true
		} catch (e) {
			if (e.code) {
				debug(e.code)
			} else if (e?.response?.statusText) {
				if (e.response.status === expectedErrorCode) {
					debug("success! the server is up")
					return true
				}
				debug(e.response.statusText)
			} else {
				debug(e)
			}
			await sleep(1000)
		}
		debug("looping")
	}
	throw new Error("No server found")
}

(async () => {
	axios.defaults.timeout = 500;

	if (process.platform === "win32") {
		var rl = require("readline").createInterface({
			input: process.stdin,
			output: process.stdout
		});

		rl.on("SIGINT", function () {
			process.emit("SIGINT");
		});
	}

	process.on("SIGINT", async function () {
		await deleteEverything()
		process.exit();
	});

	const path = process.argv.slice(2).join(" ")
	if (!path) throw ("no path given for mocha")

	child = execa('npm', ['start'],
		{
			all: true,
		}
	)
	child.all.pipe(process.stdout)
	await poll("http://localhost:8080/status")

	backgroundReadyChild = execa('npm', ['run', 'test:background:ready'],
		{
			all: true,
		}
	)
	backgroundReadyChild.all.pipe(process.stdout)
	await poll("http://localhost:8081", 403)

	backgroundChild = execa('npm', ['run', 'background'],
		{
			all: true,
		}
	)
	backgroundChild.all.pipe(process.stdout)
	await poll("http://localhost:8081")

	driverChild = execa('./node_modules/.bin/geckodriver',
		{
			all: true,
		}
	)
	await poll("http://localhost:4444", 405)

	console.log("starting main process...")
	testChild = execa(
		'npm',
		[
			"run",
			"test:mocha",
			"--",
		].concat(
			process.argv.slice(2)
		),
		{
			all: true,
		}
	)
	testChild.all.pipe(process.stdout)

	console.log("main process running...")

	try {
		await testChild
	} catch (_e) {
		// console.error(e)
	}
	await deleteEverything()
	process.exit(testChild.exitCode)
})().catch(async (e) => {
	await deleteEverything()
	console.error(e)
	process.exit(1)
})
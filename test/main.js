const shell = require("shelljs")
const kill = require("tree-kill")
const axios = require("axios").default
const { remote } = require('webdriverio')
const Nightwatch = require('nightwatch')

let verbose = false

function sleep(interval) {
	return new Promise(res => {
		setTimeout(res, interval)
	})
}

function debug(...messages) {
	if (verbose) {
		console.log(...messages)
	}
}

async function poll(url, expectedErrorCode = null) {
	for (let i = 0; i < 8; i++) {
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

describe('Main', function () {
	this.settings.start_session = false;
	let browser = null;

	before(async () => {
		await new Promise(res => {
			Nightwatch.cli(function (argv) {
				verbose = argv.verbose
				res()
			})
		})

		this.child = shell.exec("node index.js", { async: true, silent: true })
		await poll("http://localhost:8080/hello")

		this.driverChild = shell.exec("./node_modules/.bin/geckodriver", { async: true, silent: true })
		await poll("http://localhost:4444", 405)

		delete this.desiredCapabilities.name; // W3C protocol doesn't appear to like this capability
		delete this.desiredCapabilities.alwaysMatch
		this.desiredCapabilities["moz:firefoxOptions"] = {
			args: ['-headless']
		}

		browser = await remote({
			logLevel: this.argv.verbose ? 'trace' : 'warn', // if --verbose flag was passed to nightwatch cli tool
			capabilities: this.desiredCapabilities,
		});
	});

	it("displays 'hello world'", async function (nightwatch) {
		await browser.url("localhost:8080/hello");
		const body = await browser.$("body")
		const text = (await nightwatch.getText(body)).value
		nightwatch.assert.strictEqual(text, "Hello world!")
	});

	after(async () => {
		if (this.driverChild) {
			debug("deleting driver")
			await new Promise(res => {
				kill(this.driverChild.pid, res)
			})
			debug("deleted driver")
		}

		if (this.child) {
			debug("deleting server")
			await new Promise(res => {
				kill(this.child.pid, res)
			})
			debug("deleted server")
		}
	});
});

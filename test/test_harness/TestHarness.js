const shell = require("shelljs")
const kill = require("tree-kill")
const axios = require("axios").default
const { remote } = require('webdriverio')
const Nightwatch = require('nightwatch')

class TestHarness {
    constructor() {
        this.verbose = false
    }

    async init(nightwatchThis) {
        await new Promise(res => {
            Nightwatch.cli((argv) => {
                this.verbose = argv.verbose
                res()
            })
        })

        this.child = shell.exec("node index.js",
            {
                async: true
            }
        )
        await this.poll("http://localhost:8080/status")

        this.driverChild = shell.exec(
            "./node_modules/.bin/geckodriver",
            {
                async: true,
                silent: !this.verbose
            }
        )
        await this.poll("http://localhost:4444", 405)

        delete nightwatchThis.desiredCapabilities.name; // W3C protocol doesn't appear to like this capability
        delete nightwatchThis.desiredCapabilities.alwaysMatch
        nightwatchThis.desiredCapabilities["moz:firefoxOptions"] = {
            args: ['-headless']
        }

        nightwatchThis.browser = await remote({
            logLevel: nightwatchThis.argv.verbose ? 'trace' : 'warn', // if --verbose flag was passed to nightwatch cli tool
            capabilities: nightwatchThis.desiredCapabilities,
        });
    }

    async deleteEverything() {
        if (this.driverChild) {
            this.debug("deleting driver")
            await new Promise(res => {
                kill(this.driverChild.pid, res)
            })
            this.debug("deleted driver")
        }

        if (this.child) {
            this.debug("deleting server")
            await new Promise(res => {
                kill(this.child.pid, res)
            })
            this.debug("deleted server")
        }
    }

    debug(...messages) {
        if (this.verbose) {
            console.log(...messages)
        }
    }

    async poll(url, expectedErrorCode = null) {
        for (let i = 0; i < 8; i++) {
            try {
                this.debug("getting...")
                await axios.get(url)
                this.debug("success! the server is up")
                return true
            } catch (e) {
                if (e.code) {
                    this.debug(e.code)
                } else if (e?.response?.statusText) {
                    if (e.response.status === expectedErrorCode) {
                        this.debug("success! the server is up")
                        return true
                    }
                    this.debug(e.response.statusText)
                } else {
                    this.debug(e)
                }
                await this.sleep(1000)
            }
            this.debug("looping")
        }
        throw new Error("No server found")
    }

    sleep(interval) {
        return new Promise(res => {
            setTimeout(res, interval)
        })
    }
}

module.exports = TestHarness
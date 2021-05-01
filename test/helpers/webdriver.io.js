const shell = require("shelljs")
const kill = require("tree-kill")
const axios = require("axios").default
const { serverLog } = require("./serverLog")

let driverChild
let testChild
let child
let testsFinished
const testsTimeout = 2 * (60 * 10)
let verbose

function debug(...messages) {
    if (verbose) {
        console.debug(...messages)
    }
}

async function deleteEverything() {
    if (driverChild) {
        debug("deleting driver")
        await new Promise((res) => {
            kill(driverChild.pid, "SIGQUIT", res)
        })
        debug("deleted driver")
    }


    if (child) {
        debug("deleting server")
        await new Promise(res => {
            kill(child.pid, res)
        })
        debug("deleted server")
    }

    console.log("cleanup complete")
}

async function poll(url, expectedErrorCode = null) {
    for (let i = 0; i < 60; i++) {
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

function sleep(interval) {
    return new Promise(res => {
        setTimeout(res, interval)
    })
}

(async () => {
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

    const result = shell.exec("mvn clean package spring-boot:repackage")
    if (result.code !== 0) throw new Error("Server failed to compile")
    child = shell.exec("java -jar target/*.jar -Xmx1024m --debug",
        {
            async: true,
            silent: true,
        }
    )
    child.stdout.on('data', function (data) {
        serverLog(data.toString().slice(0, -1))
    });

    child.stderr.on('data', function (data) {
        serverLog(data.toString().slice(0, -1))
    });

    await poll("http://localhost:8080/status")

    driverChild = shell.exec(
        "./node_modules/.bin/geckodriver",
        {
            async: true,
            silent: !verbose
        }
    )
    await poll("http://localhost:4444", 405)

    console.log("starting main process...")
    testChild = shell.exec(`./node_modules/.bin/mocha --color ${path}`, {
        async: true
    })
    console.log("main process running...")

    testChild.on("close", function () {
        testsFinished = true
    })

    for (let i = 0; i < testsTimeout; i += 1) {
        if (testsFinished) {
            break
        }
        await sleep(100)
    }

    await deleteEverything()
})().catch(async (e) => {
    await deleteEverything()
    console.error(e)
})
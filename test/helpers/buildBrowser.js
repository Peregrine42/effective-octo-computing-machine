module.exports = {
    buildBrowser: async function (remote) {
        return await remote({
            logLevel: 'warn',
            capabilities: {
                browserName: 'firefox',
                "moz:firefoxOptions": {
                    args: ['-headless']
                }
            }
        })
    }
}
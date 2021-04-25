const TestHarness = require("./test_harness/TestHarness")

describe('Main', function () {
	this.settings.start_session = false;

	before(async () => {
		this.harness = new TestHarness()
		await this.harness.init(this)
	});

	it("displays 'hello world'", async function (nightwatch) {
		await this.browser.url("localhost:8080/hello");
		const body = await this.browser.$("body")
		const text = (await nightwatch.getText(body)).value
		nightwatch.assert.strictEqual(text, "Hello world!")
	});

	after(async () => {
		await this.harness.deleteEverything()
	});
});

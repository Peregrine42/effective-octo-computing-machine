const path = require("path")

module.exports = (env) => {
	return {
		mode: env.development ? "development" : "production",
		devtool: env.development ? "inline-source-map" : undefined,
		entry: "./src/client/app.ts",
		output: {
			path: path.join(process.cwd(), 'static', 'protected', 'js'),
			filename: "home.js"
		},
		resolve: {
			extensions: [".ts", ".tsx", ".js"]
		},
		module: {
			rules: [
				{ test: /\.tsx?$/, loader: "ts-loader" }
			]
		}
	}
}
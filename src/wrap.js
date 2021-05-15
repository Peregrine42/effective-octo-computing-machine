function wrap(originalRouter) {
	return new Proxy(originalRouter, {
		get: function (target, prop, receiver) {
			if (["get", "post"].includes(prop)) {
				return function (...args) {
					if (typeof (args[0]) !== "function") {
						const newArgs = [...args]

						if (args[0] === "UNAUTHENTICATED") {
							newArgs.splice(0, 1)
						} else {
							newArgs.splice(1, 0, (req, res, next) => {
								console.log("hi")
								next()
							})
						}

						return Reflect.get(target, prop, receiver).bind(target)(...newArgs)
					} else {
						return Reflect.get(target, prop, receiver).bind(target)(...args)
					}
				}
			} else {
				return Reflect.get(target, prop, receiver)
			}
		},
		isWrapped: true
	})
}

module.exports = {
	wrap
}
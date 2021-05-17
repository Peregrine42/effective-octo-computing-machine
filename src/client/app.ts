import axios from "axios"

const start = async () => {
	await new Promise(res => window.addEventListener("load", res))

	const csrfElement = document.getElementById("csrf") as HTMLInputElement
	const csrf = csrfElement.value

	console.log(csrf)

	const response = await axios.get("/messages")

	// const response = await axios.post("/messages", {
	// 	csrf,
	// 	recipient: "testuser",
	// 	message: JSON.stringify({ text: "Hi there" })
	// })

	console.log(response)
};

start();
import axios from "axios"

const start = async () => {
	await new Promise(res => window.addEventListener("load", res))

	const csrfElement = document.getElementById("csrf") as HTMLInputElement
	const csrf = csrfElement.value

	// const response = await axios.get("/messages")

	const response = await axios.post("/admin/cleanup/messages", {
		csrf,
	})

	console.log(response.data)
};

start();
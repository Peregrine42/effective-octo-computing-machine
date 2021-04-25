const express = require("express")
const { router: helloRouter } = require("./routes/hello")
const app = express()
const port = 8080

app.use("/", helloRouter)

app.get("/status", (req, res) => {
    res.status(200)
    res.send()
})

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})
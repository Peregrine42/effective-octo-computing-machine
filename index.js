const express = require('express')
const app = express()
const port = 8080

app.get('/status', (req, res) => {
    res.status(200)
    res.send()
})

app.get('/hello', (req, res) => {
    res.send('Hello world!')
})

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})
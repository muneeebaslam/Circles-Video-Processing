const path = require('path')
const express = require('express')
const PORT = 5000
const app = express()
const cors = require("cors");

global.__basedir = __dirname;

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

app.use('/api', require('./routes/video'))

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))

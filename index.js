const connectToMongo=require('./db')
const express = require('express')
const cors = require("cors")


connectToMongo();

const app = express()
const port = 5000

// Use cors on all routes
app.use(cors())
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))
app.use('/api/events', require('./routes/events'))
app.use('/api/todo', require('./routes/todo'))


app.listen(port, () => {
  console.log(`backend listening on port ${port}`)
})
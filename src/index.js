const express = require('express')
const cors = require('cors')
const connectDB = require('./configs/connectDb')
const authRouter = require('./routers/authRouter')
const errorMiddleHandle = require('./middlewares/errorMiddleware')
const app = express()
require('dotenv').config()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = process.env.PORT || 3002

app.use('/auth', authRouter)

connectDB()

app.use(errorMiddleHandle)

app.listen(PORT, (err) => {
  if (err) {
    console.log(err)
    return
  }

  console.log(`Server starting at http://localhost:${PORT}`)
})

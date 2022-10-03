import 'dotenv/config'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import cors from 'cors'
import mongoose from 'mongoose'
import keys from './config/keys'
import router from './routes'
import { requestLogger, errorHandler } from './middleware'
import seedDatabase from './seedDatabase'
import { User } from './models'

const createError = require('http-errors')

mongoose.connect(keys.database.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})

mongoose.connection.on('connected', () => {
  console.log('connected to mongoDB')
  seedDatabase()
})

mongoose.connection.on('error', (err) => {
  console.log('err connecting', err)
})

const app = express()

// middleware
app.use(logger('dev'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(requestLogger)


// api router
app.use(keys.app.apiEndpoint, router)

// ------------------------------------- Hello world

app.get('/hello/:name', (req,res) => {
  const message = {message: `Hello ${req.params.name}!`}
  if (message) {
    return res.send(message)
  } else {
    return res.status(422).json({ error: 'Cannot find name' })
  }
})

// ------------------------------------- Add 2 numbers

app.get('/add/:x/:y', (req, res) => {
const x = parseInt(req.params.x)
const y = parseInt(req.params.y)

if (typeof(x) === 'number' && typeof(y) === 'number') {
  const sum = x + y
  const message = {sum: sum}
  return res.send(message)
} else {
  console.log("Please include 2 numbers only")
  return res.status(422).json({ error: 'Inputs need to be numbers' })
}
})

// --------------------------------------- Teapot

app.get('/teapot', (req, res) => {
return res
  .status(418)
  .json(true)
})

app.post('/teapot', (req, res) => {

const areYouATeapot = req.body.areYouATeapot

if (areYouATeapot === 'true' || areYouATeapot === 'false') {
  let message = 'Yes'
  if (areYouATeapot === 'false') {
      message = 'No'
  }
  return res
  .status(200)
  .json({amIATeapot: message})
} else {
  return
}

})


// ------------------ ALICE

app.get('/alice', async (req, res) => {
  console.log('searched /alice')
  try {
    let alice = await User.findOne({ username: 'Caleb2'}).exec()
    console.log(alice)
    return res
      .status(200)
      .json(alice)

  } catch(error) {
    return error
  }
})

// ---------------- TOP 3 POSTERS

// used code from: https://www.tutorialspoint.com/how-to-sort-an-array-of-objects-based-on-the-length-of-a-nested-array-in-javascript

app.get('/top', async (req, res) => {

  try {
    let allUsers = await User.find() // creates an array of all users

    const sortByPostNumber = (a, b) => { // sorting function 
      if (a.posts.length > b.posts.length) {
       return -1;
        } else {
         return 1;
       }
     }

    let top3Users = allUsers.sort(sortByPostNumber).slice(0, 3) // sort users by sorting ()

    return res
      .json(top3Users)
  } catch(error) {
    return error
  }
})


// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404, 'NotFound'))
})


// error handler
app.use(errorHandler)

module.exports = app

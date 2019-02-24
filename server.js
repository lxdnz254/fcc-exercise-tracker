const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

/*
// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})
*/

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const api = '/api/exercise'
const db = require('./database.js')

app.post(api+'/add', (req, res) => {
  var id = req.body.userId
  var exercise = {description: req.body.description,
                   duration: req.body.duration}
  
  !(req.body.date) ? exercise.date = Date(Date.now())
    : exercise.date = Date.parse(req.body.date)
  
  db.addExerciseToUser(id, exercise, (data) => {
    res.json({_id: data._id, username: data.username, exercises: data.exercises})
  })
})

app.post(api+'/new-user', (req, res) => {
  db.createAndSaveNewUser(req.body.username, (data)=>{
    res.json({_id: data._id, username: data.username})
  })
})

app.get(api+'/log', (req, res, next) => {
  db.findUser(req.query.id, (data) => {
    // check for from/to/limit queries
    
    var time = data.exercises.map(d => d.duration).reduce((a,b) => a+b)
    var user = data.username
    var exercises = data.exercises.map(d => d.description + " - " + d.date)
    res.json({user: user, exercises: exercises, totalDuration: time })
  })
})

app.get(api+'/users', (req, res) => {
  db.findAllUsers((data) => {
    res.json({users: data})
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

const mongo = require('mongodb');
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_CLUSTER_URI || 'mongodb://localhost/exercise-track' )

var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: String,
  exercises: [{
    description: String,
    duration: Number,
    date: {type: Date, default: Date.now}
  }]
})

var ExerciseUser = mongoose.model('ExerciseUser', userSchema)

var createAndSaveNewUser = (username, done) => {
  var newUser = new ExerciseUser({username: username, exercises: []})
  newUser.save((err, data) => {
    if (err) return done(err)
    done(data)
  })
} 

var addExerciseToUser = (userId, exercise, done) => {
  console.log("Adding exercise:" + exercise.date)
  findUser(userId, (user) => {
    user.exercises.push(exercise)
    user.save((err, data) => {
      if (err) return done(err)
      console.log("Saved")
      done(data)
    })
  })
}

var findUser = (userId, done) => {
  ExerciseUser.findById(userId, (err, data) => {
    if (err) return done(err)
    done(data)
  })
}

var findAllUsers = (done) => {
  ExerciseUser.find( (err, data) => {
    if (err) return done(err)
    done(data)
  })
}


exports.createAndSaveNewUser = createAndSaveNewUser;
exports.addExerciseToUser = addExerciseToUser;
exports.findUser = findUser;
exports.findAllUsers = findAllUsers;
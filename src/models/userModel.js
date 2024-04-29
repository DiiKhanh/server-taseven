/** @format */

const { default: mongoose } = require('mongoose')

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  fullname: {
    type: String
  },
  bio: {
    type: String
  },
  email: {
    type: String,
    unique: true,
    require: true
  },
  password: {
    type: String,
    require: true
  },
  photoUrl: {
    type: String
  },
  filename: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  },
  fcmTokens: {
    type: [String]
  }
})

const UserModel = mongoose.model('users', UserSchema)
module.exports = UserModel

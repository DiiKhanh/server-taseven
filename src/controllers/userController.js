const asyncHandle = require('express-async-handler')
const UserModel = require('../models/userModel')
const cloudinary = require('../configs/cloudinaryConfig')


require('dotenv').config()


const getAllUsers = asyncHandle(async (req, res) => {
  const users = await UserModel.find()


  const data = []
  users.forEach((item) =>
    data.push({
      email: item.email ?? '',
      username: item.username ?? '',
      id: item.id
    })
  )


  res.status(200).json({
    message: 'Get users successfully!!!',
    data
  })
})


const getProfile = asyncHandle(async (req, res) => {
  const { id } = req.query

  if (id) {
    const profile = await UserModel.findOne({ _id: id })
    return res.status(200).json({
      message: 'get profile success',
      data: {
        id: profile._id,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
        username: profile.username ?? '',
        email: profile.email ?? '',
        photoUrl: profile.photoUrl ?? '',
        fullname: profile.fullname ?? '',
        filename: profile.filename ?? ''
      }
    })
  } else {
    res.sendStatus(401)
    throw new Error('Missing id')
  }
})


module.exports = {
  getAllUsers,
  getProfile
}

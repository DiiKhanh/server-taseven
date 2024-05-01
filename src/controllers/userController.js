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

const updateProfile = asyncHandle(async (req, res) => {
  const { id } = req.query
  const fileData = req.file
  const body = req.body
  if (!fileData) {
    res.sendStatus(401)
    throw new Error('Missing data')
  }
  let newData
  if (fileData.path) {
    newData = {
      fullname: body.fullname,
      photoUrl: fileData.path,
      filename: fileData.filename
    }
  } else {
    newData = {
      fullname: body.fullname
    }
  }
  if (id && newData) {
    const user = await UserModel.findById(id)
    if (user && user.filename) {
      await cloudinary.uploader.destroy(user.filename)
    }
    const result = await UserModel.findByIdAndUpdate(id, newData)


    return res.status(200).json({
      message: 'Update profile successfully!!',
      data: result
    })
  } else {
    if (fileData.path) {
      await cloudinary.uploader.destroy(fileData.filename)
    }
    res.sendStatus(401)
    throw new Error('Missing data')
  }
})


const updateProfileWithoutFile = asyncHandle(async (req, res) => {
  const { id } = req.query
  const body = req.body

  if (id && body) {
    const result = await UserModel.findByIdAndUpdate(id, body)
    res.status(200).json({
      message: 'Update profile successfully!!',
      data: result
    })
  } else {
    res.sendStatus(401)
    throw new Error('Missing data')
  }
})


module.exports = {
  getAllUsers,
  getProfile,
  updateProfileWithoutFile,
  updateProfile
}

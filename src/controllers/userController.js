const asyncHandle = require('express-async-handler')
const UserModel = require('../models/userModel')
const EventModel = require('../models/eventModel')
const cloudinary = require('../configs/cloudinaryConfig')

const { JWT } = require('google-auth-library')

const nodemailer = require('nodemailer')
require('dotenv').config()

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.USERNAME_EMAIL,
    pass: process.env.PASSWORD_EMAIL
  }
})

const handleSendMail = async (val) => {
  try {
    await transporter.sendMail(val)

    return 'OK'
  } catch (error) {
    return error
  }
}


const updateFcmToken = asyncHandle(async (req, res) => {
  const { uid, fcmTokens } = req.body


  await UserModel.findByIdAndUpdate(uid, {
    fcmTokens
  })

  res.status(200).json({
    message: 'Fcmtoken updated',
    data: []
  })
})

const getAccessToken = () => {
  return new Promise(function (resolve, reject) {
    const key = require('../taseven-accesstoken-file.json')
    const jwtClient = new JWT(
      key.client_email,
      null,
      key.private_key,
      ['https://www.googleapis.com/auth/cloud-platform'],
      null
    )
    jwtClient.authorize(function (err, tokens) {
      if (err) {
        reject(err)
        return
      }
      resolve(tokens.access_token)
    })
  })
}

const handleSendNotification = async ({
  fcmTokens,
  title,
  body,
  data
}) => {

  var request = require('request')
  var options = {
    method: 'POST',
    url: 'https://fcm.googleapis.com/v1/projects/evenhub-f8c6e/messages:send',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`
    },
    body: JSON.stringify({
      message: {
        token: fcmTokens,
        notification: {
          title,
          body

        },
        data
      }
    })
  }
  request(options, function (error, response) {
    console.log(response)
    if (error) throw new Error(error)
    console.log(error)
  })
}


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

const pushInviteNotifications = asyncHandle(async (req, res) => {
  const { ids, eventId } = req.body

  ids.forEach(async (id) => {
    const user = await UserModel.findById(id)

    if (user) {

      const fcmTokens = user.fcmTokens

      if (fcmTokens.length > 0) {
        fcmTokens.forEach(
          async (token) =>
          {
            await handleSendNotification({
              fcmTokens: token,
              title: 'Taseven - Notification',
              subtitle: '',
              body: 'Bạn đã được mời tham gia vào sự kiện nào đó',
              data: {
                eventId
              }
            })

          }
        )
      } else {
        // Send mail
        const data = {
          from: `"Support Taseven Appplication" <${process.env.USERNAME_EMAIL}>`,
          to: user.email,
          subject: 'Verification email code',
          text: 'Your code to verification email',
          html: `<h1>${eventId}</h1>`
        }
        await handleSendMail(data)
      }
    } else {
      console.log('User not found')
      res.sendStatus(401)
      throw new Error('User not found')
    }

  })

  res.status(200).json({
    message: 'success',
    data: []
  })
})

const getEventsFollowed = asyncHandle(async (req, res) => {
  const { uid } = req.query


  if (uid) {
    const events = await EventModel.find({ followers: { $all: uid } })


    const ids = []


    events.forEach((event) => ids.push(event.id))


    res.status(200).json({
      message: 'fafa',
      data: ids
    })
  } else {
    res.sendStatus(401)
    throw new Error('Missing uid')
  }
})

const getFollowes = asyncHandle(async (req, res) => {
  const { uid } = req.query


  if (uid) {
    const users = await UserModel.find({ following: { $all: uid } })


    const ids = []


    if (users.length > 0) {
      users.forEach((user) => ids.push(user._id))
    }


    res.status(200).json({
      message: '',
      data: ids
    })
  } else {
    res.sendStatus(404)
    throw new Error('can not find uid')
  }
})

const getFollowings = asyncHandle(async (req, res) => {
  const { uid } = req.query


  if (uid) {
    const user = await UserModel.findById(uid)


    res.status(200).json({
      message: '',
      data: user.following
    })
  } else {
    res.sendStatus(404)
    throw new Error('can not find uid')
  }
})

const updateInterests = asyncHandle(async (req, res) => {
  const body = req.body
  const { uid } = req.query

  if (uid && body) {
    await UserModel.findByIdAndUpdate(uid, {
      interests: body
    })

    res.status(200).json({
      message: 'Update interested successfully',
      data: body
    })
  } else {
    res.sendStatus(404)
    throw new Error('Missing data')
  }
})

const toggleFollowing = asyncHandle(async (req, res) => {
  const { uid, authorId } = req.body

  if (uid && authorId) {
    const user = await UserModel.findById(uid)

    if (user) {
      const { following } = user

      const items = following ?? []
      const index = items.findIndex((element) => element === authorId)
      if (index !== -1) {
        items.splice(index, 1)
      } else {
        items.push(`${authorId}`)
      }

      await UserModel.findByIdAndUpdate(uid, {
        following: items
      })

      res.status(200).json({
        message: 'update following successfully!!!',
        data: items
      })
    } else {
      res.sendStatus(404)
      throw new Error('user or author not found!!!')
    }
  } else {
    res.sendStatus(404)
    throw new Error('Missing data!!')
  }
})


module.exports = {
  getAllUsers,
  getProfile,
  updateProfileWithoutFile,
  updateProfile,
  pushInviteNotifications,
  getEventsFollowed,
  getFollowes,
  getFollowings,
  updateInterests,
  toggleFollowing
}

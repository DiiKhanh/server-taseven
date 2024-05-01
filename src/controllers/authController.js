const UserModel = require('../models/userModel')
const bcryp = require('bcrypt')
const asyncHandle = require('express-async-handler')
const jwt = require('jsonwebtoken')
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

const getJsonWebToken = async (email, id) => {
  const payload = {
    email,
    id
  }
  const token = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: '7d'
  })

  return token
}

const handleSendMail = async (val) => {
  try {
    await transporter.sendMail(val)

    return 'OK'
  } catch (error) {
    return error
  }
}

const verification = asyncHandle(async (req, res) => {
  const { email } = req.body

  const verificationCode = Math.round(1000 + Math.random() * 9000)

  try {
    const data = {
      from: `'Support Taseven Appplication' <${process.env.USERNAME_EMAIL}>`,
      to: email,
      subject: 'Verification email code',
      text: 'Your code to verification email',
      html: `<h1>${verificationCode}</h1>`
    }

    await handleSendMail(data)

    res.status(200).json({
      message: 'Send verification code successfully!!!',
      data: {
        code: verificationCode
      }
    })
  } catch (error) {
    res.status(401)
    throw new Error('Can not send email')
  }
})

const register = asyncHandle(async (req, res) => {
  const { email, username, password } = req.body

  const existingUser = await UserModel.findOne({ email })

  if (existingUser) {
    res.status(400)
    throw new Error('User has already exist!!!')
  }

  const salt = await bcryp.genSalt(10)
  const hashedPassword = await bcryp.hash(password, salt)

  const newUser = new UserModel({
    email,
    username,
    password: hashedPassword
  })

  await newUser.save()

  res.status(200).json({
    message: 'Register new user successfully',
    data: {
      email: newUser.email,
      id: newUser._id,
      accesstoken: await getJsonWebToken(email, newUser.id),
      username: newUser.username
    }
  })
})

const login = asyncHandle(async (req, res) => {
  const { email, password, username } = req.body

  let existingUser
  if (email) {
    existingUser = await UserModel.findOne({ email })
  } else if (username) {
    existingUser = await UserModel.findOne({ username })
  }

  if (!existingUser) {
    res.status(403)
    throw new Error('User not found!!!')
  }

  const isMatchPassword = await bcryp.compare(password, existingUser.password)

  if (!isMatchPassword) {
    res.status(401)
    throw new Error('Email or Password is not correct!')
  }

  const accesstoken = await getJsonWebToken(existingUser.email, existingUser.id)

  res.status(200).json({
    message: 'Login successfully',
    data: {
      id: existingUser.id,
      email: existingUser.email,
      accesstoken,
      fcmTokens: existingUser.fcmTokens ?? [],
      photoUrl: existingUser.photoUrl ?? '',
      username: existingUser.username ?? '',
      filename: existingUser.filename ?? '',
      fullname: existingUser.fullname ?? ''
    }
  })
})

const forgotPassword = asyncHandle(async (req, res) => {
  const { email } = req.body

  const randomPassword = Math.round(100000 + Math.random() * 99000)

  const data = {
    from: `'New Password' <${process.env.USERNAME_EMAIL}>`,
    to: email,
    subject: 'Verification email code',
    text: 'Your code to verification email',
    html: `<h1>${randomPassword}</h1>`
  }

  const user = await UserModel.findOne({ email })
  if (user) {
    const salt = await bcryp.genSalt(10)
    const hashedPassword = await bcryp.hash(`${randomPassword}`, salt)

    await UserModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      isChangePassword: true
    })
      .then(() => {
        console.log('Done')
      })
      .catch((error) => console.log(error))

    await handleSendMail(data)
      .then(() => {
        res.status(200).json({
          message: 'Send email new password successfully!!!',
          data: []
        })
      })
      .catch(() => {
        res.status(401)
        throw new Error('Can not send email')
      })
  } else {
    res.status(401)
    throw new Error('User not found!!!')
  }
})

const handleLoginWithGoogle = asyncHandle(async (req, res) => {
  const userInfo = req.body

  const existingUser = await UserModel.findOne({ email: userInfo.email })
  let user
  if (existingUser) {
    await UserModel.findByIdAndUpdate(existingUser.id, {
      updatedAt: Date.now()
    })
    user = { ...existingUser }
    user.accesstoken = await getJsonWebToken(userInfo.email, userInfo.id)

    if (user) {
      const data = {
        accesstoken: user.accesstoken,
        id: existingUser._id,
        email: existingUser.email,
        fcmTokens: existingUser.fcmTokens ?? [],
        photoUrl: existingUser.photoUrl ?? '',
        username: existingUser.username ?? '',
        filename: existingUser.filename ?? '',
        fullname: existingUser.fullname ?? ''
      }

      res.status(200).json({
        message: 'Login with google successfully!!!',
        data
      })
    } else {
      res.sendStatus(401)
      throw new Error('Error google login')
    }
  } else {
    const pos = userInfo.email.indexOf('@')

    const newUser = new UserModel({
      email: userInfo.email,
      fullname: userInfo.name,
      photoUrl: userInfo.photo,
      username: userInfo.email.slice(0, pos)
    })
    await newUser.save()
    user = { ...newUser }
    user.accesstoken = await getJsonWebToken(userInfo.email, newUser.id)

    if (user) {
      res.status(200).json({
        message: 'Login with google successfully!!!',
        data: {
          accesstoken: user.accesstoken,
          id: newUser._id,
          email: newUser.email,
          photoUrl: newUser.photoUrl,
          username: newUser.username,
          fullname: newUser.fullname ?? '',
          fcmTokens: newUser.fcmTokens ?? [],
          filename: newUser.filename ?? ''
        }
      })
    } else {
      res.sendStatus(401)
      throw new Error('Error login google')
    }
  }
})

module.exports = {
  register,
  login,
  verification,
  forgotPassword,
  handleLoginWithGoogle
}

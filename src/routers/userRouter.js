const Router = require('express')
const {
  getAllUsers,
  getProfile
} = require('../controllers/userController')


const userRouter = Router()


userRouter.get('/get-all', getAllUsers)
userRouter.get('/get-profile', getProfile)
module.exports = userRouter

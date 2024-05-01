const Router = require('express')
const {
  getAllUsers,
  getProfile,
  updateProfileWithoutFile,
  updateProfile
} = require('../controllers/userController')

const uploadCloud = require('../middlewares/uploadMiddleware')
const userRouter = Router()


userRouter.get('/get-all', getAllUsers)
userRouter.get('/get-profile', getProfile)
userRouter.patch('/update-profile', uploadCloud.single('image'), updateProfile)
userRouter.patch('/update-profile-nofile', updateProfileWithoutFile)
module.exports = userRouter
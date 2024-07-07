const Router = require('express')
const {
  getAllUsers,
  getProfile,
  updateProfileWithoutFile,
  updateProfile,
  pushInviteNotifications,
  updateFcmToken
} = require('../controllers/userController')

const uploadCloud = require('../middlewares/uploadMiddleware')
const userRouter = Router()


userRouter.get('/get-all', getAllUsers)
userRouter.get('/get-profile', getProfile)
userRouter.patch('/update-profile', uploadCloud.single('image'), updateProfile)
userRouter.patch('/update-profile-nofile', updateProfileWithoutFile)
userRouter.post('/update-fcmtoken', updateFcmToken)
userRouter.post('/send-invite', pushInviteNotifications)
module.exports = userRouter
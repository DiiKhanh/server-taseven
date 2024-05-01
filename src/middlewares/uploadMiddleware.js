const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')
const cloudinary = require('../configs/cloudinaryConfig')

const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ['jpg', 'png'],
  params: {
    folder: 'taseven_app'
  }
})

const uploadCloud = multer({ storage })

module.exports = uploadCloud

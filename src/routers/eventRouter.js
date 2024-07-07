const Router = require('express')
const {
  createCategory,
  getCategories,
  updateCategory,
  getCategoryDetail,
  getEvents
} = require('../controllers/eventController')

const eventRouter = Router()

eventRouter.post('/create-category', createCategory)
eventRouter.get('/get-categories', getCategories)
eventRouter.put('/update-category', updateCategory)
eventRouter.get('/get-category', getCategoryDetail)
eventRouter.get('/get-events', getEvents)

module.exports = eventRouter
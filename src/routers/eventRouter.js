const Router = require('express')
const {
  createCategory,
  getCategories,
  updateCategory,
  getCategoryDetail,
  getEvents,
  getEventById,
  getFollowers,
  updateFollowers,
  handleAddNewBillDetail,
  handleUpdatePaymentSuccess
} = require('../controllers/eventController')

const eventRouter = Router()

eventRouter.post('/create-category', createCategory)
eventRouter.get('/get-categories', getCategories)
eventRouter.put('/update-category', updateCategory)
eventRouter.get('/get-category', getCategoryDetail)
eventRouter.get('/get-events', getEvents)
eventRouter.get('/get-event', getEventById)
eventRouter.get('/followers', getFollowers)
eventRouter.post('/update-followes', updateFollowers)
eventRouter.post('/buy-ticket', handleAddNewBillDetail)
eventRouter.get('/update-payment-success', handleUpdatePaymentSuccess)

module.exports = eventRouter
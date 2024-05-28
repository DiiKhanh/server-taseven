//
const asyncHandle = require('express-async-handler');
const EventModel = require('../models/eventModel');
const CategoryModel = require('../models/categoryModel');
const BillModel = require('../models/billModel');

const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 587,
	auth: {
		user: process.env.USERNAME_EMAIL,
		pass: process.env.PASSWORD_EMAIL,
	},
});

const handleSendMail = async (val) => {
	try {
		await transporter.sendMail(val);

		return 'OK';
	} catch (error) {
		return error;
	}
};

const addNewEvent = asyncHandle(async (req, res) => {
	const body = req.body;

	
	const data = { ...body };
	data.price = parseFloat(body.price);

	if (data) {
		const newEvent = new EventModel(data);

		await newEvent.save();

		res.status(200).json({
			message: 'Add new Event successfully!!!',
			data: newEvent,
		});
	} else {
		res.status(401);
		throw new Error('Event data not found!!!');
	}
});

const getEventById = asyncHandle(async (req, res) => {
	const { id } = req.query;

	const item = await EventModel.findById(id);

	res.status(200).json({
		message: 'Event detail',
		data: item ? item : [],
	});
});

const createCategory = asyncHandle(async (req, res) => {
	const data = req.body;

	const newCategory = new CategoryModel(data);

	newCategory.save();
	res.status(200).json({
		message: 'Add new category successfully!!!',
		data: newCategory,
	});
});

const updateCategory = asyncHandle(async(req, res) => {
	const data = req.body;
	const { id } = req.query;

	const item = await CategoryModel.findByIdAndUpdate(id, data);

	res.status(200).json({
		message: 'Update category successfully!!!',
		data: item,
	});
	
	
})

const getCategories = asyncHandle(async (req, res) => {
	const items = await CategoryModel.find({});

	res.status(200).json({
		message: 'get successfully!!!',
		data: items,
	});
});
const getCategoryDetail = asyncHandle(async (req, res) => {

	const {id} = req.query

	const item = await CategoryModel.findById(id);

	res.status(200).json({
		message: 'get successfully!!!',
		data: item,
	});
});

const joinEvent = asyncHandle(async (req, res) => {
	const {uid, eventId} = req.query

	const itemEvent = await EventModel.findById(eventId)

	const joined = itemEvent.joined ? itemEvent.joined : []
	
	if (joined.includes(uid)) {
		const index = joined.findIndex(element => element === uid)

		joined.splice(index, 1)
	}else{
		joined.push(uid)
	}

	await EventModel.findByIdAndUpdate(eventId, {
		joined
	})
	
	res.status(200).json({
		message: 'Added',
		data: []
	})
})

const updateEvent = asyncHandle(async (req, res) => {
	const data = req.body;
	const { id } = req.query;

	const item = await EventModel.findByIdAndUpdate(id, data);

	res.status(200).json({
		message: 'Update event successfully!!!',
		data: item,
	});
});
const getEventsByCategoyId = asyncHandle(async (req, res) => {
	const { id } = req.query;

	const items = await EventModel.find({ categories: { $all: id } });

	res.status(200).json({
		message: 'get Events by categories successfully!!!',
		data: items,
	});
});
module.exports = {
	addNewEvent,
	createCategory,
	getCategories,
	updateCategory,
	getCategoryDetail,
	getEventById,
	updateEvent,
	getEventsByCategoyId,
	joinEvent
};

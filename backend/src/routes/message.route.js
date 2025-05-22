const express = require('express');
const router = express.Router();
const protectRoute  = require('../middlewares/auth.middleware');
const {getUsersForSideBar, getMessages, sendMessage } = require('../controllers/message.controller');

router.get('/users', protectRoute, getUsersForSideBar);
router.get('/:id', protectRoute, getMessages);
router.post('/send/:id', protectRoute, sendMessage);

module.exports = router

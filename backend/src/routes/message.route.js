import express from 'express';
const router = express.Router();
import protectRoute  from'../middlewares/auth.middleware.js';
import {getUsersForSideBar, getMessages, sendMessage } from '../controllers/message.controller.js';

router.get('/users', protectRoute, getUsersForSideBar);
router.get('/:id', protectRoute, getMessages);
router.post('/send/:id', protectRoute, sendMessage);

export default router;

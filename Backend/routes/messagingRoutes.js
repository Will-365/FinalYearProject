import express from 'express';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getMessages,
  sendMessage,
  markMessageRead,
  getContacts,
} from '../controllers/messagingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/notifications', getNotifications);
router.patch('/notifications/read-all', markAllNotificationsRead);
router.patch('/notifications/:id/read', markNotificationRead);

router.get('/messages', getMessages);
router.post('/messages', sendMessage);
router.patch('/messages/:id/read', markMessageRead);
router.get('/contacts', getContacts);

export default router;

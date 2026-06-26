import express from 'express';
import {
  getPickups,
  getPickup,
  updatePickupStatus,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getMessages,
  sendMessage,
  markMessageRead,
  getContacts,
  getReport,
  getStats,
} from '../controllers/collector/collectorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('collector'));

router.get('/stats', getStats);
router.get('/pickups', getPickups);
router.get('/pickups/:id', getPickup);
router.patch('/pickups/:id/status', updatePickupStatus);

router.get('/notifications', getNotifications);
router.patch('/notifications/read-all', markAllNotificationsRead);
router.patch('/notifications/:id/read', markNotificationRead);

router.get('/messages', getMessages);
router.post('/messages', sendMessage);
router.patch('/messages/:id/read', markMessageRead);
router.get('/contacts', getContacts);

router.get('/reports', getReport);

export default router;

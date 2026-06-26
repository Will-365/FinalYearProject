import Notification from '../models/Notification.js';

export const createNotification = async ({ userId, type, title, message, relatedId, relatedModel }) => {
  return Notification.create({
    user: userId,
    type,
    title,
    message,
    relatedId,
    relatedModel,
  });
};

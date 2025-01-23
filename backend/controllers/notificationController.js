//backend/controllers/notificationController.js

const notificationModel = require('../models/notification');

module.exports = {
    getAll: async (req, res) => {
        try {
            const notifications = await notificationModel.getAll();
            res.json(notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({ error: 'Failed to fetch notifications' });
        }
    },

    add: async (req, res) => {
        const notification = req.body;
        try {
            const newNotification = await notificationModel.add(notification);
            res.status(201).json(newNotification);
        } catch (error) {
            console.error('Error adding notification:', error);
            res.status(500).json({ error: 'Failed to add notification' });
        }
    },

    remove: async (req, res) => {
        const id = parseInt(req.params.id, 10);
        try {
            const result = await notificationModel.remove(id);
            if (result) {
                res.status(204).send();
            } else {
                res.status(404).json({ error: 'Notification not found' });
            }
        } catch (error) {
            console.error('Error removing notification:', error);
            res.status(500).json({ error: 'Failed to remove notification' });
        }
    }
};

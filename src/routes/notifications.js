import express from 'express';
import { readData, writeData } from '../data.js';

const router = express.Router();

// GET /v1/accounts/:accountId/notifications
router.get('/:accountId/notifications', (req, res) => {
    const data = readData();
    const accountName = `accounts/${req.params.accountId}`;
    const notification = (data.notifications || []).find(n => n.name.startsWith(accountName));

    if (notification) {
        res.json(notification);
    } else {
        // Return default notification settings
        res.json({
            name: `${accountName}/notifications`,
            topicName: "",
            notificationTypes: []
        });
    }
});

// PATCH /v1/accounts/:accountId/notifications
router.patch('/:accountId/notifications', (req, res) => {
    const data = readData();
    const accountName = `accounts/${req.params.accountId}`;

    if (!data.notifications) data.notifications = [];

    const index = data.notifications.findIndex(n => n.name.startsWith(accountName));
    const updated = {
        name: `${accountName}/notifications`,
        topicName: req.body.topicName || "",
        notificationTypes: req.body.notificationTypes || []
    };

    if (index !== -1) {
        data.notifications[index] = updated;
    } else {
        data.notifications.push(updated);
    }

    writeData(data);
    res.json(updated);
});

export default router;

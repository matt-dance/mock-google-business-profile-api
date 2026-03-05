import express from 'express';
import { readData, writeData } from '../data.js';

const router = express.Router();

// GET /v1/accounts/:accountId/locations/:locationId/reviews (List Reviews)
router.get('/accounts/:accountId/locations/:locationId/reviews', (req, res) => {
    const data = readData();
    const parentName = `accounts/${req.params.accountId}/locations/${req.params.locationId}`;

    const reviews = data.reviews.filter(r => r.name.startsWith(`${parentName}/reviews/`));
    res.json({ reviews });
});

// GET /v1/accounts/:accountId/locations/:locationId/reviews/:reviewId
router.get('/accounts/:accountId/locations/:locationId/reviews/:reviewId', (req, res) => {
    const data = readData();
    const reviewName = `accounts/${req.params.accountId}/locations/${req.params.locationId}/reviews/${req.params.reviewId}`;
    const review = data.reviews.find(r => r.name === reviewName);

    if (review) {
        res.json(review);
    } else {
        res.status(404).json({ error: { code: 404, message: "Review not found." } });
    }
});

// PUT /v1/accounts/:accountId/locations/:locationId/reviews/:reviewId/reply
router.put('/accounts/:accountId/locations/:locationId/reviews/:reviewId/reply', (req, res) => {
    const data = readData();
    const reviewName = `accounts/${req.params.accountId}/locations/${req.params.locationId}/reviews/${req.params.reviewId}`;
    const reviewIndex = data.reviews.findIndex(r => r.name === reviewName);

    if (reviewIndex !== -1) {
        const reply = req.body;
        data.reviews[reviewIndex].reviewReply = {
            comment: reply.comment,
            updateTime: new Date().toISOString()
        };
        writeData(data);
        res.json(data.reviews[reviewIndex].reviewReply);
    } else {
        res.status(404).json({ error: { code: 404, message: "Review not found." } });
    }
});

export default router;

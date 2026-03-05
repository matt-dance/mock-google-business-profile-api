import express from 'express';
import { readData, writeData } from '../data.js';
import crypto from 'crypto';

const router = express.Router();

// GET /v1/accounts/:accountId/locations/:locationId/media
router.get('/accounts/:accountId/locations/:locationId/media', (req, res) => {
    const data = readData();
    const parentName = `accounts/${req.params.accountId}/locations/${req.params.locationId}`;

    const mediaItems = (data.media || []).filter(m => m.name.startsWith(`${parentName}/media/`));
    res.json({ mediaItems });
});

// GET /v1/accounts/:accountId/locations/:locationId/media/:mediaId
router.get('/accounts/:accountId/locations/:locationId/media/:mediaId', (req, res) => {
    const data = readData();
    const mediaName = `accounts/${req.params.accountId}/locations/${req.params.locationId}/media/${req.params.mediaId}`;
    const mediaItem = (data.media || []).find(m => m.name === mediaName);

    if (mediaItem) {
        res.json(mediaItem);
    } else {
        res.status(404).json({ error: { code: 404, message: "Media item not found.", status: "NOT_FOUND" } });
    }
});

// POST /v1/accounts/:accountId/locations/:locationId/media
router.post('/accounts/:accountId/locations/:locationId/media', (req, res) => {
    const data = readData();
    const parentName = `accounts/${req.params.accountId}/locations/${req.params.locationId}`;
    const mediaId = crypto.randomUUID().replace(/-/g, '').substring(0, 12);

    const newMedia = {
        name: `${parentName}/media/${mediaId}`,
        mediaFormat: req.body.mediaFormat || "PHOTO",
        sourceUrl: req.body.sourceUrl || "",
        locationAssociation: req.body.locationAssociation || { category: "ADDITIONAL" },
        googleUrl: `https://lh3.googleusercontent.com/mock-${mediaId}`,
        createTime: new Date().toISOString(),
        dimensions: { widthPixels: 1920, heightPixels: 1080 },
        insights: { viewCount: "0", searchCount: "0" }
    };

    if (!data.media) data.media = [];
    data.media.push(newMedia);
    writeData(data);

    res.status(201).json(newMedia);
});

// DELETE /v1/accounts/:accountId/locations/:locationId/media/:mediaId
router.delete('/accounts/:accountId/locations/:locationId/media/:mediaId', (req, res) => {
    const data = readData();
    const mediaName = `accounts/${req.params.accountId}/locations/${req.params.locationId}/media/${req.params.mediaId}`;
    const index = (data.media || []).findIndex(m => m.name === mediaName);

    if (index !== -1) {
        data.media.splice(index, 1);
        writeData(data);
        res.json({});
    } else {
        res.status(404).json({ error: { code: 404, message: "Media item not found.", status: "NOT_FOUND" } });
    }
});

export default router;

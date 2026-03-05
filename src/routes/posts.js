import express from 'express';
import { readData, writeData } from '../data.js';
import crypto from 'crypto';

const router = express.Router();

// GET /v1/accounts/:accountId/locations/:locationId/localPosts
router.get('/accounts/:accountId/locations/:locationId/localPosts', (req, res) => {
    const data = readData();
    const parentName = `accounts/${req.params.accountId}/locations/${req.params.locationId}`;

    const localPosts = (data.localPosts || []).filter(p => p.name.startsWith(`${parentName}/localPosts/`));
    res.json({ localPosts });
});

// GET /v1/accounts/:accountId/locations/:locationId/localPosts/:postId
router.get('/accounts/:accountId/locations/:locationId/localPosts/:postId', (req, res) => {
    const data = readData();
    const postName = `accounts/${req.params.accountId}/locations/${req.params.locationId}/localPosts/${req.params.postId}`;
    const post = (data.localPosts || []).find(p => p.name === postName);

    if (post) {
        res.json(post);
    } else {
        res.status(404).json({ error: { code: 404, message: "Local post not found.", status: "NOT_FOUND" } });
    }
});

// POST /v1/accounts/:accountId/locations/:locationId/localPosts
router.post('/accounts/:accountId/locations/:locationId/localPosts', (req, res) => {
    const data = readData();
    const parentName = `accounts/${req.params.accountId}/locations/${req.params.locationId}`;
    const postId = crypto.randomUUID().replace(/-/g, '').substring(0, 12);

    const newPost = {
        name: `${parentName}/localPosts/${postId}`,
        languageCode: req.body.languageCode || "en",
        summary: req.body.summary || "",
        topicType: req.body.topicType || "STANDARD",
        state: "LIVE",
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        searchUrl: `https://local.google.com/place?id=mock-${postId}`,
        ...(req.body.callToAction && { callToAction: req.body.callToAction }),
        ...(req.body.media && { media: req.body.media }),
        ...(req.body.event && { event: req.body.event }),
        ...(req.body.offer && { offer: req.body.offer })
    };

    if (!data.localPosts) data.localPosts = [];
    data.localPosts.push(newPost);
    writeData(data);

    res.status(201).json(newPost);
});

// PATCH /v1/accounts/:accountId/locations/:locationId/localPosts/:postId
router.patch('/accounts/:accountId/locations/:locationId/localPosts/:postId', (req, res) => {
    const data = readData();
    const postName = `accounts/${req.params.accountId}/locations/${req.params.locationId}/localPosts/${req.params.postId}`;
    const index = (data.localPosts || []).findIndex(p => p.name === postName);

    if (index !== -1) {
        data.localPosts[index] = { ...data.localPosts[index], ...req.body, updateTime: new Date().toISOString() };
        writeData(data);
        res.json(data.localPosts[index]);
    } else {
        res.status(404).json({ error: { code: 404, message: "Local post not found.", status: "NOT_FOUND" } });
    }
});

// DELETE /v1/accounts/:accountId/locations/:locationId/localPosts/:postId
router.delete('/accounts/:accountId/locations/:locationId/localPosts/:postId', (req, res) => {
    const data = readData();
    const postName = `accounts/${req.params.accountId}/locations/${req.params.locationId}/localPosts/${req.params.postId}`;
    const index = (data.localPosts || []).findIndex(p => p.name === postName);

    if (index !== -1) {
        data.localPosts.splice(index, 1);
        writeData(data);
        res.json({});
    } else {
        res.status(404).json({ error: { code: 404, message: "Local post not found.", status: "NOT_FOUND" } });
    }
});

export default router;

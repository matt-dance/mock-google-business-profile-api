import express from 'express';
import { readData, writeData } from '../data.js';

const router = express.Router();

// GET /v1/locations/:locationId/attributes
router.get('/locations/:locationId/attributes', (req, res) => {
    const data = readData();
    const locationId = req.params.locationId;
    const attributes = (data.attributes || []).filter(a => a.parent.endsWith(`/locations/${locationId}`));

    res.json({ attributes });
});

// PATCH /v1/locations/:locationId/attributes
router.patch('/locations/:locationId/attributes', (req, res) => {
    const data = readData();
    const locationId = req.params.locationId;
    const parent = `locations/${locationId}`;

    // Remove existing attributes for this location
    data.attributes = (data.attributes || []).filter(a => !a.parent.endsWith(`/locations/${locationId}`));

    // Add new attributes
    const newAttributes = (req.body.attributes || []).map(attr => ({
        ...attr,
        parent
    }));
    data.attributes = [...data.attributes, ...newAttributes];
    writeData(data);

    res.json({ attributes: newAttributes });
});

// GET /v1/categories/:categoryId/attributes
router.get('/categories/:categoryId/attributes', (req, res) => {
    const data = readData();
    const categoryId = req.params.categoryId;
    const attributes = (data.categoryAttributes || []).filter(a =>
        a.parent === `categories/${categoryId}`
    );

    res.json({ attributes });
});

export default router;

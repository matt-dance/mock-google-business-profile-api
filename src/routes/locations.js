import express from 'express';
import { readData, writeData } from '../data.js';

const router = express.Router();

// GET /v1/accounts/:accountId/locations (List Locations)
router.get('/accounts/:accountId/locations', (req, res) => {
    const data = readData();
    const accountName = `accounts/${req.params.accountId}`;

    const locations = data.locations.filter(l => l.name.startsWith(`${accountName}/locations/`));

    res.json({ locations });
});

// GET /v1/locations/:locationId (Get Location)
router.get('/locations/:locationId', (req, res) => {
    const data = readData();
    const locationId = req.params.locationId;
    const location = data.locations.find(l => l.name.endsWith(`/locations/${locationId}`));

    if (location) {
        res.json(location);
    } else {
        res.status(404).json({ error: { code: 404, message: "Location not found.", status: "NOT_FOUND" } });
    }
});

// PATCH /v1/locations/:locationId (Update Location)
router.patch('/locations/:locationId', (req, res) => {
    const data = readData();
    const locationId = req.params.locationId;
    const locationIndex = data.locations.findIndex(l => l.name.endsWith(`/locations/${locationId}`));

    if (locationIndex !== -1) {
        data.locations[locationIndex] = { ...data.locations[locationIndex], ...req.body };
        writeData(data);
        res.json(data.locations[locationIndex]);
    } else {
        res.status(404).json({ error: { code: 404, message: "Location not found." } });
    }
});

export default router;

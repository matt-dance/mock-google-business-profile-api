import express from 'express';
import { readData, writeData } from '../data.js';

const router = express.Router();

// POST /v1/locations/:locationId:verify
router.post(/^\/locations\/(.+):verify$/, (req, res) => {
    const data = readData();
    const locationId = req.params[0];
    const location = data.locations.find(l => l.name.endsWith(`/locations/${locationId}`));

    if (!location) {
        return res.status(404).json({ error: { code: 404, message: "Location not found.", status: "NOT_FOUND" } });
    }

    const verification = {
        name: `${location.name}/verifications/mock-verification`,
        method: req.body.method || "SMS",
        state: "PENDING",
        createTime: new Date().toISOString()
    };

    if (!data.verifications) data.verifications = [];
    data.verifications.push(verification);
    writeData(data);

    res.json({ verification });
});

// GET /v1/locations/:locationId/verifications
router.get('/locations/:locationId/verifications', (req, res) => {
    const data = readData();
    const locationId = req.params.locationId;

    const verifications = (data.verifications || []).filter(v =>
        v.name.includes(`/locations/${locationId}/verifications/`)
    );

    res.json({ verifications });
});

// POST /v1/locations/:locationId/verifications/:verificationId:complete
router.post(/^\/locations\/([^/]+)\/verifications\/(.+):complete$/, (req, res) => {
    const data = readData();
    const locationId = req.params[0];
    const verificationId = req.params[1];

    const index = (data.verifications || []).findIndex(v =>
        v.name.includes(`/locations/${locationId}/verifications/${verificationId}`)
    );

    if (index !== -1) {
        // Accept any PIN for mock purposes
        data.verifications[index].state = "COMPLETED";
        writeData(data);
        res.json({ verification: data.verifications[index] });
    } else {
        res.status(404).json({ error: { code: 404, message: "Verification not found.", status: "NOT_FOUND" } });
    }
});

// POST /v1/locations/:locationId:fetchVerificationOptions
router.post(/^\/locations\/(.+):fetchVerificationOptions$/, (req, res) => {
    res.json({
        options: [
            { verificationMethod: "SMS" },
            { verificationMethod: "PHONE_CALL" },
            { verificationMethod: "EMAIL", emailData: { domainName: "example.com", userName: "owner", isUserNameEditable: false } },
            { verificationMethod: "POSTCARD", addressData: { businessName: "Mock Business" } }
        ]
    });
});

// GET /v1/locations/:locationId/VoiceOfMerchantState (getVoiceOfMerchantState)
router.get('/locations/:locationId/voice_of_merchant_state', (req, res) => {
    res.json({
        name: `locations/${req.params.locationId}/voiceOfMerchantState`,
        hasVoiceOfMerchant: true,
        hasBusinessAuthority: true
    });
});

export default router;

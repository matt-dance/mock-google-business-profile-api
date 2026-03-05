import express from 'express';
import { readData } from '../data.js';

const router = express.Router();

// GET /v1/accounts
router.get('/', (req, res) => {
    const data = readData();
    res.json({ accounts: data.accounts });
});

// GET /v1/accounts/:accountId
router.get('/:accountId', (req, res) => {
    const data = readData();
    const accountId = req.params.accountId;
    const account = data.accounts.find(a => a.name === `accounts/${accountId}`);

    if (account) {
        res.json(account);
    } else {
        res.status(404).json({
            error: {
                code: 404,
                message: "Account not found.",
                status: "NOT_FOUND"
            }
        });
    }
});

export default router;

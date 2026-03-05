import express from 'express';
import { readData } from '../data.js';

const router = express.Router();

// GET /v1/categories
router.get('/', (req, res) => {
    const data = readData();
    const regionCode = req.query.regionCode || 'US';
    const languageCode = req.query.languageCode || 'en';
    const searchTerm = req.query.filter || '';

    let categories = data.categories || [];

    if (searchTerm) {
        categories = categories.filter(c =>
            c.displayName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    res.json({ categories });
});

// GET /v1/categories:batchGet — exported separately because Express 5
// doesn't match the mount point /v1/categories against /v1/categories:batchGet
const batchGetRouter = express.Router();
batchGetRouter.get(/^\/categories:batchGet$/, (req, res) => {
    const data = readData();
    const names = Array.isArray(req.query.names) ? req.query.names : req.query.names ? [req.query.names] : [];

    const categories = (data.categories || []).filter(c => names.includes(c.name));
    res.json({ categories });
});

export { batchGetRouter };
export default router;

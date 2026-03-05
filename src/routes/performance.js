import express from 'express';
import { readData } from '../data.js';

const router = express.Router();

const DAILY_METRICS = [
    'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
    'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
    'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
    'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
    'BUSINESS_CONVERSATIONS',
    'BUSINESS_DIRECTION_REQUESTS',
    'CALL_CLICKS',
    'WEBSITE_CLICKS',
    'BUSINESS_BOOKINGS',
    'BUSINESS_FOOD_ORDERS',
    'BUSINESS_FOOD_MENU_CLICKS'
];

// GET /v1/locations/:locationId:fetchMultiDailyMetricsTimeSeries
router.get(/^\/locations\/(.+):fetchMultiDailyMetricsTimeSeries$/, (req, res) => {
    const data = readData();
    const locationId = req.params[0];
    const location = data.locations.find(l => l.name.endsWith(`/locations/${locationId}`));

    if (!location) {
        return res.status(404).json({ error: { code: 404, message: "Location not found.", status: "NOT_FOUND" } });
    }

    // Parse query params
    const requestedMetrics = Array.isArray(req.query.dailyMetrics)
        ? req.query.dailyMetrics
        : req.query.dailyMetrics
            ? [req.query.dailyMetrics]
            : DAILY_METRICS.slice(0, 3);

    const startDate = req.query['dailyRange.startDate.year']
        ? {
            year: parseInt(req.query['dailyRange.startDate.year']),
            month: parseInt(req.query['dailyRange.startDate.month'] || 1),
            day: parseInt(req.query['dailyRange.startDate.day'] || 1)
        }
        : { year: 2025, month: 1, day: 1 };

    const endDate = req.query['dailyRange.endDate.year']
        ? {
            year: parseInt(req.query['dailyRange.endDate.year']),
            month: parseInt(req.query['dailyRange.endDate.month'] || 12),
            day: parseInt(req.query['dailyRange.endDate.day'] || 28)
        }
        : { year: 2025, month: 12, day: 28 };

    // Generate mock time series data
    const start = new Date(startDate.year, startDate.month - 1, startDate.day);
    const end = new Date(endDate.year, endDate.month - 1, endDate.day);
    const multiDailyMetricTimeSeries = requestedMetrics.map(metric => {
        const dailyMetricTimeSeries = {
            dailyMetric: metric,
            timeSeries: {
                datedValues: []
            }
        };

        const current = new Date(start);
        while (current <= end) {
            dailyMetricTimeSeries.timeSeries.datedValues.push({
                date: {
                    year: current.getFullYear(),
                    month: current.getMonth() + 1,
                    day: current.getDate()
                },
                value: Math.floor(Math.random() * 200)
            });
            current.setDate(current.getDate() + 1);
        }

        return dailyMetricTimeSeries;
    });

    res.json({ multiDailyMetricTimeSeries });
});

export default router;

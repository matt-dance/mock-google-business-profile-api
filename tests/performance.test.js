import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getAgent, resetData } from './test-helpers.js';

describe('Performance API', () => {
    before(() => resetData());

    describe('GET /v1/locations/:locationId:fetchMultiDailyMetricsTimeSeries', () => {
        it('should return time series data for a valid location', async () => {
            const res = await getAgent()
                .get('/v1/locations/test-location-1:fetchMultiDailyMetricsTimeSeries')
                .query({
                    'dailyRange.startDate.year': '2025',
                    'dailyRange.startDate.month': '1',
                    'dailyRange.startDate.day': '1',
                    'dailyRange.endDate.year': '2025',
                    'dailyRange.endDate.month': '1',
                    'dailyRange.endDate.day': '3'
                })
                .expect(200);

            assert.ok(Array.isArray(res.body.multiDailyMetricTimeSeries));
            assert.ok(res.body.multiDailyMetricTimeSeries.length > 0);

            const first = res.body.multiDailyMetricTimeSeries[0];
            assert.ok(first.dailyMetric);
            assert.ok(Array.isArray(first.timeSeries.datedValues));
            // Should have 3 days of data (Jan 1-3)
            assert.equal(first.timeSeries.datedValues.length, 3);
        });

        it('should return only requested metrics', async () => {
            const res = await getAgent()
                .get('/v1/locations/test-location-1:fetchMultiDailyMetricsTimeSeries')
                .query({
                    dailyMetrics: 'CALL_CLICKS',
                    'dailyRange.startDate.year': '2025',
                    'dailyRange.startDate.month': '1',
                    'dailyRange.startDate.day': '1',
                    'dailyRange.endDate.year': '2025',
                    'dailyRange.endDate.month': '1',
                    'dailyRange.endDate.day': '1'
                })
                .expect(200);

            assert.equal(res.body.multiDailyMetricTimeSeries.length, 1);
            assert.equal(res.body.multiDailyMetricTimeSeries[0].dailyMetric, 'CALL_CLICKS');
        });

        it('should return 404 for non-existent location', async () => {
            await getAgent()
                .get('/v1/locations/nonexistent:fetchMultiDailyMetricsTimeSeries')
                .expect(404);
        });
    });
});

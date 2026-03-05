import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getAgent, resetData } from './helpers.js';

describe('Locations API', () => {
    before(() => resetData());

    describe('GET /v1/accounts/:accountId/locations', () => {
        it('should return locations for an account', async () => {
            const res = await getAgent().get('/v1/accounts/test-account-1/locations').expect(200);
            assert.ok(Array.isArray(res.body.locations));
            assert.equal(res.body.locations.length, 2);
        });

        it('should return empty array for account with no locations', async () => {
            const res = await getAgent().get('/v1/accounts/test-account-2/locations').expect(200);
            assert.ok(Array.isArray(res.body.locations));
            assert.equal(res.body.locations.length, 0);
        });
    });

    describe('GET /v1/locations/:locationId', () => {
        it('should return a specific location', async () => {
            const res = await getAgent().get('/v1/locations/test-location-1').expect(200);
            assert.equal(res.body.title, 'Test Coffee Shop');
        });

        it('should return 404 for non-existent location', async () => {
            const res = await getAgent().get('/v1/locations/nonexistent').expect(404);
            assert.equal(res.body.error.code, 404);
        });
    });

    describe('PATCH /v1/locations/:locationId', () => {
        it('should update location fields', async () => {
            const res = await getAgent()
                .patch('/v1/locations/test-location-1')
                .send({ title: 'Updated Coffee Shop' })
                .expect(200);
            assert.equal(res.body.title, 'Updated Coffee Shop');
            // Original fields should still be present
            assert.equal(res.body.phoneNumbers.primaryPhone, '+15125551234');
        });

        it('should return 404 for non-existent location', async () => {
            await getAgent()
                .patch('/v1/locations/nonexistent')
                .send({ title: 'Nope' })
                .expect(404);
        });
    });
});

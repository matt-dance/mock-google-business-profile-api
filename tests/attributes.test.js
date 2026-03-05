import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getAgent, resetData } from './test-helpers.js';

describe('Attributes API', () => {
    before(() => resetData());

    describe('GET /v1/locations/:locationId/attributes', () => {
        it('should return attributes for a location', async () => {
            const res = await getAgent()
                .get('/v1/locations/test-location-1/attributes')
                .expect(200);
            assert.ok(Array.isArray(res.body.attributes));
            assert.equal(res.body.attributes.length, 1);
            assert.equal(res.body.attributes[0].attributeId, 'has_wifi');
        });

        it('should return empty array for location with no attributes', async () => {
            const res = await getAgent()
                .get('/v1/locations/test-location-2/attributes')
                .expect(200);
            assert.equal(res.body.attributes.length, 0);
        });
    });

    describe('PATCH /v1/locations/:locationId/attributes', () => {
        it('should replace attributes for a location', async () => {
            const res = await getAgent()
                .patch('/v1/locations/test-location-1/attributes')
                .send({
                    attributes: [
                        { attributeId: 'has_delivery', valueType: 'BOOL', values: [true] },
                        { attributeId: 'has_dine_in', valueType: 'BOOL', values: [false] }
                    ]
                })
                .expect(200);

            assert.ok(Array.isArray(res.body.attributes));
            assert.equal(res.body.attributes.length, 2);
            assert.equal(res.body.attributes[0].attributeId, 'has_delivery');
        });
    });

    describe('GET /v1/categories/:categoryId/attributes', () => {
        it('should return attributes for a category', async () => {
            const res = await getAgent()
                .get('/v1/categories/gcid:coffee_shop/attributes')
                .expect(200);
            assert.ok(Array.isArray(res.body.attributes));
            assert.equal(res.body.attributes.length, 1);
        });

        it('should return empty for unknown category', async () => {
            const res = await getAgent()
                .get('/v1/categories/gcid:nonexistent/attributes')
                .expect(200);
            assert.equal(res.body.attributes.length, 0);
        });
    });
});

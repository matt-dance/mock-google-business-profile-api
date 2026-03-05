import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getAgent, resetData } from './test-helpers.js';

describe('Categories API', () => {
    before(() => resetData());

    describe('GET /v1/categories', () => {
        it('should return all categories', async () => {
            const res = await getAgent().get('/v1/categories').expect(200);
            assert.ok(Array.isArray(res.body.categories));
            assert.equal(res.body.categories.length, 3);
        });

        it('should filter categories by search term', async () => {
            const res = await getAgent()
                .get('/v1/categories')
                .query({ filter: 'coffee' })
                .expect(200);
            assert.equal(res.body.categories.length, 1);
            assert.equal(res.body.categories[0].displayName, 'Coffee shop');
        });

        it('should return empty array for no matches', async () => {
            const res = await getAgent()
                .get('/v1/categories')
                .query({ filter: 'zzznonexistent' })
                .expect(200);
            assert.equal(res.body.categories.length, 0);
        });
    });

    describe('GET /v1/categories:batchGet', () => {
        it('should return categories matching provided names', async () => {
            const res = await getAgent()
                .get('/v1/categories:batchGet')
                .query({ names: ['categories/gcid:coffee_shop', 'categories/gcid:bakery'] })
                .expect(200);
            assert.ok(Array.isArray(res.body.categories));
            assert.equal(res.body.categories.length, 2);
        });

        it('should return empty array when no names match', async () => {
            const res = await getAgent()
                .get('/v1/categories:batchGet')
                .query({ names: 'categories/gcid:nonexistent' })
                .expect(200);
            assert.equal(res.body.categories.length, 0);
        });
    });
});

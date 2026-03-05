import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getAgent, resetData } from './test-helpers.js';

describe('Reviews API', () => {
    before(() => resetData());

    const basePath = '/v1/accounts/test-account-1/locations/test-location-1/reviews';

    describe('GET .../reviews', () => {
        it('should return reviews for a location', async () => {
            const res = await getAgent().get(basePath).expect(200);
            assert.ok(Array.isArray(res.body.reviews));
            assert.equal(res.body.reviews.length, 2);
        });
    });

    describe('GET .../reviews/:reviewId', () => {
        it('should return a specific review', async () => {
            const res = await getAgent().get(`${basePath}/test-review-1`).expect(200);
            assert.equal(res.body.starRating, 'FIVE');
            assert.equal(res.body.comment, 'Great coffee!');
        });

        it('should return 404 for non-existent review', async () => {
            const res = await getAgent().get(`${basePath}/nonexistent`).expect(404);
            assert.equal(res.body.error.code, 404);
        });
    });

    describe('PUT .../reviews/:reviewId/reply', () => {
        it('should add a reply to a review', async () => {
            const res = await getAgent()
                .put(`${basePath}/test-review-1/reply`)
                .send({ comment: 'Thank you for your kind review!' })
                .expect(200);
            assert.equal(res.body.comment, 'Thank you for your kind review!');
            assert.ok(res.body.updateTime);
        });

        it('should return 404 for reply on non-existent review', async () => {
            await getAgent()
                .put(`${basePath}/nonexistent/reply`)
                .send({ comment: 'Nope' })
                .expect(404);
        });
    });
});

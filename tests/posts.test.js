import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getAgent, resetData } from './helpers.js';

describe('Local Posts API', () => {
    before(() => resetData());

    const basePath = '/v1/accounts/test-account-1/locations/test-location-1/localPosts';

    describe('GET .../localPosts', () => {
        it('should return local posts for a location', async () => {
            const res = await getAgent().get(basePath).expect(200);
            assert.ok(Array.isArray(res.body.localPosts));
            assert.equal(res.body.localPosts.length, 1);
        });
    });

    describe('GET .../localPosts/:postId', () => {
        it('should return a specific post', async () => {
            const res = await getAgent().get(`${basePath}/test-post-1`).expect(200);
            assert.equal(res.body.topicType, 'STANDARD');
            assert.equal(res.body.summary, 'New seasonal blend available!');
        });

        it('should return 404 for non-existent post', async () => {
            await getAgent().get(`${basePath}/nonexistent`).expect(404);
        });
    });

    describe('POST .../localPosts', () => {
        it('should create a new local post', async () => {
            const res = await getAgent()
                .post(basePath)
                .send({
                    summary: 'Happy hour from 3-5PM!',
                    topicType: 'OFFER',
                    offer: { couponCode: 'HAPPY50' }
                })
                .expect(201);

            assert.equal(res.body.summary, 'Happy hour from 3-5PM!');
            assert.equal(res.body.topicType, 'OFFER');
            assert.equal(res.body.state, 'LIVE');
            assert.ok(res.body.offer);
            assert.ok(res.body.name);
            assert.ok(res.body.createTime);
        });
    });

    describe('PATCH .../localPosts/:postId', () => {
        it('should update an existing post', async () => {
            const res = await getAgent()
                .patch(`${basePath}/test-post-1`)
                .send({ summary: 'Updated seasonal blend!' })
                .expect(200);

            assert.equal(res.body.summary, 'Updated seasonal blend!');
            assert.ok(res.body.updateTime);
        });

        it('should return 404 for non-existent post', async () => {
            await getAgent()
                .patch(`${basePath}/nonexistent`)
                .send({ summary: 'Nope' })
                .expect(404);
        });
    });

    describe('DELETE .../localPosts/:postId', () => {
        it('should delete an existing post', async () => {
            await getAgent().delete(`${basePath}/test-post-1`).expect(200);
            // Verify it's gone
            await getAgent().get(`${basePath}/test-post-1`).expect(404);
        });

        it('should return 404 for non-existent post', async () => {
            await getAgent().delete(`${basePath}/nonexistent`).expect(404);
        });
    });
});

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getAgent, resetData } from './test-helpers.js';

describe('Media API', () => {
    before(() => resetData());

    const basePath = '/v1/accounts/test-account-1/locations/test-location-1/media';

    describe('GET .../media', () => {
        it('should return media items for a location', async () => {
            const res = await getAgent().get(basePath).expect(200);
            assert.ok(Array.isArray(res.body.mediaItems));
            assert.equal(res.body.mediaItems.length, 1);
        });
    });

    describe('GET .../media/:mediaId', () => {
        it('should return a specific media item', async () => {
            const res = await getAgent().get(`${basePath}/test-media-1`).expect(200);
            assert.equal(res.body.mediaFormat, 'PHOTO');
        });

        it('should return 404 for non-existent media', async () => {
            await getAgent().get(`${basePath}/nonexistent`).expect(404);
        });
    });

    describe('POST .../media', () => {
        it('should create a new media item', async () => {
            const res = await getAgent()
                .post(basePath)
                .send({
                    mediaFormat: 'PHOTO',
                    sourceUrl: 'https://example.com/new-photo.jpg',
                    locationAssociation: { category: 'INTERIOR' }
                })
                .expect(201);

            assert.equal(res.body.mediaFormat, 'PHOTO');
            assert.equal(res.body.sourceUrl, 'https://example.com/new-photo.jpg');
            assert.ok(res.body.googleUrl);
            assert.ok(res.body.createTime);
            assert.ok(res.body.name);
        });
    });

    describe('DELETE .../media/:mediaId', () => {
        it('should delete an existing media item', async () => {
            await getAgent().delete(`${basePath}/test-media-1`).expect(200);
            // Verify it's gone
            await getAgent().get(`${basePath}/test-media-1`).expect(404);
        });

        it('should return 404 for non-existent media', async () => {
            await getAgent().delete(`${basePath}/nonexistent`).expect(404);
        });
    });
});

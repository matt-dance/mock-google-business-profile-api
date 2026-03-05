import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getAgent, resetData } from './test-helpers.js';

describe('Notifications API', () => {
    before(() => resetData());

    const basePath = '/v1/accounts';

    describe('GET /v1/accounts/:accountId/notificationSetting', () => {
        it('should return notification settings for an account', async () => {
            const res = await getAgent()
                .get(`${basePath}/test-account-1/notificationSetting`)
                .expect(200);
            assert.equal(res.body.name, 'accounts/test-account-1/notificationSetting');
            assert.ok(Array.isArray(res.body.notificationTypes));
            assert.ok(res.body.notificationTypes.includes('NEW_REVIEW'));
        });

        it('should return default settings for account with no notifications', async () => {
            const res = await getAgent()
                .get(`${basePath}/test-account-2/notificationSetting`)
                .expect(200);
            assert.equal(res.body.name, 'accounts/test-account-2/notificationSetting');
            assert.equal(res.body.pubsubTopic, '');
            assert.ok(Array.isArray(res.body.notificationTypes));
            assert.equal(res.body.notificationTypes.length, 0);
        });
    });

    describe('PATCH /v1/accounts/:accountId/notificationSetting', () => {
        it('should update notification settings', async () => {
            const res = await getAgent()
                .patch(`${basePath}/test-account-1/notificationSetting`)
                .send({
                    pubsubTopic: 'projects/updated/topics/gbp-notifications',
                    notificationTypes: ['NEW_REVIEW', 'UPDATED_REVIEW', 'GOOGLE_UPDATE']
                })
                .expect(200);

            assert.equal(res.body.pubsubTopic, 'projects/updated/topics/gbp-notifications');
            assert.equal(res.body.notificationTypes.length, 3);
        });

        it('should create notification settings for new account', async () => {
            const res = await getAgent()
                .patch(`${basePath}/test-account-2/notificationSetting`)
                .send({
                    pubsubTopic: 'projects/new/topics/notifications',
                    notificationTypes: ['NEW_REVIEW']
                })
                .expect(200);

            assert.equal(res.body.name, 'accounts/test-account-2/notificationSetting');
            assert.equal(res.body.notificationTypes.length, 1);
        });
    });
});

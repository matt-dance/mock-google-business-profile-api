import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getAgent, resetData } from './test-helpers.js';

describe('Verification API', () => {
    before(() => resetData());

    describe('POST /v1/locations/:locationId:fetchVerificationOptions', () => {
        it('should return verification options', async () => {
            const res = await getAgent()
                .post('/v1/locations/test-location-1:fetchVerificationOptions')
                .send({})
                .expect(200);
            assert.ok(Array.isArray(res.body.options));
            assert.equal(res.body.options.length, 4);
            const methods = res.body.options.map(o => o.verificationMethod);
            assert.ok(methods.includes('SMS'));
            assert.ok(methods.includes('EMAIL'));
            assert.ok(methods.includes('PHONE_CALL'));
            assert.ok(methods.includes('POSTCARD'));
        });
    });

    describe('POST /v1/locations/:locationId:verify', () => {
        it('should start verification for a valid location', async () => {
            const res = await getAgent()
                .post('/v1/locations/test-location-1:verify')
                .send({ method: 'EMAIL' })
                .expect(200);
            assert.ok(res.body.verification);
            assert.equal(res.body.verification.state, 'PENDING');
            assert.equal(res.body.verification.method, 'EMAIL');
        });

        it('should return 404 for non-existent location', async () => {
            await getAgent()
                .post('/v1/locations/nonexistent:verify')
                .send({ method: 'SMS' })
                .expect(404);
        });
    });

    describe('GET /v1/locations/:locationId/verifications', () => {
        it('should return verifications for a location', async () => {
            const res = await getAgent()
                .get('/v1/locations/test-location-1/verifications')
                .expect(200);
            assert.ok(Array.isArray(res.body.verifications));
            assert.ok(res.body.verifications.length >= 1);
        });
    });

    describe('POST .../verifications/:verificationId:complete', () => {
        it('should complete a verification', async () => {
            const res = await getAgent()
                .post('/v1/locations/test-location-1/verifications/test-verification-1:complete')
                .send({ pin: '123456' })
                .expect(200);
            assert.equal(res.body.verification.state, 'COMPLETED');
        });

        it('should return 404 for non-existent verification', async () => {
            await getAgent()
                .post('/v1/locations/test-location-1/verifications/nonexistent:complete')
                .send({ pin: '123456' })
                .expect(404);
        });
    });

    describe('GET /v1/locations/:locationId/voice_of_merchant_state', () => {
        it('should return voice of merchant state', async () => {
            const res = await getAgent()
                .get('/v1/locations/test-location-1/voice_of_merchant_state')
                .expect(200);
            assert.equal(res.body.hasVoiceOfMerchant, true);
            assert.equal(res.body.hasBusinessAuthority, true);
        });
    });
});

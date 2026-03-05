import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getAgent, resetData } from './test-helpers.js';

describe('Accounts API', () => {
    before(() => resetData());

    describe('GET /v1/accounts', () => {
        it('should return all accounts', async () => {
            const res = await getAgent().get('/v1/accounts').expect(200);
            assert.ok(Array.isArray(res.body.accounts));
            assert.equal(res.body.accounts.length, 2);
        });
    });

    describe('GET /v1/accounts/:accountId', () => {
        it('should return a specific account', async () => {
            const res = await getAgent().get('/v1/accounts/test-account-1').expect(200);
            assert.equal(res.body.name, 'accounts/test-account-1');
            assert.equal(res.body.accountName, 'Test Business Account');
        });

        it('should return 404 for non-existent account', async () => {
            const res = await getAgent().get('/v1/accounts/nonexistent').expect(404);
            assert.equal(res.body.error.code, 404);
            assert.equal(res.body.error.status, 'NOT_FOUND');
        });
    });
});

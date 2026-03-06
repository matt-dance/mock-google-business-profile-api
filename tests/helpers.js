import fs from 'fs';
import http from 'http';
import assert from 'node:assert/strict';
import path from 'path';
import { Duplex } from 'stream';
import { fileURLToPath } from 'url';
import { app } from '../src/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data.json');

/**
 * Minimal test fixtures with known IDs for deterministic assertions.
 */
const TEST_DATA = {
    accounts: [
        {
            name: 'accounts/test-account-1',
            accountName: 'Test Business Account',
            type: 'PERSONAL',
            role: 'OWNER',
            verificationState: 'VERIFIED',
            permissionLevel: 'OWNER_LEVEL'
        },
        {
            name: 'accounts/test-account-2',
            accountName: 'Second Account',
            type: 'LOCATION_GROUP',
            role: 'OWNER',
            verificationState: 'VERIFIED',
            permissionLevel: 'OWNER_LEVEL'
        }
    ],
    locations: [
        {
            name: 'accounts/test-account-1/locations/test-location-1',
            title: 'Test Coffee Shop',
            storefrontAddress: {
                addressLines: ['123 Main St'],
                locality: 'Testville',
                administrativeArea: 'TX',
                postalCode: '78701'
            },
            phoneNumbers: { primaryPhone: '+15125551234' },
            websiteUri: 'https://testcoffee.example.com',
            categories: {
                primaryCategory: { displayName: 'Coffee shop', name: 'categories/gcid:coffee_shop' }
            }
        },
        {
            name: 'accounts/test-account-1/locations/test-location-2',
            title: 'Test Bakery',
            storefrontAddress: {
                addressLines: ['456 Oak Ave'],
                locality: 'Testville',
                administrativeArea: 'TX',
                postalCode: '78702'
            }
        }
    ],
    reviews: [
        {
            name: 'accounts/test-account-1/locations/test-location-1/reviews/test-review-1',
            reviewer: { displayName: 'John Doe', profilePhotoUrl: 'https://example.com/john.jpg' },
            starRating: 'FIVE',
            comment: 'Great coffee!',
            createTime: '2025-01-15T10:30:00Z',
            updateTime: '2025-01-15T10:30:00Z'
        },
        {
            name: 'accounts/test-account-1/locations/test-location-1/reviews/test-review-2',
            reviewer: { displayName: 'Jane Smith' },
            starRating: 'THREE',
            comment: 'Decent place.',
            createTime: '2025-02-01T14:00:00Z',
            updateTime: '2025-02-01T14:00:00Z'
        }
    ],
    media: [
        {
            name: 'accounts/test-account-1/locations/test-location-1/media/test-media-1',
            mediaFormat: 'PHOTO',
            sourceUrl: 'https://example.com/photo1.jpg',
            googleUrl: 'https://lh3.googleusercontent.com/mock-test-media-1',
            locationAssociation: { category: 'EXTERIOR' },
            createTime: '2025-01-10T08:00:00Z'
        }
    ],
    localPosts: [
        {
            name: 'accounts/test-account-1/locations/test-location-1/localPosts/test-post-1',
            languageCode: 'en',
            summary: 'New seasonal blend available!',
            topicType: 'STANDARD',
            state: 'LIVE',
            createTime: '2025-03-01T09:00:00Z',
            updateTime: '2025-03-01T09:00:00Z'
        }
    ],
    categories: [
        { name: 'categories/gcid:coffee_shop', displayName: 'Coffee shop', serviceTypes: [] },
        { name: 'categories/gcid:bakery', displayName: 'Bakery', serviceTypes: [] },
        { name: 'categories/gcid:restaurant', displayName: 'Restaurant', serviceTypes: [] }
    ],
    attributes: [
        {
            name: 'locations/test-location-1/attributes/has_wifi',
            attributeId: 'has_wifi',
            valueType: 'BOOL',
            values: [true],
            parent: 'accounts/test-account-1/locations/test-location-1'
        }
    ],
    categoryAttributes: [
        {
            name: 'categories/gcid:coffee_shop/attributes/has_wifi',
            attributeId: 'has_wifi',
            valueType: 'BOOL',
            parent: 'categories/gcid:coffee_shop'
        }
    ],
    verifications: [
        {
            name: 'accounts/test-account-1/locations/test-location-1/verifications/test-verification-1',
            method: 'SMS',
            state: 'PENDING',
            createTime: '2025-01-20T12:00:00Z'
        }
    ],
    notifications: [
        {
            name: 'accounts/test-account-1/notificationSetting',
            pubsubTopic: 'projects/test/topics/gbp-notifications',
            notificationTypes: ['NEW_REVIEW', 'UPDATED_REVIEW']
        }
    ]
};

/**
 * Write test fixtures to data.json. Call in before() or beforeEach().
 */
export function resetData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(structuredClone(TEST_DATA), null, 2));
}

class MockSocket extends Duplex {
    constructor(body = '') {
        super();
        this.responseChunks = [];
        this.requestBody = body ? Buffer.from(body) : null;
        this.remoteAddress = '127.0.0.1';
    }

    _read() {
        if (this.requestBody) {
            this.push(this.requestBody);
            this.requestBody = null;
        } else {
            this.push(null);
        }
    }

    _write(chunk, _encoding, callback) {
        this.responseChunks.push(Buffer.from(chunk));
        callback();
    }

    setTimeout() {}

    setNoDelay() {}

    setKeepAlive() {}

    address() {
        return { address: '127.0.0.1', family: 'IPv4', port: 0 };
    }
}

function buildUrl(pathname, query) {
    if (!query) return pathname;

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (Array.isArray(value)) {
            value.forEach(item => params.append(key, item));
        } else if (value !== undefined && value !== null) {
            params.append(key, value);
        }
    }

    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
}

async function performRequest(method, pathname, { body, query } = {}) {
    const socket = new MockSocket();
    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = buildUrl(pathname, query);
    req.body = body;
    req.headers = {
        host: 'localhost',
        connection: 'close'
    };

    const res = new http.ServerResponse(req);
    res.assignSocket(socket);

    const finished = new Promise((resolve, reject) => {
        res.on('finish', resolve);
        res.on('error', reject);
    });

    app.handle(req, res);
    await finished;

    const rawResponse = Buffer.concat(socket.responseChunks).toString('utf8');
    const [, responseBody = ''] = rawResponse.split('\r\n\r\n');
    const contentType = res.getHeader('content-type');
    const parsedBody = typeof contentType === 'string' && contentType.includes('application/json') && responseBody
        ? JSON.parse(responseBody)
        : responseBody;

    return {
        status: res.statusCode,
        body: parsedBody,
        text: responseBody,
        headers: res.getHeaders()
    };
}

class TestRequest {
    constructor(method, pathname) {
        this.method = method;
        this.pathname = pathname;
        this.requestBody = undefined;
        this.requestQuery = undefined;
    }

    send(body) {
        this.requestBody = body;
        return this;
    }

    query(query) {
        this.requestQuery = query;
        return this;
    }

    async expect(status) {
        const response = await performRequest(this.method, this.pathname, {
            body: this.requestBody,
            query: this.requestQuery
        });

        assert.equal(response.status, status);
        return response;
    }
}

export function getAgent() {
    return {
        get(pathname) {
            return new TestRequest('GET', pathname);
        },
        post(pathname) {
            return new TestRequest('POST', pathname);
        },
        patch(pathname) {
            return new TestRequest('PATCH', pathname);
        },
        put(pathname) {
            return new TestRequest('PUT', pathname);
        },
        delete(pathname) {
            return new TestRequest('DELETE', pathname);
        }
    };
}

export { TEST_DATA };

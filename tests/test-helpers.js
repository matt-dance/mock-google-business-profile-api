import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import request from 'supertest';
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

/**
 * Get a supertest agent bound to the app.
 */
export function getAgent() {
    return request(app);
}

export { TEST_DATA };

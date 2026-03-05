import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data.json');

const BUSINESS_CATEGORIES = [
    { name: 'categories/gcid:restaurant', displayName: 'Restaurant', serviceTypes: ['dine_in', 'takeout', 'delivery'] },
    { name: 'categories/gcid:hotel', displayName: 'Hotel', serviceTypes: ['lodging', 'room_service'] },
    { name: 'categories/gcid:plumber', displayName: 'Plumber', serviceTypes: ['emergency_service', 'installation'] },
    { name: 'categories/gcid:dentist', displayName: 'Dentist', serviceTypes: ['general_dentistry', 'cosmetic_dentistry'] },
    { name: 'categories/gcid:auto_repair_shop', displayName: 'Auto Repair Shop', serviceTypes: ['oil_change', 'brake_repair'] },
    { name: 'categories/gcid:hair_salon', displayName: 'Hair Salon', serviceTypes: ['haircut', 'coloring'] },
    { name: 'categories/gcid:gym', displayName: 'Gym', serviceTypes: ['personal_training', 'group_classes'] },
    { name: 'categories/gcid:coffee_shop', displayName: 'Coffee Shop', serviceTypes: ['dine_in', 'takeout'] },
    { name: 'categories/gcid:law_firm', displayName: 'Law Firm', serviceTypes: ['consultation', 'representation'] },
    { name: 'categories/gcid:real_estate_agency', displayName: 'Real Estate Agency', serviceTypes: ['buying', 'selling', 'renting'] },
];

const ATTRIBUTE_TEMPLATES = [
    { attributeId: 'has_wheelchair_accessible_entrance', displayName: 'Wheelchair accessible entrance', valueType: 'BOOL' },
    { attributeId: 'has_wifi', displayName: 'Wi-Fi', valueType: 'BOOL' },
    { attributeId: 'has_outdoor_seating', displayName: 'Outdoor seating', valueType: 'BOOL' },
    { attributeId: 'has_delivery', displayName: 'Delivery', valueType: 'BOOL' },
    { attributeId: 'has_takeout', displayName: 'Takeout', valueType: 'BOOL' },
    { attributeId: 'has_restroom', displayName: 'Restroom', valueType: 'BOOL' },
    { attributeId: 'pay_credit_card_types_accepted', displayName: 'Credit cards accepted', valueType: 'REPEATED_ENUM' },
    { attributeId: 'requires_masks_customers', displayName: 'Masks required', valueType: 'BOOL' },
];

const POST_TYPES = ['STANDARD', 'EVENT', 'OFFER', 'ALERT'];

const generateData = () => {
    const data = {
        accounts: [],
        locations: [],
        reviews: [],
        categories: BUSINESS_CATEGORIES,
        categoryAttributes: [],
        attributes: [],
        media: [],
        localPosts: [],
        verifications: [],
        notifications: []
    };

    // Generate category attributes
    BUSINESS_CATEGORIES.forEach(cat => {
        const numAttrs = faker.number.int({ min: 2, max: 5 });
        const shuffled = faker.helpers.shuffle([...ATTRIBUTE_TEMPLATES]);
        for (let i = 0; i < numAttrs; i++) {
            data.categoryAttributes.push({
                ...shuffled[i],
                parent: cat.name
            });
        }
    });

    // Generate 2 Accounts
    for (let i = 0; i < 2; i++) {
        const accountId = faker.string.numeric(10);
        const accountName = `accounts/${accountId}`;

        data.accounts.push({
            name: accountName,
            accountName: faker.company.name(),
            type: "PERSONAL",
            role: "OWNER",
            verificationState: "VERIFIED"
        });

        // Notification settings per account
        data.notifications.push({
            name: `${accountName}/notifications`,
            topicName: `projects/mock-project/topics/gbp-notifications-${accountId}`,
            notificationTypes: ["NEW_REVIEW", "UPDATED_REVIEW", "GOOGLE_UPDATE"]
        });

        // Generate 3 Locations per Account
        for (let j = 0; j < 3; j++) {
            const locationId = faker.string.numeric(10);
            const locationName = `${accountName}/locations/${locationId}`;
            const category = faker.helpers.arrayElement(BUSINESS_CATEGORIES);

            data.locations.push({
                name: locationName,
                title: faker.company.name(),
                storeCode: faker.string.alphanumeric(5).toUpperCase(),
                primaryCategory: { displayName: category.displayName, categoryId: category.name },
                phoneNumbers: {
                    primaryPhone: faker.phone.number()
                },
                address: {
                    regionCode: "US",
                    languageCode: "en-US",
                    postalCode: faker.location.zipCode(),
                    adminArea: faker.location.state(),
                    locality: faker.location.city(),
                    addressLines: [faker.location.streetAddress()]
                },
                websiteUri: faker.internet.url(),
                regularHours: {
                    periods: [
                        { openDay: "MONDAY", openTime: "09:00", closeDay: "MONDAY", closeTime: "17:00" },
                        { openDay: "TUESDAY", openTime: "09:00", closeDay: "TUESDAY", closeTime: "17:00" },
                        { openDay: "WEDNESDAY", openTime: "09:00", closeDay: "WEDNESDAY", closeTime: "17:00" },
                        { openDay: "THURSDAY", openTime: "09:00", closeDay: "THURSDAY", closeTime: "17:00" },
                        { openDay: "FRIDAY", openTime: "09:00", closeDay: "FRIDAY", closeTime: "17:00" },
                    ]
                },
                latlng: {
                    latitude: parseFloat(faker.location.latitude()),
                    longitude: parseFloat(faker.location.longitude())
                },
                metadata: {
                    mapsUri: `https://maps.google.com/?cid=mock-${locationId}`,
                    newReviewUri: `https://search.google.com/local/writereview?placeid=mock-${locationId}`
                }
            });

            // Attributes for each location
            const numAttrs = faker.number.int({ min: 2, max: 5 });
            const shuffled = faker.helpers.shuffle([...ATTRIBUTE_TEMPLATES]);
            for (let a = 0; a < numAttrs; a++) {
                data.attributes.push({
                    parent: `locations/${locationId}`,
                    attributeId: shuffled[a].attributeId,
                    valueType: shuffled[a].valueType,
                    values: shuffled[a].valueType === 'BOOL' ? [faker.datatype.boolean()] : ['visa', 'mastercard']
                });
            }

            // Media for each location (2-4 items)
            const numMedia = faker.number.int({ min: 2, max: 4 });
            for (let m = 0; m < numMedia; m++) {
                const mediaId = faker.string.alphanumeric(12);
                data.media.push({
                    name: `${locationName}/media/${mediaId}`,
                    mediaFormat: faker.helpers.arrayElement(["PHOTO", "VIDEO"]),
                    sourceUrl: faker.image.url(),
                    googleUrl: `https://lh3.googleusercontent.com/mock-${mediaId}`,
                    locationAssociation: { category: faker.helpers.arrayElement(["COVER", "PROFILE", "ADDITIONAL"]) },
                    createTime: faker.date.past().toISOString(),
                    dimensions: { widthPixels: 1920, heightPixels: 1080 },
                    insights: {
                        viewCount: String(faker.number.int({ min: 10, max: 5000 })),
                        searchCount: String(faker.number.int({ min: 5, max: 2000 }))
                    }
                });
            }

            // Local Posts for each location (1-3 posts)
            const numPosts = faker.number.int({ min: 1, max: 3 });
            for (let p = 0; p < numPosts; p++) {
                const postId = faker.string.alphanumeric(12);
                const topicType = faker.helpers.arrayElement(POST_TYPES);

                const post = {
                    name: `${locationName}/localPosts/${postId}`,
                    languageCode: "en",
                    summary: faker.lorem.paragraph(),
                    topicType,
                    state: "LIVE",
                    createTime: faker.date.past().toISOString(),
                    updateTime: faker.date.recent().toISOString(),
                    searchUrl: `https://local.google.com/place?id=mock-${postId}`
                };

                if (topicType === 'EVENT') {
                    post.event = {
                        title: faker.lorem.sentence(),
                        schedule: {
                            startDate: { year: 2025, month: 6, day: 15 },
                            startTime: { hours: 10, minutes: 0 },
                            endDate: { year: 2025, month: 6, day: 15 },
                            endTime: { hours: 18, minutes: 0 }
                        }
                    };
                }

                if (topicType === 'OFFER') {
                    post.offer = {
                        couponCode: faker.string.alphanumeric(8).toUpperCase(),
                        redeemOnlineUrl: faker.internet.url(),
                        termsConditions: faker.lorem.sentence()
                    };
                }

                data.localPosts.push(post);
            }

            // Verification for each location
            data.verifications.push({
                name: `${locationName}/verifications/mock-verification-${faker.string.alphanumeric(6)}`,
                method: faker.helpers.arrayElement(["SMS", "PHONE_CALL", "EMAIL", "POSTCARD"]),
                state: faker.helpers.arrayElement(["COMPLETED", "PENDING"]),
                createTime: faker.date.past().toISOString()
            });

            // Reviews for each location (5 reviews)
            for (let k = 0; k < 5; k++) {
                const reviewId = faker.string.alphanumeric(15);
                const reviewName = `${locationName}/reviews/${reviewId}`;

                const review = {
                    name: reviewName,
                    reviewId: reviewId,
                    reviewer: {
                        profilePhotoUrl: faker.image.avatar(),
                        displayName: faker.person.fullName()
                    },
                    starRating: faker.helpers.arrayElement(["ONE", "TWO", "THREE", "FOUR", "FIVE"]),
                    comment: faker.lorem.paragraph(),
                    createTime: faker.date.past().toISOString(),
                    updateTime: faker.date.recent().toISOString()
                };

                // 30% chance to have a reply
                if (faker.number.int({ min: 1, max: 10 }) > 7) {
                    review.reviewReply = {
                        comment: faker.lorem.sentences(2),
                        updateTime: faker.date.recent().toISOString()
                    };
                }

                data.reviews.push(review);
            }
        }
    }

    return data;
};

const new_data = generateData();
fs.writeFileSync(DATA_FILE, JSON.stringify(new_data, null, 2));
console.log("Successfully generated mock data in data.json!");
console.log(`  Accounts:       ${new_data.accounts.length}`);
console.log(`  Locations:      ${new_data.locations.length}`);
console.log(`  Reviews:        ${new_data.reviews.length}`);
console.log(`  Categories:     ${new_data.categories.length}`);
console.log(`  Attributes:     ${new_data.attributes.length}`);
console.log(`  Media Items:    ${new_data.media.length}`);
console.log(`  Local Posts:    ${new_data.localPosts.length}`);
console.log(`  Verifications:  ${new_data.verifications.length}`);
console.log(`  Notifications:  ${new_data.notifications.length}`);

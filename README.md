# 🏢 Mock Google Business Profile API

> **An unofficial, open-source mock server for the [Google Business Profile API](https://developers.google.com/my-business/reference/rest) — built for local development and testing.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Google does not provide a sandbox or testing environment for the Business Profile API. This project fills that gap by providing a drop-in replacement that mirrors the real API's structure and response formats, so you can develop and test locally without needing OAuth credentials or a live Google account.

---

## ✨ Features

- **Full API Coverage** — 30 endpoints across 10 API groups (Accounts, Locations, Reviews, Performance, Media, Posts, Categories, Attributes, Verification, Notifications)
- **Realistic Mock Data** — One-command data generation using Faker.js with realistic business names, addresses, reviews, and metrics
- **Drop-in Replacement** — Swap `https://mybusiness*.googleapis.com` with `http://localhost:8080` in your client code — no other changes needed
- **Docker-Ready** — Run with `docker-compose up` for instant, isolated hosting
- **Persistent & Editable** — All data lives in a single `data.json` file you can inspect, edit, or reset at any time
- **Request Logging** — Every request is logged to the console for easy debugging

## 🔖 API Version Compatibility

This mock server is aligned with the following **Google Business Profile API** versions as of **March 2026**:

| Google API | Version | Reference |
|---|---|---|
| Account Management | v1 | [accounts](https://developers.google.com/my-business/reference/accountmanagement/rest/v1/accounts) |
| Business Information | v1 | [locations](https://developers.google.com/my-business/reference/businessinformation/rest/v1/accounts.locations) |
| Business Performance | v1 | [performance](https://developers.google.com/my-business/reference/performance/rest/v1/locations) |
| Notifications | v1 | [notificationSetting](https://developers.google.com/my-business/reference/notifications/rest/v1/accounts) |
| Verifications | v1 | [verifications](https://developers.google.com/my-business/reference/verificationmanagement/rest/v1/locations) |
| Reviews | v4 (legacy) | [reviews](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews) |
| Media | v4 (legacy) | [media](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.media) |
| Local Posts | v4 (legacy) | [localPosts](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.localPosts) |

> **Note:** Google's Business Profile API is split across multiple sub-APIs with different base URLs. This mock unifies them under a single `http://localhost:8080/v1/` endpoint for convenience.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Seeding Mock Data](#-seeding-mock-data)
- [API Endpoints](#-api-endpoints)
- [Using with Your App](#-using-with-your-app)
- [Docker](#-docker)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone <repository-url>
cd mock-google-business-profile-api

# Install dependencies
npm install

# Generate mock data
npm run seed

# Start the dev server (auto-reloads on changes)
npm run dev
```

The server will be running at **http://localhost:8080**.

---

## 🌱 Seeding Mock Data

The project includes a powerful data generation script that populates the API with realistic test data.

### Running the Seed Script

```bash
npm run seed
```

This creates (or overwrites) a `data.json` file in the project root with:

| Entity | Count | Description |
|---|---|---|
| Accounts | 2 | Business accounts with owner roles |
| Locations | 6 | 3 locations per account with addresses, hours, coordinates, and categories |
| Reviews | 30 | 5 reviews per location, ~30% with owner replies |
| Categories | 10 | Common business types (Restaurant, Hotel, Salon, etc.) |
| Attributes | ~23 | Wi-Fi, wheelchair access, delivery, etc. per location |
| Media | ~17 | Photos and videos with mock Google URLs |
| Local Posts | ~13 | A mix of standard, event, offer, and alert posts |
| Verifications | 6 | One per location (SMS, email, phone, or postcard) |
| Notifications | 2 | Notification settings per account |

### Customizing the Data

You have two options:

**Option A: Edit `data.json` directly**
Open `data.json` in any editor and modify the data. Changes take effect on the next API request — no restart needed.

**Option B: Modify the seed script**
Edit `src/seed.js` to change the number of entities, add custom fields, or adjust the generation logic. Then re-run `npm run seed`.

### Resetting the Data

Simply run `npm run seed` again to regenerate everything from scratch.

---

## 📡 API Endpoints

Base URL: `http://localhost:8080`

### Account Management
| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/accounts` | List all accounts |
| `GET` | `/v1/accounts/:accountId` | Get a specific account |
| `GET` | `/v1/accounts/:accountId/notificationSetting` | Get notification settings |
| `PATCH` | `/v1/accounts/:accountId/notificationSetting` | Update notification settings |

### Business Information (Locations)
| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/accounts/:accountId/locations` | List locations for an account |
| `GET` | `/v1/locations/:locationId` | Get a specific location |
| `PATCH` | `/v1/locations/:locationId` | Update location details |

### Reviews
| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/accounts/:acct/locations/:loc/reviews` | List reviews |
| `GET` | `/v1/accounts/:acct/locations/:loc/reviews/:reviewId` | Get a review |
| `PUT` | `/v1/accounts/:acct/locations/:loc/reviews/:reviewId/reply` | Reply to a review |

### Business Performance
| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/locations/:locationId:fetchMultiDailyMetricsTimeSeries` | Daily metrics (impressions, clicks, calls) |

Supports query params: `dailyMetrics`, `dailyRange.startDate.*`, `dailyRange.endDate.*`

### Media
| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/accounts/:acct/locations/:loc/media` | List media items |
| `GET` | `/v1/accounts/:acct/locations/:loc/media/:mediaId` | Get a media item |
| `POST` | `/v1/accounts/:acct/locations/:loc/media` | Upload a media item |
| `DELETE` | `/v1/accounts/:acct/locations/:loc/media/:mediaId` | Delete a media item |

### Local Posts
| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/accounts/:acct/locations/:loc/localPosts` | List posts |
| `GET` | `/v1/accounts/:acct/locations/:loc/localPosts/:postId` | Get a post |
| `POST` | `/v1/accounts/:acct/locations/:loc/localPosts` | Create a post |
| `PATCH` | `/v1/accounts/:acct/locations/:loc/localPosts/:postId` | Update a post |
| `DELETE` | `/v1/accounts/:acct/locations/:loc/localPosts/:postId` | Delete a post |

### Categories & Attributes
| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/categories` | List business categories |
| `GET` | `/v1/categories:batchGet` | Batch get categories |
| `GET` | `/v1/locations/:locationId/attributes` | List location attributes |
| `PATCH` | `/v1/locations/:locationId/attributes` | Update location attributes |
| `GET` | `/v1/categories/:categoryId/attributes` | List category attributes |

### Verification
| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/locations/:locationId:fetchVerificationOptions` | Get verification methods |
| `POST` | `/v1/locations/:locationId:verify` | Start verification |
| `GET` | `/v1/locations/:locationId/verifications` | List verifications |
| `POST` | `/v1/locations/:loc/verifications/:id:complete` | Complete verification |
| `GET` | `/v1/locations/:locationId/voice_of_merchant_state` | Voice of Merchant state |

---

## 🔌 Using with Your App

Swap your API base URL to point at the mock server. **No other code changes required.**

```javascript
// config.js
const GBP_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://mybusinessbusinessinformation.googleapis.com'
  : 'http://localhost:8080';

// api.js — works identically with both real and mock APIs
const fetchLocations = async (accountId) => {
  const res = await fetch(`${GBP_BASE_URL}/v1/accounts/${accountId}/locations`);
  return (await res.json()).locations;
};

const fetchReviews = async (accountId, locationId) => {
  const res = await fetch(`${GBP_BASE_URL}/v1/accounts/${accountId}/locations/${locationId}/reviews`);
  return (await res.json()).reviews;
};
```

### Account & Location IDs

The real Google API assigns opaque numeric IDs to accounts and locations (e.g., `accounts/1234567890`). The mock server generates random IDs when you run `npm run seed`.

**To integrate with your app**, you have two options:

1. **Discover IDs dynamically** (recommended) — Call `GET /v1/accounts` first, then use the returned account IDs to call `GET /v1/accounts/{id}/locations`. This mirrors the real API's intended flow and works identically with both mock and production.

2. **Use your own IDs** — Edit `data.json` directly to set account and location names that match what your app expects. The mock does simple string matching on the `name` field, so any ID format works.

---

## 🐳 Docker

```bash
# Build and run
docker-compose up -d

# Generate seed data inside the container
docker-compose exec mock-gbp-api npm run seed

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

The Docker setup uses a volume mount, so `data.json` persists between container restarts and is accessible from your host machine.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create a feature branch** (`git checkout -b feature/add-lodging-api`)
3. **Make your changes** and write tests if applicable
4. **Commit** with a clear message (`git commit -m 'Add lodging API endpoints'`)
5. **Push** to your branch (`git push origin feature/add-lodging-api`)
6. **Open a Pull Request**

### Ideas for Contributions
- Add pagination support (`pageToken` / `nextPageToken`)
- Add API key validation middleware
- Add batch endpoint support (`batchGet`, `batchGetReviews`)
- Add rate limiting to simulate Google's API limits
- Expand the seed script with more diverse data

---

## ⚠️ Disclaimer

This project is **not affiliated with, endorsed by, or created by Google**. It is an independent, community-built tool for local development and testing purposes only. "Google Business Profile" is a trademark of Google LLC.

---

## 📄 License

[MIT](LICENSE)

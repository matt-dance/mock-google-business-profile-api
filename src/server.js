import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import accountsRoutes from './routes/accounts.js';
import locationsRoutes from './routes/locations.js';
import reviewsRoutes from './routes/reviews.js';
import performanceRoutes from './routes/performance.js';
import categoriesRoutes from './routes/categories.js';
import attributesRoutes from './routes/attributes.js';
import mediaRoutes from './routes/media.js';
import postsRoutes from './routes/posts.js';
import verificationRoutes from './routes/verification.js';
import notificationsRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Account Management API
app.use('/v1/accounts', accountsRoutes);

// Notifications API (nested under accounts)
app.use('/v1/accounts', notificationsRoutes);

// Business Information API (locations, reviews, media, posts)
app.use('/v1', locationsRoutes);
app.use('/v1', reviewsRoutes);
app.use('/v1', mediaRoutes);
app.use('/v1', postsRoutes);

// Business Performance API
app.use('/v1', performanceRoutes);

// Categories API
app.use('/v1/categories', categoriesRoutes);

// Attributes API
app.use('/v1', attributesRoutes);

// Verification API
app.use('/v1', verificationRoutes);

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 404,
      message: "API endpoint not found on the mock server.",
      status: "NOT_FOUND"
    }
  });
});

app.listen(PORT, () => {
  console.log(`Mock Google Business Profile API running on http://localhost:${PORT}`);
});

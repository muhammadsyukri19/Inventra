import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/error-handler.middleware';
import { requestLogger } from './middleware/logger.middleware';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import categoryRoutes from './modules/category/category.routes';
import supplierRoutes from './modules/supplier/supplier.routes';
import productRoutes from './modules/product/product.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import transactionRoutes from './modules/transaction/transaction.routes';
import recommendationRoutes from './modules/recommendation/recommendation.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import notificationRoutes from './modules/notification/notification.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';

/**
 * Express application factory.
 *
 * Configures middleware stack and registers all route modules.
 * Follows the order: logging → parsing → cors → routes → error handling.
 */

const app = express();

// ============================================================================
// GLOBAL MIDDLEWARE
// ============================================================================

app.use(requestLogger);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Jika development atau CORS_ORIGIN '*', izinkan secara dinamis agar kompatibel dengan credentials: true
      if (!origin || env.CORS_ORIGIN === '*' || env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        // Bersihkan trailing slash jika ada
        const cleanConfigured = env.CORS_ORIGIN.replace(/\/$/, '');
        const cleanOrigin = origin.replace(/\/$/, '');
        if (cleanOrigin === cleanConfigured) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/v1/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
  });
});

// ============================================================================
// API ROUTES (v1)
// ============================================================================

const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/suppliers`, supplierRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/inventories`, inventoryRoutes);
app.use(`${API_PREFIX}/transactions`, transactionRoutes);
// Future module routes will be registered here:
// app.use(`${API_PREFIX}/stock-movements`, stockMovementRoutes);
// app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${API_PREFIX}/recommendations`, recommendationRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use(errorHandler);

export default app;

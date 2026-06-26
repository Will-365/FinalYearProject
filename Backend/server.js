import 'dotenv/config';
import dns from 'dns';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';

// Resident routes
import authRoutes from './routes/authRoutes.js';
import wasteRoutes from './routes/wasteRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';

// Admin routes
import adminAuthRoutes from './routes/admin/adminAuthRoutes.js';
import adminCollectorRoutes from './routes/admin/adminCollectorRoutes.js';
import adminCollectionRoutes from './routes/admin/adminCollectionRoutes.js';
import adminResidentRoutes from './routes/admin/adminResidentRoutes.js';
import adminWasteIntakeRoutes from './routes/admin/adminWasteIntakeRoutes.js';
import adminAddressRoutes from './routes/admin/adminAddressRoutes.js';
import adminReportRoutes from './routes/admin/adminReportRoutes.js';
import adminCatalogRoutes from './routes/admin/adminCatalogRoutes.js';
import adminCouponRoutes from './routes/admin/adminCouponRoutes.js';
import collectorRoutes from './routes/collectorRoutes.js';
import recyclingRoutes from './routes/recyclingRoutes.js';
import productRoutes from './routes/productRoutes.js';
import messagingRoutes from './routes/messagingRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';

import errorHandler from './middleware/errorHandler.js';

// Apply DNS fix before any MongoDB connection (Atlas SRV on Windows)
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

await connectDB();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Resident API ────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/recycling', recyclingRoutes);
app.use('/api/products', productRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/reports', reportsRoutes);

// ── Admin API ───────────────────────────────────────────────
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/collectors', adminCollectorRoutes);
app.use('/api/admin/collections', adminCollectionRoutes);
app.use('/api/admin/residents', adminResidentRoutes);
app.use('/api/admin/waste-intake', adminWasteIntakeRoutes);
app.use('/api/admin/address', adminAddressRoutes);
app.use('/api/admin/reports', adminReportRoutes);
app.use('/api/admin/catalog', adminCatalogRoutes);
app.use('/api/admin/coupons', adminCouponRoutes);
app.use('/api/collector', collectorRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), service: 'GreenCare Rwanda API' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌿 GreenCare Rwanda API running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

/**
 * Manual seeder CLI — same logic as server startup bootstrap.
 *   node scripts/seedAdmin.js
 *   node scripts/seedAdmin.js --with-addresses  (addresses always seeded if empty)
 */

import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';
import { normalizeMongoUri } from '../config/mongoUri.js';
import { seedIfNeeded } from '../utils/seedDatabase.js';

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

async function run() {
  const uri = normalizeMongoUri(process.env.MONGODB_URI);
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in Backend/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log('✅ Connected to MongoDB');
    await seedIfNeeded();
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
    process.exit(0);
  }
}

run();

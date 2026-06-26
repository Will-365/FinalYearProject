import dns from 'dns';
import mongoose from 'mongoose';
import { normalizeMongoUri } from './mongoUri.js';
import { seedIfNeeded } from '../utils/seedDatabase.js';

// Fix querySrv ECONNREFUSED on some Windows / ISP DNS setups (Atlas)
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async () => {
  const uri = normalizeMongoUri(process.env.MONGODB_URI);
  if (!uri) {
    console.error('MONGODB_URI is not set in Backend/.env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    await seedIfNeeded();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    if (uri.includes('mongodb+srv://')) {
      console.error('\nAtlas tips: whitelist your IP, confirm cluster is running, try disabling VPN.');
      console.error('Local dev: docker compose up -d  then  MONGODB_URI=mongodb://localhost:27017/greencare');
    }
    process.exit(1);
  }
};

export default connectDB;

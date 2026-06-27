/**
 * GreenCare Rwanda — Seed Script
 * Usage:
 *   node scripts/seedAdmin.js                  # creates admin only
 *   node scripts/seedAdmin.js --with-addresses # + Rwanda address hierarchy
 *   node scripts/seedAdmin.js --with-products  # + demo products
 *   node scripts/seedAdmin.js --with-buyer     # + demo buyer account
 *   node scripts/seedAdmin.js --all            # everything
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Buyer from '../models/Buyer.js';
import AddressHierarchy from '../models/AddressHierarchy.js';
import Product from '../models/Product.js';

const ADMIN = {
  fullName:   process.env.ADMIN_NAME     || 'GreenCare Admin',
  email:      process.env.ADMIN_EMAIL    || 'admin@greencare.rw',
  password:   process.env.ADMIN_PASSWORD || 'GreenCare@2025!',
  phone:      '+250788000000',
  nationalId: '1199000000000000',
  role:       'admin',
  isVerified: true,
  isActive:   true,
};

const DEMO_BUYER = {
  fullName: 'Demo Buyer',
  phone:    '+250788999888',
  password: 'buyer123',
};

const RWANDA_HIERARCHY = [
  { province: 'Kigali City',       districts: ['Gasabo','Kicukiro','Nyarugenge'] },
  { province: 'Northern Province',  districts: ['Burera','Gakenke','Gicumbi','Musanze','Rulindo'] },
  { province: 'Southern Province',  districts: ['Gisagara','Huye','Kamonyi','Muhanga','Nyamagabe','Nyanza','Nyaruguru','Ruhango'] },
  { province: 'Eastern Province',   districts: ['Bugesera','Gatsibo','Kayonza','Kirehe','Ngoma','Nyagatare','Rwamagana'] },
  { province: 'Western Province',   districts: ['Karongi','Ngororero','Nyabihu','Nyamasheke','Rubavu','Rusizi','Rutsiro'] },
];

const DEMO_PRODUCTS = [
  {
    name: 'Organic Compost Bag (5kg)',
    description: 'Premium compost made from collected organic kitchen waste. Ideal for home gardens and small farms.',
    category: 'compost',
    wasteType: 'organic',
    pointsCost: 50,
    cashPrice: 2000,
    phonePrice: 2000,
    stock: 30,
    unit: 'bag',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600',
    images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'],
    partner: 'GreenCare Rwanda',
    tags: ['compost', 'organic', 'garden', 'fertilizer'],
    isFeatured: true,
    isActive: true,
    isPublic: true,
    sourceWeightKg: 8,
    pipelineStage: 'product',
  },
  {
    name: 'Recycled Plastic Paver (Set of 10)',
    description: 'Durable paving blocks made from compressed inorganic plastic waste. Weather-resistant and eco-friendly.',
    category: 'pavers',
    wasteType: 'inorganic',
    pointsCost: 200,
    cashPrice: 8000,
    phonePrice: 8000,
    stock: 15,
    unit: 'set',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600',
    images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600'],
    partner: 'GreenCare Rwanda',
    tags: ['pavers', 'plastic', 'construction', 'eco'],
    isFeatured: true,
    isActive: true,
    isPublic: true,
    sourceWeightKg: 12,
    pipelineStage: 'product',
  },
  {
    name: 'Upcycled Tote Bag',
    description: 'Stylish carry bag woven from recycled fabric waste. Strong, reusable, and 100% made in Rwanda.',
    category: 'recycled_goods',
    wasteType: 'recyclable',
    pointsCost: 80,
    cashPrice: 3500,
    phonePrice: 3500,
    stock: 50,
    unit: 'piece',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0a15b?w=600',
    images: ['https://images.unsplash.com/photo-1532996122724-e3c354a0a15b?w=600'],
    partner: 'GreenCare Rwanda',
    tags: ['bag', 'upcycled', 'fabric', 'reusable'],
    isFeatured: false,
    isActive: true,
    isPublic: true,
    sourceWeightKg: 0.5,
    pipelineStage: 'product',
  },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');
  const args = process.argv.slice(2);
  const all  = args.includes('--all');

  // ── Admin ────────────────────────────────────────────────
  let admin = await User.findOne({ email: ADMIN.email });
  if (admin) {
    console.log(`ℹ️  Admin already exists: ${ADMIN.email}`);
  } else {
    admin = await User.create(ADMIN);
    console.log(`✅ Admin created:    ${ADMIN.email} / ${ADMIN.password}`);
    console.log('   ⚠️  Change the default password after first login!');
  }

  // ── Demo Buyer ───────────────────────────────────────────
  if (all || args.includes('--with-buyer')) {
    const existingBuyer = await Buyer.findOne({ phone: DEMO_BUYER.phone });
    if (existingBuyer) {
      console.log(`ℹ️  Demo buyer already exists: ${DEMO_BUYER.phone}`);
    } else {
      await Buyer.create(DEMO_BUYER);
      console.log(`✅ Demo buyer created: ${DEMO_BUYER.phone} / ${DEMO_BUYER.password}`);
    }
  }

  // ── Address hierarchy ────────────────────────────────────
  if (all || args.includes('--with-addresses')) {
    for (const item of RWANDA_HIERARCHY) {
      await AddressHierarchy.findOneAndUpdate(
        { level: 'province', name: item.province },
        { level: 'province', name: item.province, createdBy: admin._id },
        { upsert: true, setDefaultsOnInsert: true }
      );
      for (const district of item.districts) {
        await AddressHierarchy.findOneAndUpdate(
          { level: 'district', name: district, province: item.province },
          { level: 'district', name: district, province: item.province, createdBy: admin._id },
          { upsert: true, setDefaultsOnInsert: true }
        );
      }
    }
    const total = RWANDA_HIERARCHY.reduce((sum, p) => sum + p.districts.length, 0);
    console.log(`✅ Seeded ${RWANDA_HIERARCHY.length} provinces and ${total} districts`);
  }

  // ── Demo products ────────────────────────────────────────
  if (all || args.includes('--with-products')) {
    let created = 0;
    for (const p of DEMO_PRODUCTS) {
      const exists = await Product.findOne({ name: p.name });
      if (!exists) {
        await Product.create({ ...p, createdBy: admin._id });
        created++;
      }
    }
    console.log(`✅ Seeded ${created} demo product(s) (${DEMO_PRODUCTS.length - created} already existed)`);
  }

  await mongoose.disconnect();
  console.log('\n🔌 Done. Database seeded successfully.');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});

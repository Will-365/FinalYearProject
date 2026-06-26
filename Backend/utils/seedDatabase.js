import User from '../models/User.js';
import AddressHierarchy from '../models/AddressHierarchy.js';
import RecyclingCenter from '../models/RecyclingCenter.js';
import Coupon from '../models/Coupon.js';

const RWANDA_HIERARCHY = [
  { province: 'Kigali City', districts: ['Gasabo', 'Kicukiro', 'Nyarugenge'] },
  { province: 'Northern Province', districts: ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'] },
  { province: 'Southern Province', districts: ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'] },
  { province: 'Eastern Province', districts: ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'] },
  { province: 'Western Province', districts: ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'] },
];

function getAdminPayload() {
  return {
    fullName: 'GreenCare Admin',
    email: (process.env.ADMIN_EMAIL || 'hirwa@greencare.rw').toLowerCase().trim(),
    password: process.env.ADMIN_PASSWORD || 'GreenCare@2025!',
    phone: '+250788000000',
    nationalId: '1199000000000000',
    role: 'admin',
    isVerified: true,
    isActive: true,
  };
}

async function seedAddresses(adminId) {
  for (const item of RWANDA_HIERARCHY) {
    await AddressHierarchy.findOneAndUpdate(
      { level: 'province', name: item.province },
      { level: 'province', name: item.province, createdBy: adminId },
      { upsert: true, setDefaultsOnInsert: true }
    );

    for (const district of item.districts) {
      await AddressHierarchy.findOneAndUpdate(
        { level: 'district', name: district, province: item.province },
        { level: 'district', name: district, province: item.province, createdBy: adminId },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }
  }
}

/**
 * Idempotent bootstrap — safe to call on every server start.
 * Creates admin + Rwanda address hierarchy only when missing.
 */
export async function seedIfNeeded() {
  const adminPayload = getAdminPayload();
  let adminCreated = false;
  let addressesSeeded = false;

  let admin = await User.findOne({ role: 'admin' });

  if (!admin) {
    admin = await User.create(adminPayload);
    adminCreated = true;
    console.log(`🌱 Admin seeded: ${admin.email}`);
    console.log('   Change the default password after first login.');
  }

  const provinceCount = await AddressHierarchy.countDocuments({ level: 'province' });
  if (provinceCount === 0) {
    await seedAddresses(admin._id);
    addressesSeeded = true;
    console.log(`🌱 Address hierarchy seeded (${RWANDA_HIERARCHY.length} provinces)`);
  }

  await seedCatalog(admin._id);

  if (!adminCreated && !addressesSeeded) {
    console.log('✓ Database already seeded — skipping bootstrap');
  }

  return { adminCreated, addressesSeeded, adminEmail: admin.email };
}

const RWANDA_CENTERS = [
  { name: 'Kigali Recycling Hub', address: 'KG 5 Ave, Kigali', district: 'Gasabo', sector: 'Remera', latitude: -1.9536, longitude: 30.0605, acceptedMaterials: ['Plastic', 'Paper', 'Metal', 'Glass'], hours: '7:00 AM - 6:00 PM', phone: '+250788100001' },
  { name: 'Green Care Processing Center', address: 'Kimihurura, Gasabo', district: 'Gasabo', sector: 'Kimironko', latitude: -1.9369, longitude: 30.0821, acceptedMaterials: ['Plastic', 'Paper', 'Electronics', 'Textiles'], hours: '8:00 AM - 5:00 PM', phone: '+250788100002' },
  { name: 'Nyarugenge Eco Station', address: 'KN 4 Ave, Nyarugenge', district: 'Nyarugenge', sector: 'Nyamirambo', latitude: -1.9706, longitude: 30.0394, acceptedMaterials: ['Organic', 'Plastic', 'Paper'], hours: '8:00 AM - 4:00 PM', phone: '+250788100003' },
];

const REWARD_COUPONS = [
  {
    title: 'Collection Reward — 10% Off Groceries',
    description: 'Thank you for recycling! 10% off at partner supermarkets.',
    pointsRequired: 0,
    discountValue: 10,
    discountType: 'percentage',
    partner: 'Simba Supermarket',
    category: 'food',
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    totalAvailable: -1,
  },
  {
    title: 'Eco Hero — Free Bus Ride',
    description: 'One free KBS bus ride for active recyclers.',
    pointsRequired: 0,
    discountValue: 500,
    discountType: 'fixed',
    partner: 'KBS Rwanda',
    category: 'transport',
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    totalAvailable: -1,
  },
  {
    title: 'Green Shop Discount',
    description: '15% off eco products at GreenCare partner stores.',
    pointsRequired: 0,
    discountValue: 15,
    discountType: 'percentage',
    partner: 'GreenCare Partners',
    category: 'shopping',
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    totalAvailable: -1,
  },
];

async function seedCatalog(adminId) {
  const centerCount = await RecyclingCenter.countDocuments();
  if (centerCount === 0) {
    await RecyclingCenter.insertMany(RWANDA_CENTERS.map((c) => ({ ...c, createdBy: adminId })));
    console.log(`🌱 Recycling centers seeded (${RWANDA_CENTERS.length})`);
  }

  const couponCount = await Coupon.countDocuments();
  if (couponCount === 0) {
    await Coupon.insertMany(REWARD_COUPONS);
    console.log(`🌱 Reward coupon templates seeded (${REWARD_COUPONS.length})`);
  }
}

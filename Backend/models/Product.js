import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['eco_product', 'recycled_goods', 'compost', 'pavers', 'service', 'voucher'],
      default: 'recycled_goods',
    },
    wasteType: {
      type: String,
      enum: ['organic', 'inorganic', 'hazardous', 'recyclable', 'mixed', 'plastic', 'paper', 'glass', 'metal'],
      default: 'recyclable',
    },
    pointsCost: { type: Number, required: true, min: 0 },
    cashPrice: { type: Number, default: 0, min: 0 },
    phonePrice: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'RWF' },
    stock: { type: Number, default: 0, min: 0 },
    imageUrl: { type: String, default: '' },
    images: [{ type: String }],
    partner: { type: String, default: 'GreenCare Rwanda' },
    sku: { type: String, default: '' },
    unit: { type: String, default: 'piece' },
    sourceWeightKg: { type: Number, default: 0 },
    wasteIntake: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WasteCategoryIntake',
      default: null,
    },
    collectionRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CollectionRequest',
      default: null,
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

productSchema.index({ isActive: 1, stock: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;

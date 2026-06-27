import mongoose from 'mongoose';

/**
 * A product is the final output of the waste-to-product pipeline.
 * Pipeline: received → sorting → curing → forming → packaging → product (this record)
 */
const productSchema = new mongoose.Schema(
  {
    // ── Identity ─────────────────────────────────────────────
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    sku:         { type: String, default: '' },
    category: {
      type: String,
      enum: ['eco_product', 'recycled_goods', 'compost', 'pavers', 'upcycled', 'service', 'voucher'],
      default: 'recycled_goods',
    },
    tags: [{ type: String, trim: true }],

    // ── Source waste traceability ─────────────────────────────
    wasteType: {
      type: String,
      enum: ['organic', 'inorganic', 'hazardous', 'recyclable', 'mixed', 'plastic', 'paper', 'glass', 'metal'],
      default: 'recyclable',
    },
    sourceWeightKg:  { type: Number, default: 0 }, // total waste kg that produced this batch
    wasteIntake:     { type: mongoose.Schema.Types.ObjectId, ref: 'WasteCategoryIntake', default: null },
    collectionRequest:{ type: mongoose.Schema.Types.ObjectId, ref: 'CollectionRequest',   default: null },
    // Full pipeline stage when this product was published
    pipelineStage: {
      type: String,
      enum: ['curing', 'forming', 'packaging', 'product'],
      default: 'product',
    },

    // ── Pricing ──────────────────────────────────────────────
    pointsCost: { type: Number, required: true, min: 0 },
    cashPrice:  { type: Number, default: 0, min: 0 },  // RWF
    phonePrice: { type: Number, default: 0, min: 0 },  // RWF via mobile money
    currency:   { type: String, default: 'RWF' },

    // ── Inventory ────────────────────────────────────────────
    stock:          { type: Number, default: 0, min: 0 },
    unit:           { type: String, default: 'piece' }, // piece, kg, litre, bag …
    lowStockThreshold: { type: Number, default: 5 },
    totalSold:      { type: Number, default: 0 },

    // ── Media (images stored as base64 strings OR URLs) ───────
    imageUrl:      { type: String, default: '' },        // primary display image
    images:        [{ type: String }],                   // gallery (base64 or URL)
    thumbnailUrl:  { type: String, default: '' },

    // ── Seller / partner ─────────────────────────────────────
    partner:        { type: String, default: 'GreenCare Rwanda' },
    isFeatured:     { type: Boolean, default: false },

    // ── Visibility ───────────────────────────────────────────
    isActive:       { type: Boolean, default: true },
    isPublic:       { type: Boolean, default: true },   // visible to buyers (non-residents)

    // ── Audit ─────────────────────────────────────────────────
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

productSchema.index({ isActive: 1, stock: 1, isPublic: 1 });
productSchema.index({ category: 1 });
productSchema.index({ wasteType: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;

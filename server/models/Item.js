const mongoose = require('mongoose');

const CATEGORIES = [
  'Electronics', 'Clothing', 'Bags & Luggage', 'Documents & IDs',
  'Jewellery & Accessories', 'Keys', 'Wallet & Purse', 'Books & Stationery',
  'Children\'s Items', 'Food & Beverages', 'Sports Equipment', 'Umbrellas',
  'Eyewear', 'Medical Items', 'Other',
];

const LOCATIONS = [
  'Terminal 1 - Check-in', 'Terminal 1 - Security', 'Terminal 1 - Gate A',
  'Terminal 1 - Gate B', 'Terminal 1 - Arrival Hall', 'Terminal 1 - Baggage Claim',
  'Terminal 2 - Check-in', 'Terminal 2 - Security', 'Terminal 2 - Gate C',
  'Terminal 2 - Gate D', 'Terminal 2 - Arrival Hall', 'Terminal 2 - Baggage Claim',
  'Food Court', 'Duty Free Zone', 'Parking Area', 'Bus Bay', 'Prayer Room',
  'Lounge', 'Medical Center', 'Other',
];

const STATUSES = ['ACTIVE', 'CLAIMED', 'EXPIRED', 'DISPOSED'];

// Generate unique item ID: PNQ-LF-YYYY-XXXX
async function generateItemId() {
  const year = new Date().getFullYear();
  const Item = mongoose.model('Item');
  const count = await Item.countDocuments({ itemId: new RegExp(`^PNQ-LF-${year}`) });
  const seq = String(count + 1).padStart(4, '0');
  return `AXU-LF-${year}-${seq}`;
}

const itemSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: CATEGORIES,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
      max: 999,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      enum: LOCATIONS,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    imagePublicId: {
      type: String,
      default: null,
    },
    foundBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'ACTIVE',
    },
    expiryDate: {
      type: Date,
    },
    disposedDate: {
      type: Date,
    },
    aiSuggested: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-generate itemId and expiryDate before save
itemSchema.pre('save', async function (next) {
  if (!this.itemId) {
    this.itemId = await generateItemId();
  }
  if (!this.expiryDate) {
    const expiry = new Date(this.createdAt || Date.now());
    expiry.setDate(expiry.getDate() + 90);
    this.expiryDate = expiry;
  }
  next();
});

// Virtuals
itemSchema.virtual('daysRemaining').get(function () {
  if (this.status !== 'ACTIVE') return 0;
  const now = new Date();
  const diff = this.expiryDate - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

itemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Item', itemSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.LOCATIONS = LOCATIONS;
module.exports.STATUSES = STATUSES;

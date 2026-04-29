/**
 * 🌱 Seed Script — Zyvora Products
 * Run: npx tsx src/scripts/seed.ts
 *
 * Inserts sample products only if the collection is empty.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { config } from '../config/env.js';

const SAMPLE_PRODUCTS = [
  {
    name: 'Luxury Rose Bouquet',
    price: 1499,
    description:
      'Elegant handpicked roses for special moments. Each stem is carefully selected for freshness and beauty.',
    image:
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&q=80',
    category: 'flowers',
    stock: 20,
  },
  {
    name: 'Premium Gift Hamper',
    price: 2499,
    description:
      'Curated luxury hamper with artisan chocolates, dried flowers, and a personalised card.',
    image:
      'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&q=80',
    category: 'hampers',
    stock: 12,
  },
  {
    name: 'Golden Hour Box',
    price: 1999,
    description:
      'Aesthetic gift box perfect for birthdays, anniversaries, and celebrations. Arrives gift-wrapped.',
    image:
      'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80',
    category: 'gift boxes',
    stock: 15,
  },
  {
    name: 'Crimson Velvet Arrangement',
    price: 1799,
    description:
      'Deep red roses arranged in a premium velvet box — a timeless expression of love.',
    image:
      'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&q=80',
    category: 'flowers',
    stock: 8,
  },
  {
    name: 'Blush Peony Set',
    price: 1299,
    description:
      'Soft blush peonies wrapped in hand-folded tissue paper for a dreamy, romantic feel.',
    image:
      'https://images.unsplash.com/photo-1490750967868-88df5691cc31?w=800&q=80',
    category: 'flowers',
    stock: 10,
  },
  {
    name: 'Signature Chocolate Box',
    price: 999,
    description:
      'A handpicked selection of Belgian and Swiss chocolates in an elegant keepsake box.',
    image:
      'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&q=80',
    category: 'chocolates',
    stock: 25,
  },
];

async function seed() {
  await mongoose.connect(config.mongo.uri);
  console.log('✅ Connected to MongoDB');

  const count = await Product.countDocuments();

  if (count > 0) {
    console.log(
      `⚠️  Skipping seed — ${count} product(s) already exist in the database.`
    );
    await mongoose.disconnect();
    return;
  }

  const inserted = await Product.insertMany(SAMPLE_PRODUCTS);
  console.log(`🌱 Seeded ${inserted.length} sample products successfully.`);

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});

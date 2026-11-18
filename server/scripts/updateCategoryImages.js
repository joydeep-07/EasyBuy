import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import Category from '../models/Category.js';

const updates = [
  {
    slug: 'electronics',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80',
    icon: 'Laptop',
    displayOrder: 1
  },
  {
    slug: 'smartphones',
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80',
    icon: 'Smartphone',
    displayOrder: 2
  },
  {
    slug: 'laptops',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    icon: 'Laptop',
    displayOrder: 3
  },
  {
    slug: 'headphones-audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    icon: 'Headphones',
    displayOrder: 4
  },
  {
    slug: 'fashion',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80',
    icon: 'Shirt',
    displayOrder: 5
  },
  {
    slug: 'mens-clothing',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80',
    icon: 'Shirt',
    displayOrder: 6
  },
  {
    slug: 'womens-clothing',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80',
    icon: 'ShoppingBag',
    displayOrder: 7
  },
  {
    slug: 'grocery',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    icon: 'Apple',
    displayOrder: 8
  },
  {
    slug: 'beauty',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
    icon: 'Sparkles',
    displayOrder: 9
  },
  {
    slug: 'home-kitchen',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    icon: 'Home',
    displayOrder: 10
  },
  {
    slug: 'sports-fitness',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    icon: 'Dumbbell',
    displayOrder: 11
  },
  {
    slug: 'supplements-protein',
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80',
    icon: 'Activity',
    displayOrder: 12
  },
  {
    slug: 'footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    icon: 'Footprints',
    displayOrder: 13
  },
  {
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop&q=80',
    icon: 'Watch',
    displayOrder: 14
  },
  {
    slug: 'books',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    icon: 'BookOpen',
    displayOrder: 15
  }
];

async function run() {
  await connectDB();
  for (const item of updates) {
    const res = await Category.updateOne(
      { slug: item.slug },
      { $set: { image: item.image, icon: item.icon, displayOrder: item.displayOrder } }
    );
    console.log(`Updated ${item.slug}: matched ${res.matchedCount}, modified ${res.modifiedCount}`);
  }

  const finalCats = await Category.find({}, 'name slug image displayOrder').sort({ displayOrder: 1 });
  console.log('Categories in DB now:');
  finalCats.forEach(c => console.log(`${c.displayOrder}: ${c.name} (${c.slug}) -> ${c.image}`));
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Category from '../models/Category.js';
import AttributeDefinition from '../models/AttributeDefinition.js';
import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import Inventory from '../models/Inventory.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import Address from '../models/Address.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import Order from '../models/Order.js';
import Shipment from '../models/Shipment.js';
import Coupon from '../models/Coupon.js';
import Review from '../models/Review.js';
import ProductRelation from '../models/ProductRelation.js';
import DeliveryZone from '../models/DeliveryZone.js';
import Notification from '../models/Notification.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce_platform';

const seedDatabase = async () => {
  try {
    console.log('[Seed]: Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('[Seed]: Connected successfully.');

    // Clear existing collections
    console.log('[Seed]: Cleaning existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Admin.deleteMany({}),
      Category.deleteMany({}),
      AttributeDefinition.deleteMany({}),
      Product.deleteMany({}),
      ProductVariant.deleteMany({}),
      Inventory.deleteMany({}),
      InventoryTransaction.deleteMany({}),
      Address.deleteMany({}),
      Cart.deleteMany({}),
      Wishlist.deleteMany({}),
      Order.deleteMany({}),
      Shipment.deleteMany({}),
      Coupon.deleteMany({}),
      Review.deleteMany({}),
      ProductRelation.deleteMany({}),
      DeliveryZone.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    // 1. Create Admin Account
    console.log('[Seed]: Creating Demo Admin and Customers...');
    const admin = await Admin.create({
      name: 'System Administrator',
      email: 'admin@gmail.com',
      password: '123456',
      role: 'ADMIN',
      permissions: ['all'],
    });

    // Also create in User model with role ADMIN for compatibility
    await User.create({
      firstName: 'Admin',
      lastName: 'EasyBuy',
      email: 'admin@gmail.com',
      password: '123456',
      role: 'ADMIN',
      phone: '9876543210',
    });

    // 2. Create Demo Customers
    const customer1 = await User.create({
      firstName: 'Aarav',
      lastName: 'Sharma',
      email: 'customer@gmail.com',
      password: 'password123',
      role: 'CUSTOMER',
      phone: '9830112233',
    });

    const customer2 = await User.create({
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'priya@example.com',
      password: 'password123',
      role: 'CUSTOMER',
      phone: '9870223344',
    });

    // 3. Create Delivery Zones (with location restrictions demo)
    console.log('[Seed]: Creating Delivery Zones...');
    await DeliveryZone.create([
      {
        name: 'Asansol Central',
        pincode: '713301',
        city: 'Asansol',
        state: 'West Bengal',
        isServiceable: true,
        estimatedDeliveryDays: 2,
        deliveryFee: 0, // Free delivery
        isCodAvailable: true,
        isExpressAvailable: true,
        expressDeliveryFee: 49,
      },
      {
        name: 'Asansol North',
        pincode: '713302',
        city: 'Asansol',
        state: 'West Bengal',
        isServiceable: false, // Explicitly unavailable at location demo
        estimatedDeliveryDays: 5,
        deliveryFee: 60,
        isCodAvailable: false,
      },
      {
        name: 'Asansol Industrial Area',
        pincode: '713303',
        city: 'Asansol',
        state: 'West Bengal',
        isServiceable: false, // Not deliverable demo
        estimatedDeliveryDays: 7,
        deliveryFee: 100,
        isCodAvailable: false,
      },
      {
        name: 'Kolkata Metropolitan',
        pincode: '700001',
        city: 'Kolkata',
        state: 'West Bengal',
        isServiceable: true,
        estimatedDeliveryDays: 2,
        deliveryFee: 40,
        isCodAvailable: true,
        isExpressAvailable: true,
        expressDeliveryFee: 79,
      },
      {
        name: 'Mumbai Central',
        pincode: '400001',
        city: 'Mumbai',
        state: 'Maharashtra',
        isServiceable: true,
        estimatedDeliveryDays: 3,
        deliveryFee: 40,
        isCodAvailable: true,
        isExpressAvailable: true,
      },
      {
        name: 'Bengaluru IT Corridor',
        pincode: '560001',
        city: 'Bengaluru',
        state: 'Karnataka',
        isServiceable: true,
        estimatedDeliveryDays: 3,
        deliveryFee: 40,
        isCodAvailable: true,
        isExpressAvailable: true,
      },
      {
        name: 'Delhi Connaught Place',
        pincode: '110001',
        city: 'New Delhi',
        state: 'Delhi',
        isServiceable: true,
        estimatedDeliveryDays: 3,
        deliveryFee: 40,
        isCodAvailable: true,
        isExpressAvailable: true,
      },
    ]);

    // 4. Create Addresses for Customers
    console.log('[Seed]: Creating Addresses...');
    const addr1 = await Address.create({
      user: customer1._id,
      fullName: 'Aarav Sharma',
      phoneNumber: '9830112233',
      houseBuilding: 'Flat 402, Green View Residency',
      street: 'GT Road East, Ushagram',
      locality: 'Near Apollo Pharmacy',
      landmark: 'Opposite Clock Tower',
      city: 'Asansol',
      state: 'West Bengal',
      pincode: '713301',
      addressType: 'HOME',
      isDefault: true,
    });

    await Address.create({
      user: customer1._id,
      fullName: 'Aarav Sharma (Office)',
      phoneNumber: '9830112233',
      houseBuilding: 'Tech Park Tower B, 3rd Floor',
      street: 'Sector 5, Salt Lake',
      locality: 'Bidhannagar',
      landmark: 'Near Webel Bhavan',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700091',
      addressType: 'WORK',
      isDefault: false,
    });

    customer1.defaultAddress = addr1._id;
    await customer1.save();

    // 5. Create Categories & Subcategories
    console.log('[Seed]: Creating Categories & Subcategories...');
    const catElectronics = await Category.create({
      name: 'Electronics',
      slug: 'electronics',
      description: 'Laptops, Smartphones, Audio, Smartwatches and Accessories',
      image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80',
      icon: 'Laptop',
      isFeatured: true,
      displayOrder: 1,
    });

    const catFashion = await Category.create({
      name: 'Fashion',
      slug: 'fashion',
      description: 'Men and Women Apparels, Trending Outfits, and Styles',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80',
      icon: 'Shirt',
      isFeatured: true,
      displayOrder: 2,
    });

    const catGrocery = await Category.create({
      name: 'Grocery',
      slug: 'grocery',
      description: 'Daily Essentials, Gourmet Foods, Spices, Beverages & Snacks',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
      icon: 'Apple',
      isFeatured: true,
      displayOrder: 3,
    });

    const catBeauty = await Category.create({
      name: 'Beauty',
      slug: 'beauty',
      description: 'Skincare, Haircare, Luxury Fragrances, and Cosmetics',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
      icon: 'Sparkles',
      isFeatured: true,
      displayOrder: 4,
    });

    const catHomeKitchen = await Category.create({
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      description: 'Cookware, Home Appliances, Decor, and Organization',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
      icon: 'Home',
      isFeatured: true,
      displayOrder: 5,
    });

    const catSports = await Category.create({
      name: 'Sports & Fitness',
      slug: 'sports-fitness',
      description: 'Fitness Equipment, Gym Wear, Supplements & Outdoor Gear',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
      icon: 'Dumbbell',
      isFeatured: true,
      displayOrder: 6,
    });

    const catFootwear = await Category.create({
      name: 'Footwear',
      slug: 'footwear',
      description: 'Running Shoes, Formal Shoes, Sneakers & Sandals',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      icon: 'Footprints',
      isFeatured: true,
      displayOrder: 7,
    });

    const catAccessories = await Category.create({
      name: 'Accessories',
      slug: 'accessories',
      description: 'Watches, Wallets, Bags, Belts & Sunglasses',
      image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop&q=80',
      icon: 'Watch',
      isFeatured: true,
      displayOrder: 8,
    });

    const catBooks = await Category.create({
      name: 'Books',
      slug: 'books',
      description: 'Bestselling Fiction, Self-Help, Science & Business Books',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
      icon: 'BookOpen',
      isFeatured: false,
      displayOrder: 9,
    });

    // Subcategories
    const subSmartphones = await Category.create({
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Latest 5G flagship smartphones, folding phones & mobile devices',
      image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80',
      icon: 'Smartphone',
      parentCategory: catElectronics._id,
      displayOrder: 10,
    });
    const subLaptops = await Category.create({
      name: 'Laptops',
      slug: 'laptops',
      description: 'Ultra-thin notebooks, pro creator machines & gaming laptops',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
      icon: 'Laptop',
      parentCategory: catElectronics._id,
      displayOrder: 11,
    });
    const subAudio = await Category.create({
      name: 'Headphones & Audio',
      slug: 'headphones-audio',
      description: 'Spatial audio headphones, wireless earbuds & studio monitors',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      icon: 'Headphones',
      parentCategory: catElectronics._id,
      displayOrder: 12,
    });
    const subMenFashion = await Category.create({
      name: "Men's Clothing",
      slug: 'mens-clothing',
      description: 'Tailored shirts, casual tees, denim & modern jackets',
      image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80',
      icon: 'Shirt',
      parentCategory: catFashion._id,
      displayOrder: 13,
    });
    const subWomenFashion = await Category.create({
      name: "Women's Clothing",
      slug: 'womens-clothing',
      description: 'Dresses, designer tops, knitwear & seasonal collections',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80',
      icon: 'ShoppingBag',
      parentCategory: catFashion._id,
      displayOrder: 14,
    });
    const subSupplements = await Category.create({
      name: 'Supplements & Protein',
      slug: 'supplements-protein',
      description: 'Whey protein isolates, workout energy & daily multivitamins',
      image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80',
      icon: 'Activity',
      parentCategory: catSports._id,
      displayOrder: 15,
    });

    // 6. Create Dynamic Attribute Definitions
    console.log('[Seed]: Creating Category Dynamic Attribute Definitions...');
    // Electronics Attributes
    await AttributeDefinition.create([
      {
        category: catElectronics._id,
        name: 'Brand',
        slug: 'brand',
        type: 'dropdown',
        predefinedValues: ['Apple', 'Samsung', 'Sony', 'OnePlus', 'Dell', 'Asus', 'Bose'],
        isRequired: true,
        isFilterable: true,
      },
      {
        category: catElectronics._id,
        name: 'Storage',
        slug: 'storage',
        type: 'dropdown',
        unit: 'GB',
        predefinedValues: ['128GB', '256GB', '512GB', '1TB'],
        isVariantAttribute: true,
        isFilterable: true,
      },
      {
        category: catElectronics._id,
        name: 'Colour',
        slug: 'colour',
        type: 'dropdown',
        predefinedValues: ['Midnight Black', 'Space Grey', 'Titanium Silver', 'Phantom Blue'],
        isVariantAttribute: true,
        isFilterable: true,
      },
      {
        category: catElectronics._id,
        name: 'Processor',
        slug: 'processor',
        type: 'text',
        isRequired: false,
      },
      {
        category: catElectronics._id,
        name: 'Warranty',
        slug: 'warranty',
        type: 'dropdown',
        predefinedValues: ['1 Year', '2 Years', '3 Years Extended'],
      },
    ]);

    // Fashion Attributes
    await AttributeDefinition.create([
      {
        category: catFashion._id,
        name: 'Brand',
        slug: 'brand',
        type: 'dropdown',
        predefinedValues: ['Nike', 'Adidas', 'Puma', 'Levi’s', 'Zara', 'Allen Solly'],
        isRequired: true,
        isFilterable: true,
      },
      {
        category: catFashion._id,
        name: 'Size',
        slug: 'size',
        type: 'dropdown',
        predefinedValues: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        isVariantAttribute: true,
        isFilterable: true,
      },
      {
        category: catFashion._id,
        name: 'Colour',
        slug: 'colour',
        type: 'dropdown',
        predefinedValues: ['Black', 'White', 'Navy Blue', 'Crimson Red', 'Olive Green', 'Charcoal Grey'],
        isVariantAttribute: true,
        isFilterable: true,
      },
      {
        category: catFashion._id,
        name: 'Fabric',
        slug: 'fabric',
        type: 'text',
      },
      {
        category: catFashion._id,
        name: 'Fit',
        slug: 'fit',
        type: 'dropdown',
        predefinedValues: ['Slim Fit', 'Regular Fit', 'Oversized', 'Relaxed'],
      },
    ]);

    // Grocery Attributes
    await AttributeDefinition.create([
      {
        category: catGrocery._id,
        name: 'Brand',
        slug: 'brand',
        type: 'text',
        isRequired: true,
        isFilterable: true,
      },
      {
        category: catGrocery._id,
        name: 'Weight',
        slug: 'weight',
        type: 'dropdown',
        unit: 'g',
        predefinedValues: ['250g', '500g', '1kg', '5kg'],
        isVariantAttribute: true,
        isFilterable: true,
      },
      {
        category: catGrocery._id,
        name: 'Dietary Information',
        slug: 'dietary_info',
        type: 'multi-select',
        predefinedValues: ['100% Vegetarian', 'Gluten Free', 'Organic', 'Sugar Free'],
      },
    ]);

    // Footwear Attributes
    await AttributeDefinition.create([
      {
        category: catFootwear._id,
        name: 'Brand',
        slug: 'brand',
        type: 'dropdown',
        predefinedValues: ['Nike', 'Puma', 'Adidas', 'Reebok', 'Asics'],
        isRequired: true,
        isFilterable: true,
      },
      {
        category: catFootwear._id,
        name: 'Shoe Size',
        slug: 'shoe_size',
        type: 'dropdown',
        unit: 'UK/India',
        predefinedValues: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
        isVariantAttribute: true,
        isFilterable: true,
      },
      {
        category: catFootwear._id,
        name: 'Colour',
        slug: 'colour',
        type: 'dropdown',
        predefinedValues: ['Triple Black', 'Pure White', 'Royal Blue', 'Red Flare'],
        isVariantAttribute: true,
        isFilterable: true,
      },
    ]);

    // Sports & Fitness Attributes
    await AttributeDefinition.create([
      {
        category: catSports._id,
        name: 'Flavour',
        slug: 'flavour',
        type: 'dropdown',
        predefinedValues: ['Rich Chocolate', 'Double Rich Chocolate', 'Vanilla Bean', 'Cookies & Cream', 'Strawberry'],
        isVariantAttribute: true,
        isFilterable: true,
      },
      {
        category: catSports._id,
        name: 'Weight',
        slug: 'weight',
        type: 'dropdown',
        unit: 'kg',
        predefinedValues: ['1 kg (2.2 lbs)', '2 kg (4.4 lbs)', '4 kg (8.8 lbs)'],
        isVariantAttribute: true,
        isFilterable: true,
      },
    ]);

    // 7. Create Over 30 Realistic Products with Variants and Inventory
    console.log('[Seed]: Creating 32 Realistic Products with Variants and Inventories...');

    // Product 1: Nike Dri-FIT Sportswear T-Shirt (Multiple Variants)
    const p1 = await Product.create({
      title: 'Nike Dri-FIT Men Classic Performance Athletic T-Shirt',
      slug: 'nike-dri-fit-athletic-tshirt',
      brand: 'Nike',
      category: catFashion._id,
      subcategory: subMenFashion._id,
      description:
        'The Nike Dri-FIT T-Shirt delivers a soft feel, sweat-wicking performance, and great range of motion to get you through your workout in total comfort. Features anti-odor fabric and ergonomic seams.',
      highlights: [
        'Dri-FIT technology moves sweat away from your skin for quicker evaporation',
        'Jersey fabric feels soft and smooth against the skin',
        'Standard fit for a relaxed, easy feel',
        'Machine washable and fade-resistant',
      ],
      specifications: [
        { name: 'Fabric', value: '57% Cotton, 43% Polyester' },
        { name: 'Fit', value: 'Regular Athletic Fit' },
        { name: 'Sleeve', value: 'Half Sleeve' },
        { name: 'Neckline', value: 'Ribbed Crew Neck' },
      ],
      dynamicAttributes: { Brand: 'Nike', Fit: 'Regular Fit', Fabric: 'Cotton Blend' },
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
      ],
      basePrice: 999,
      originalPrice: 1599,
      discountPercentage: 38,
      rating: 4.6,
      reviewCount: 142,
      hasVariants: true,
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      salesCount: 310,
      restrictedPincodes: [
        { pincode: '713303', reason: 'Not deliverable to selected industrial zone PIN code' },
      ],
    });

    // Variants for Nike T-Shirt (demonstrating varying stock, sold-out combination)
    const p1Variants = [
      {
        product: p1._id,
        sku: 'NK-TSH-BLK-M',
        title: 'Nike Dri-FIT T-Shirt - Black / M',
        attributes: { Colour: 'Black', Size: 'M' },
        price: 999,
        originalPrice: 1599,
        stock: 15,
        isAvailable: true,
      },
      {
        product: p1._id,
        sku: 'NK-TSH-BLK-L',
        title: 'Nike Dri-FIT T-Shirt - Black / L',
        attributes: { Colour: 'Black', Size: 'L' },
        price: 999,
        originalPrice: 1599,
        stock: 20,
        isAvailable: true,
      },
      {
        product: p1._id,
        sku: 'NK-TSH-WHT-M',
        title: 'Nike Dri-FIT T-Shirt - White / M',
        attributes: { Colour: 'White', Size: 'M' },
        price: 1099,
        originalPrice: 1599,
        stock: 8,
        isAvailable: true,
      },
      {
        product: p1._id,
        sku: 'NK-TSH-BLU-XL',
        title: 'Nike Dri-FIT T-Shirt - Blue / XL',
        attributes: { Colour: 'Blue', Size: 'XL' },
        price: 999,
        originalPrice: 1599,
        stock: 0, // SOLD OUT VARIANT DEMO
        isAvailable: false,
        status: 'OUT_OF_STOCK',
      },
    ];

    for (const v of p1Variants) {
      const varDoc = await ProductVariant.create(v);
      await Inventory.create({
        product: p1._id,
        variant: varDoc._id,
        sku: varDoc.sku,
        currentStock: varDoc.stock,
        reservedStock: 0,
        lowStockThreshold: 5,
      });
    }

    // Product 2: Optimum Nutrition Gold Standard 100% Whey Protein
    const p2 = await Product.create({
      title: 'Optimum Nutrition (ON) Gold Standard 100% Whey Protein Powder',
      slug: 'optimum-nutrition-gold-standard-whey-protein',
      brand: 'Optimum Nutrition',
      category: catSports._id,
      subcategory: subSupplements._id,
      description:
        'World’s #1 selling whey protein powder. Each serving provides 24 grams of all-whey protein composed of Whey Protein Isolate and Ultrafiltered Whey Protein Concentrate, along with 5.5 grams of BCAAs.',
      highlights: [
        '24g Protein per serving to build and maintain muscle',
        '5.5g Naturally Occurring BCAAs per serving',
        'Gluten-Free, Banned Substance Tested (Informed Choice)',
        'Easy mixability using just a glass and spoon',
      ],
      specifications: [
        { name: 'Protein Source', value: 'Whey Isolate Primary' },
        { name: 'Serving Size', value: '30.4g' },
        { name: 'Servings Per Container', value: '74 servings (for 2.27kg)' },
      ],
      images: [
        'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&auto=format&fit=crop&q=80',
      ],
      basePrice: 3299,
      originalPrice: 4299,
      discountPercentage: 23,
      rating: 4.8,
      reviewCount: 380,
      hasVariants: true,
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      salesCount: 520,
    });

    const p2Variants = [
      {
        product: p2._id,
        sku: 'ON-WHEY-CHOC-1KG',
        title: 'ON Gold Standard Whey - Double Rich Chocolate / 1 kg',
        attributes: { Flavour: 'Double Rich Chocolate', Weight: '1 kg' },
        price: 3299,
        originalPrice: 4299,
        stock: 35,
        isAvailable: true,
      },
      {
        product: p2._id,
        sku: 'ON-WHEY-CHOC-2KG',
        title: 'ON Gold Standard Whey - Double Rich Chocolate / 2 kg',
        attributes: { Flavour: 'Double Rich Chocolate', Weight: '2 kg' },
        price: 6199,
        originalPrice: 7999,
        stock: 22,
        isAvailable: true,
      },
      {
        product: p2._id,
        sku: 'ON-WHEY-VAN-1KG',
        title: 'ON Gold Standard Whey - Vanilla Bean / 1 kg',
        attributes: { Flavour: 'Vanilla Bean', Weight: '1 kg' },
        price: 3299,
        originalPrice: 4299,
        stock: 14,
        isAvailable: true,
      },
    ];

    for (const v of p2Variants) {
      const varDoc = await ProductVariant.create(v);
      await Inventory.create({
        product: p2._id,
        variant: varDoc._id,
        sku: varDoc.sku,
        currentStock: varDoc.stock,
        reservedStock: 0,
        lowStockThreshold: 5,
      });
    }

    // Product 3: Shaker Bottle (Frequently Bought Together with Whey Protein)
    const p3 = await Product.create({
      title: 'BlenderBottle Classic V2 Shaker Bottle with Wire Whisk 828ml',
      slug: 'blenderbottle-classic-v2-shaker-828ml',
      brand: 'BlenderBottle',
      category: catSports._id,
      subcategory: subSupplements._id,
      description:
        'The BlenderBottle Classic V2 shaker cup is built off the design of the iconic Classic bottle, with upgraded features including a rounded base and SpoutGuard to keep dirty gym fingers off the drinking surface.',
      highlights: [
        '828ml capacity with embossed ounce and milliliter markings',
        'Patented mixing system uses 316 surgical-grade stainless steel BlenderBall wire whisk',
        'Leak-proof guarantee with screw-on lid and secure flip cap',
        'BPA and phthalate-free, top-rack dishwasher safe',
      ],
      specifications: [
        { name: 'Capacity', value: '828 ml / 28 oz' },
        { name: 'Material', value: 'BPA-Free Polypropylene' },
        { name: 'Dishwasher Safe', value: 'Yes' },
      ],
      images: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800&auto=format&fit=crop&q=80',
      ],
      basePrice: 599,
      originalPrice: 899,
      discountPercentage: 33,
      rating: 4.7,
      reviewCount: 95,
      hasVariants: false,
      salesCount: 410,
    });
    await Inventory.create({
      product: p3._id,
      sku: 'BLND-SHK-828ML',
      currentStock: 40,
      reservedStock: 0,
      lowStockThreshold: 5,
    });

    // Establish Frequently Bought Together relationship between Protein & Shaker
    await ProductRelation.create({
      productA: p2._id,
      productB: p3._id,
      relationType: 'FREQUENTLY_BOUGHT_TOGETHER',
      strength: 15,
    });

    // Product 4: Apple iPhone 15 Pro Max
    const p4 = await Product.create({
      title: 'Apple iPhone 15 Pro Max (Natural Titanium, Super Retina XDR)',
      slug: 'apple-iphone-15-pro-max-natural-titanium',
      brand: 'Apple',
      category: catElectronics._id,
      subcategory: subSmartphones._id,
      description:
        'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever with 5x telephoto optical zoom.',
      highlights: [
        'Aerospace-grade titanium design is strong and light',
        '6.7-inch Super Retina XDR display with ProMotion 120Hz',
        'A17 Pro chip brings pro-class GPU graphics and performance',
        'Pro camera system with 48MP Main lens and 5x optical telephoto',
      ],
      specifications: [
        { name: 'Display', value: '6.7-inch OLED Super Retina XDR' },
        { name: 'Chip', value: 'A17 Pro chip with 6-core GPU' },
        { name: 'Connector', value: 'USB-C with USB 3 speeds' },
        { name: 'Security', value: 'Face ID' },
      ],
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      ],
      basePrice: 134900,
      originalPrice: 159900,
      discountPercentage: 15,
      rating: 4.9,
      reviewCount: 420,
      hasVariants: true,
      isFeatured: true,
      isTrending: true,
      salesCount: 185,
    });

    const p4Variants = [
      {
        product: p4._id,
        sku: 'APL-IP15PM-256-NAT',
        title: 'Apple iPhone 15 Pro Max - Natural Titanium / 256GB',
        attributes: { Colour: 'Natural Titanium', Storage: '256GB' },
        price: 134900,
        originalPrice: 159900,
        stock: 12,
        isAvailable: true,
      },
      {
        product: p4._id,
        sku: 'APL-IP15PM-512-NAT',
        title: 'Apple iPhone 15 Pro Max - Natural Titanium / 512GB',
        attributes: { Colour: 'Natural Titanium', Storage: '512GB' },
        price: 154900,
        originalPrice: 179900,
        stock: 5,
        isAvailable: true,
      },
      {
        product: p4._id,
        sku: 'APL-IP15PM-256-BLK',
        title: 'Apple iPhone 15 Pro Max - Black Titanium / 256GB',
        attributes: { Colour: 'Black Titanium', Storage: '256GB' },
        price: 134900,
        originalPrice: 159900,
        stock: 9,
        isAvailable: true,
      },
    ];

    for (const v of p4Variants) {
      const varDoc = await ProductVariant.create(v);
      await Inventory.create({
        product: p4._id,
        variant: varDoc._id,
        sku: varDoc.sku,
        currentStock: varDoc.stock,
        reservedStock: 0,
        lowStockThreshold: 3,
      });
    }

    // Product 5: Apple 20W USB-C Fast Charger (Bought with iPhone)
    const p5 = await Product.create({
      title: 'Apple 20W USB-C Power Adapter Fast Charging',
      slug: 'apple-20w-usb-c-power-adapter',
      brand: 'Apple',
      category: catElectronics._id,
      description:
        'The Apple 20W USB-C Power Adapter offers fast, efficient charging at home, in the office, or on the go. Compatible with all USB-C-enabled devices.',
      highlights: ['20-watt power delivery', 'Compact travel-ready size', 'Official Apple warranty'],
      specifications: [
        { name: 'Wattage', value: '20W' },
        { name: 'Port', value: 'USB-C' },
      ],
      images: [
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
      ],
      basePrice: 1699,
      originalPrice: 1900,
      discountPercentage: 11,
      rating: 4.8,
      reviewCount: 310,
      hasVariants: false,
      salesCount: 650,
    });
    await Inventory.create({
      product: p5._id,
      sku: 'APL-CHRG-20W',
      currentStock: 80,
      reservedStock: 0,
      lowStockThreshold: 10,
    });

    await ProductRelation.create({
      productA: p4._id,
      productB: p5._id,
      relationType: 'FREQUENTLY_BOUGHT_TOGETHER',
      strength: 20,
    });

    // Product 6: Sony WH-1000XM5 Wireless Headphones
    const p6 = await Product.create({
      title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
      slug: 'sony-wh-1000xm5-wireless-headphones',
      brand: 'Sony',
      category: catElectronics._id,
      subcategory: subAudio._id,
      description:
        'Industry leading noise cancellation with two processors and 8 microphones. Magnificent Sound, engineered to perfection with the new Integrated Processor V1.',
      highlights: [
        'Industry-leading noise canceling with Auto NC Optimizer',
        'Crystal clear hands-free calling with 4 beamforming microphones',
        'Up to 30-hour battery life with quick charging (3 min for 3 hours playback)',
        'Multipoint connection allows switching between devices',
      ],
      specifications: [
        { name: 'Battery Life', value: '30 Hours' },
        { name: 'Bluetooth', value: 'Version 5.2' },
        { name: 'Weight', value: '250 grams' },
      ],
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80',
      ],
      basePrice: 26990,
      originalPrice: 34990,
      discountPercentage: 23,
      rating: 4.8,
      reviewCount: 290,
      hasVariants: true,
      isFeatured: true,
      salesCount: 210,
    });

    const p6Variants = [
      {
        product: p6._id,
        sku: 'SNY-XM5-BLK',
        title: 'Sony WH-1000XM5 - Midnight Black',
        attributes: { Colour: 'Midnight Black' },
        price: 26990,
        originalPrice: 34990,
        stock: 18,
        isAvailable: true,
      },
      {
        product: p6._id,
        sku: 'SNY-XM5-SLV',
        title: 'Sony WH-1000XM5 - Silver Platinum',
        attributes: { Colour: 'Silver Platinum' },
        price: 26990,
        originalPrice: 34990,
        stock: 10,
        isAvailable: true,
      },
    ];

    for (const v of p6Variants) {
      const varDoc = await ProductVariant.create(v);
      await Inventory.create({
        product: p6._id,
        variant: varDoc._id,
        sku: varDoc.sku,
        currentStock: varDoc.stock,
        reservedStock: 0,
        lowStockThreshold: 4,
      });
    }

    // Product 7: Nike Air Zoom Pegasus 40 Running Shoes
    const p7 = await Product.create({
      title: 'Nike Air Zoom Pegasus 40 Men Road Running Shoes',
      slug: 'nike-air-zoom-pegasus-40-running-shoes',
      brand: 'Nike',
      category: catFootwear._id,
      description:
        'A springy ride for any run, the Peg’s familiar, just-for-you feel returns to help you accomplish your goals. This milestone edition has the same responsiveness you love, but with better comfort in sensitive areas.',
      highlights: [
        'Nike React technology provides a smooth, responsive ride',
        '2 Zoom Air units (one at the forefoot and the heel)',
        'Engineered circular pattern mesh upper breathes comfortably',
        'Waffle-inspired outsole provides traction on roads',
      ],
      specifications: [
        { name: 'Shoe Type', value: 'Neutral Cushioning Road Running' },
        { name: 'Heel-to-Toe Drop', value: '10mm' },
        { name: 'Closure', value: 'Lace-Up' },
      ],
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80',
      ],
      basePrice: 8495,
      originalPrice: 11895,
      discountPercentage: 28,
      rating: 4.7,
      reviewCount: 165,
      hasVariants: true,
      isFeatured: true,
      isBestSeller: true,
      salesCount: 280,
    });

    const p7Variants = [
      {
        product: p7._id,
        sku: 'NK-PEG40-RED-UK8',
        title: 'Nike Air Zoom Pegasus 40 - Red Flare / UK 8',
        attributes: { Colour: 'Red Flare', 'Shoe Size': 'UK 8' },
        price: 8495,
        originalPrice: 11895,
        stock: 14,
        isAvailable: true,
      },
      {
        product: p7._id,
        sku: 'NK-PEG40-RED-UK9',
        title: 'Nike Air Zoom Pegasus 40 - Red Flare / UK 9',
        attributes: { Colour: 'Red Flare', 'Shoe Size': 'UK 9' },
        price: 8495,
        originalPrice: 11895,
        stock: 12,
        isAvailable: true,
      },
      {
        product: p7._id,
        sku: 'NK-PEG40-BLK-UK8',
        title: 'Nike Air Zoom Pegasus 40 - Triple Black / UK 8',
        attributes: { Colour: 'Triple Black', 'Shoe Size': 'UK 8' },
        price: 8495,
        originalPrice: 11895,
        stock: 8,
        isAvailable: true,
      },
    ];

    for (const v of p7Variants) {
      const varDoc = await ProductVariant.create(v);
      await Inventory.create({
        product: p7._id,
        variant: varDoc._id,
        sku: varDoc.sku,
        currentStock: varDoc.stock,
        reservedStock: 0,
        lowStockThreshold: 4,
      });
    }

    // Product 8: Instant Pot Duo 7-in-1 Electric Pressure Cooker
    const p8 = await Product.create({
      title: 'Instant Pot Duo 7-in-1 Smart Electric Pressure Cooker 5.7 Litre',
      slug: 'instant-pot-duo-7-in-1-electric-pressure-cooker',
      brand: 'Instant Pot',
      category: catHomeKitchen._id,
      description:
        'Easy to use, easy to clean, fast, versatile, and convenient. Replaces 7 kitchen appliances: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker & food warmer.',
      highlights: [
        '13 one-touch customizable smart programs',
        'Cooks delicious meals up to 70% faster',
        'Fingerprint-resistant stainless steel sides and dishwasher-safe components',
        '10+ proven safety features including Overheat Protection',
      ],
      specifications: [
        { name: 'Capacity', value: '5.7 Litres' },
        { name: 'Wattage', value: '1000 Watts' },
        { name: 'Material', value: 'Stainless Steel Inner Pot' },
      ],
      images: [
        'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80',
      ],
      basePrice: 7999,
      originalPrice: 10999,
      discountPercentage: 27,
      rating: 4.8,
      reviewCount: 210,
      hasVariants: false,
      isFeatured: true,
      salesCount: 190,
    });
    await Inventory.create({
      product: p8._id,
      sku: 'INST-POT-57L',
      currentStock: 16,
      reservedStock: 0,
      lowStockThreshold: 4,
    });

    // Product 9: Tata Tea Gold Leaf Tea 1kg
    const p9 = await Product.create({
      title: 'Tata Tea Gold Premium Assam CTC Tea Leaves with Gently Rolled Long Leaves 1kg',
      slug: 'tata-tea-gold-leaf-tea-1kg',
      brand: 'Tata Tea',
      category: catGrocery._id,
      description:
        'A blend of rich Assam CTC teas with 15% gently rolled long leaves to give you an exquisite rich aroma and unforgettable taste.',
      highlights: [
        'Exquisite blend of rich taste with irresistible aroma',
        'Specially crafted by Tata Tea master blenders',
        'Sealed for long-lasting fresh aroma',
      ],
      specifications: [
        { name: 'Dietary Type', value: 'Vegetarian' },
        { name: 'Net Quantity', value: '1000g' },
      ],
      images: [
        'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80',
      ],
      basePrice: 519,
      originalPrice: 620,
      discountPercentage: 16,
      rating: 4.6,
      reviewCount: 540,
      hasVariants: false,
      salesCount: 890,
      isBestSeller: true,
    });
    await Inventory.create({
      product: p9._id,
      sku: 'TATA-TEA-1KG',
      currentStock: 95,
      reservedStock: 0,
      lowStockThreshold: 10,
    });

    // Product 10: Organic Raw Honey
    const p10 = await Product.create({
      title: 'Dabur 100% Pure & Organic Forest Raw Honey 500g',
      slug: 'dabur-pure-organic-forest-raw-honey-500g',
      brand: 'Dabur',
      category: catGrocery._id,
      description:
        '100% pure raw honey sourced from pristine forests with zero added sugar and rich in natural antioxidants.',
      highlights: ['No adulteration, NMR tested', 'Rich in natural immunity boosters', 'Rich golden color and pure taste'],
      specifications: [{ name: 'Weight', value: '500g' }],
      images: [
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80',
      ],
      basePrice: 249,
      originalPrice: 320,
      discountPercentage: 22,
      rating: 4.7,
      reviewCount: 320,
      hasVariants: false,
      salesCount: 610,
    });
    await Inventory.create({
      product: p10._id,
      sku: 'DAB-HNY-500G',
      currentStock: 75,
      reservedStock: 0,
      lowStockThreshold: 10,
    });

    // Additional 22 catalog products to reach 32+ realistic products across all categories
    const additionalProductsData = [
      {
        title: 'MacBook Air 15-inch M3 Chip (16GB Unified Memory, 512GB SSD)',
        slug: 'macbook-air-15-inch-m3-chip-512gb',
        brand: 'Apple',
        category: catElectronics._id,
        subcategory: subLaptops._id,
        description: 'Strikingly thin and fast MacBook Air with Liquid Retina display, MagSafe charging, and 18-hour battery life.',
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'],
        basePrice: 134990,
        originalPrice: 144900,
        discountPercentage: 7,
        rating: 4.9,
        reviewCount: 88,
        isFeatured: true,
        salesCount: 120,
      },
      {
        title: 'Dell XPS 13 Intel Core Ultra 7 (32GB RAM, 1TB NVMe SSD)',
        slug: 'dell-xps-13-intel-core-ultra-7',
        brand: 'Dell',
        category: catElectronics._id,
        subcategory: subLaptops._id,
        description: 'Iconic minimal design with seamless glass touchpad and InfinityEdge 3K OLED touch display.',
        images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80'],
        basePrice: 149990,
        originalPrice: 169990,
        discountPercentage: 11,
        rating: 4.6,
        reviewCount: 45,
        salesCount: 75,
      },
      {
        title: 'Samsung Galaxy S24 Ultra 5G AI Smartphone 256GB Titanium Gray',
        slug: 'samsung-galaxy-s24-ultra-5g-256gb',
        brand: 'Samsung',
        category: catElectronics._id,
        subcategory: subSmartphones._id,
        description: 'Galaxy AI is here. Epic camera with 200MP sensor, built-in S Pen, and titanium shielding.',
        images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80'],
        basePrice: 119999,
        originalPrice: 134999,
        discountPercentage: 11,
        rating: 4.8,
        reviewCount: 195,
        isTrending: true,
        salesCount: 230,
      },
      {
        title: 'Bose QuietComfort 45 Wireless Bluetooth Noise Cancelling Headphones',
        slug: 'bose-quietcomfort-45-wireless-headphones',
        brand: 'Bose',
        category: catElectronics._id,
        subcategory: subAudio._id,
        description: 'Iconic quiet, comfort, and sound. TriPort acoustic architecture delivers deep, full sound.',
        images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'],
        basePrice: 21900,
        originalPrice: 29900,
        discountPercentage: 27,
        rating: 4.7,
        reviewCount: 155,
        salesCount: 180,
      },
      {
        title: 'Levi’s Men 511 Slim Fit Stretch Denim Jeans (Dark Indigo)',
        slug: 'levis-men-511-slim-fit-jeans',
        brand: 'Levi’s',
        category: catFashion._id,
        subcategory: subMenFashion._id,
        description: 'A modern slim with room to move, the 511 Slim Fit Jeans are a classic since right now.',
        images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80'],
        basePrice: 2499,
        originalPrice: 3999,
        discountPercentage: 38,
        rating: 4.5,
        reviewCount: 220,
        isBestSeller: true,
        salesCount: 410,
      },
      {
        title: 'Zara Floral Embroidered Summer Midi Dress for Women',
        slug: 'zara-floral-embroidered-midi-dress',
        brand: 'Zara',
        category: catFashion._id,
        subcategory: subWomenFashion._id,
        description: 'V-neck dress featuring delicate embroidery, tied belt at the waist, and flared hem.',
        images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80'],
        basePrice: 3290,
        originalPrice: 4990,
        discountPercentage: 34,
        rating: 4.7,
        reviewCount: 84,
        isTrending: true,
        salesCount: 195,
      },
      {
        title: 'Puma Men Casual Fleece Hooded Sweatshirt (Puma Black)',
        slug: 'puma-men-fleece-hooded-sweatshirt',
        brand: 'Puma',
        category: catFashion._id,
        subcategory: subMenFashion._id,
        description: 'Warm, cozy cotton fleece hoodie with kangaroo pocket and bold Puma cat logo print.',
        images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80'],
        basePrice: 1799,
        originalPrice: 2999,
        discountPercentage: 40,
        rating: 4.4,
        reviewCount: 110,
        salesCount: 320,
      },
      {
        title: 'The Ordinary Niacinamide 10% + Zinc 1% Blemish Serum 30ml',
        slug: 'the-ordinary-niacinamide-10-zinc-1-serum',
        brand: 'The Ordinary',
        category: catBeauty._id,
        description: 'High-strength vitamin and mineral blemish formula to reduce the look of blemishes and brighten tone.',
        images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80'],
        basePrice: 600,
        originalPrice: 750,
        discountPercentage: 20,
        rating: 4.7,
        reviewCount: 650,
        isBestSeller: true,
        salesCount: 1120,
      },
      {
        title: 'CeraVe Hydrating Facial Cleanser for Normal to Dry Skin 236ml',
        slug: 'cerave-hydrating-facial-cleanser-236ml',
        brand: 'CeraVe',
        category: catBeauty._id,
        description: 'Gentle cleanser with 3 essential ceramides and hyaluronic acid to cleanse without stripping moisture.',
        images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80'],
        basePrice: 1150,
        originalPrice: 1400,
        discountPercentage: 18,
        rating: 4.8,
        reviewCount: 410,
        salesCount: 780,
      },
      {
        title: 'Dior Sauvage Eau De Parfum Luxury Men Spray 100ml',
        slug: 'dior-sauvage-eau-de-parfum-100ml',
        brand: 'Dior',
        category: catBeauty._id,
        description: 'The powerful freshness of Sauvage exudes new sensual and mysterious facets with Calabrian bergamot.',
        images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80'],
        basePrice: 11500,
        originalPrice: 13200,
        discountPercentage: 13,
        rating: 4.9,
        reviewCount: 180,
        isFeatured: true,
        salesCount: 140,
      },
      {
        title: 'Philips Air Fryer HD9200/90 4.1 Litre Rapid Air Technology',
        slug: 'philips-air-fryer-hd9200-4-1l',
        brand: 'Philips',
        category: catHomeKitchen._id,
        description: 'Fry with up to 90% less fat. Rapid Air Technology circulates hot air to cook crispy on the outside, tender on the inside.',
        images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&auto=format&fit=crop&q=80'],
        basePrice: 5999,
        originalPrice: 8995,
        discountPercentage: 33,
        rating: 4.6,
        reviewCount: 380,
        isBestSeller: true,
        salesCount: 650,
      },
      {
        title: 'Prestige Iris 750 Watt Mixer Grinder with 3 Stainless Steel Jars',
        slug: 'prestige-iris-750w-mixer-grinder',
        brand: 'Prestige',
        category: catHomeKitchen._id,
        description: 'Heavy duty 750W motor for grinding hardest ingredients effortlessly with 3 versatile stainless steel jars.',
        images: ['https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&auto=format&fit=crop&q=80'],
        basePrice: 2899,
        originalPrice: 4295,
        discountPercentage: 32,
        rating: 4.4,
        reviewCount: 420,
        salesCount: 580,
      },
      {
        title: 'Decathlon Domyos Hex Dumbbell Set 5kg Pair with Rubber Coating',
        slug: 'decathlon-domyos-hex-dumbbell-5kg-pair',
        brand: 'Domyos',
        category: catSports._id,
        description: 'Ergonomic knurled chrome handle with durable rubber hexagon ends to prevent rolling on gym floors.',
        images: ['https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=800&auto=format&fit=crop&q=80'],
        basePrice: 1899,
        originalPrice: 2499,
        discountPercentage: 24,
        rating: 4.8,
        reviewCount: 130,
        salesCount: 270,
      },
      {
        title: 'MuscleBlaze Creatine Monohydrate CreAMP Powder 250g (83 Servings)',
        slug: 'muscleblaze-creatine-monohydrate-250g',
        brand: 'MuscleBlaze',
        category: catSports._id,
        subcategory: subSupplements._id,
        description: 'Micro-pure creatine monohydrate enhances muscle strength, power output, and accelerates lean muscle mass.',
        images: ['https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=800&auto=format&fit=crop&q=80'],
        basePrice: 849,
        originalPrice: 1199,
        discountPercentage: 29,
        rating: 4.7,
        reviewCount: 340,
        salesCount: 510,
      },
      {
        title: 'Adidas Men Ultraboost Light Running Shoes Core Black',
        slug: 'adidas-ultraboost-light-running-shoes',
        brand: 'Adidas',
        category: catFootwear._id,
        description: 'Experience epic energy return with the lightest Ultraboost ever made, engineered with Light BOOST cushioning.',
        images: ['https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80'],
        basePrice: 11999,
        originalPrice: 18999,
        discountPercentage: 37,
        rating: 4.8,
        reviewCount: 145,
        isTrending: true,
        salesCount: 220,
      },
      {
        title: 'Fossil Grant Chronograph Navy Blue Leather Watch for Men',
        slug: 'fossil-grant-chronograph-leather-watch',
        brand: 'Fossil',
        category: catAccessories._id,
        description: 'Vintage inspired chronograph watch with roman numeral markers and genuine navy blue leather strap.',
        images: ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80'],
        basePrice: 8995,
        originalPrice: 13495,
        discountPercentage: 33,
        rating: 4.6,
        reviewCount: 98,
        isFeatured: true,
        salesCount: 160,
      },
      {
        title: 'Ray-Ban Aviator Classic Polarized Sunglasses (Gold Frame / Green Lens)',
        slug: 'ray-ban-aviator-classic-polarized-sunglasses',
        brand: 'Ray-Ban',
        category: catAccessories._id,
        description: 'The original timeless aviator look with crystal green G-15 polarized lenses for optimal visual clarity.',
        images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80'],
        basePrice: 9490,
        originalPrice: 11590,
        discountPercentage: 18,
        rating: 4.8,
        reviewCount: 120,
        salesCount: 190,
      },
      {
        title: 'Atomic Habits by James Clear (Hardcover International Edition)',
        slug: 'atomic-habits-james-clear-hardcover',
        brand: 'Penguin Random House',
        category: catBooks._id,
        description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. Over 15 million copies sold worldwide.',
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'],
        basePrice: 599,
        originalPrice: 799,
        discountPercentage: 25,
        rating: 4.9,
        reviewCount: 1420,
        isBestSeller: true,
        salesCount: 2400,
      },
      {
        title: 'The Psychology of Money by Morgan Housel Paperback',
        slug: 'the-psychology-of-money-morgan-housel',
        brand: 'Harriman House',
        category: catBooks._id,
        description: 'Timeless lessons on wealth, greed, and happiness doing well with money isn’t necessarily about what you know.',
        images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop&q=80'],
        basePrice: 349,
        originalPrice: 499,
        discountPercentage: 30,
        rating: 4.8,
        reviewCount: 980,
        salesCount: 1850,
      },
      {
        title: 'Fortune Sunlite Refined Sunflower Oil 5 Litre Can',
        slug: 'fortune-sunlite-sunflower-oil-5l',
        brand: 'Fortune',
        category: catGrocery._id,
        description: 'Enriched with Vitamin A and Vitamin D, light and healthy cooking oil suitable for all deep and shallow frying.',
        images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80'],
        basePrice: 749,
        originalPrice: 890,
        discountPercentage: 16,
        rating: 4.6,
        reviewCount: 310,
        salesCount: 740,
      },
      {
        title: 'Nestle Maggi 2-Minute Instant Masala Noodles 840g Pack of 12',
        slug: 'maggi-instant-noodles-pack-of-12',
        brand: 'Maggi',
        category: catGrocery._id,
        description: 'Favorite Indian instant noodles enriched with Iron and authentic blend of 10 spices and herbs.',
        images: ['https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800&auto=format&fit=crop&q=80'],
        basePrice: 156,
        originalPrice: 180,
        discountPercentage: 13,
        rating: 4.7,
        reviewCount: 880,
        isBestSeller: true,
        salesCount: 1900,
      },
      {
        title: 'Wildcraft 45L Unisex Rucksack Backpack with Rain Cover',
        slug: 'wildcraft-45l-rucksack-backpack',
        brand: 'Wildcraft',
        category: catAccessories._id,
        description: 'Engineered for mountain hiking and long backpacking trips with ergonomic padded straps and durable water-resistant fabric.',
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'],
        basePrice: 2499,
        originalPrice: 3999,
        discountPercentage: 38,
        rating: 4.6,
        reviewCount: 135,
        salesCount: 260,
      },
    ];

    for (const item of additionalProductsData) {
      const prod = await Product.create({
        ...item,
        status: 'AVAILABLE',
      });
      await Inventory.create({
        product: prod._id,
        sku: `PROD-${prod.slug.slice(0, 8).toUpperCase()}`,
        currentStock: Math.floor(15 + Math.random() * 40),
        reservedStock: 0,
        lowStockThreshold: 5,
      });
    }

    // 8. Create Active Coupons
    console.log('[Seed]: Creating Coupons...');
    await Coupon.create([
      {
        code: 'WELCOME10',
        description: '10% instant discount for new customers on all orders over ₹499',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 499,
        maxDiscountAmount: 500,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        usageLimit: 5000,
        perUserLimit: 1,
        isActive: true,
      },
      {
        code: 'EASYBUY500',
        description: 'Flat ₹500 discount on orders above ₹2,999',
        discountType: 'FIXED',
        discountValue: 500,
        minOrderValue: 2999,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        usageLimit: 2000,
        perUserLimit: 2,
        isActive: true,
      },
      {
        code: 'SUPERDEAL20',
        description: 'Flat 20% Mega Savings discount up to ₹1,000 on cart above ₹1,999',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderValue: 1999,
        maxDiscountAmount: 1000,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        usageLimit: 3000,
        perUserLimit: 1,
        isActive: true,
      },
    ]);

    // 9. Create Sample Customer Orders and Shipments
    console.log('[Seed]: Creating Sample Orders & Shipments...');
    const order1 = await Order.create({
      orderNumber: 'EB-202611-1001',
      user: customer1._id,
      items: [
        {
          product: p1._id,
          title: p1.title,
          brand: p1.brand,
          sku: 'NK-TSH-BLK-M',
          selectedAttributes: { Colour: 'Black', Size: 'M' },
          image: p1.images[0],
          unitPrice: 999,
          quantity: 1,
          subtotal: 999,
        },
        {
          product: p3._id,
          title: p3.title,
          brand: p3.brand,
          sku: 'BLND-SHK-828ML',
          image: p3.images[0],
          unitPrice: 599,
          quantity: 1,
          subtotal: 599,
        },
      ],
      addressSnapshot: {
        fullName: addr1.fullName,
        phoneNumber: addr1.phoneNumber,
        houseBuilding: addr1.houseBuilding,
        street: addr1.street,
        locality: addr1.locality,
        landmark: addr1.landmark,
        city: addr1.city,
        state: addr1.state,
        pincode: addr1.pincode,
        addressType: addr1.addressType,
      },
      paymentMethod: 'COD',
      paymentStatus: 'PAID',
      subtotal: 1598,
      discount: 159.8,
      deliveryCharge: 0,
      totalAmount: 1438.2,
      appliedCoupon: {
        code: 'WELCOME10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        discountAmount: 159.8,
      },
      orderStatus: 'Delivered',
      deliveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      statusHistory: [
        { status: 'Confirmed', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), comment: 'Order placed' },
        { status: 'Processing', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), comment: 'Dispatched to fulfillment center' },
        { status: 'Packed', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), comment: 'Order packed in tamper-proof bag' },
        { status: 'Shipped', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), comment: 'Handed over to BlueDart courier' },
        { status: 'Out for Delivery', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), comment: 'Out with delivery agent' },
        { status: 'Delivered', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), comment: 'Handed to customer. Signed.' },
      ],
      trackingInfo: {
        shippingCompany: 'BlueDart Express',
        trackingId: 'BD-847291039',
        trackingUrl: 'https://www.bluedart.com',
      },
    });

    const shipment1 = await Shipment.create({
      order: order1._id,
      orderNumber: order1.orderNumber,
      shippingCompany: 'BlueDart Express',
      trackingId: 'BD-847291039',
      trackingUrl: 'https://www.bluedart.com',
      status: 'DELIVERED',
      shipmentDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      statusUpdates: [
        { status: 'LABEL_CREATED', location: 'Bengaluru Hub', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { status: 'IN_TRANSIT', location: 'Kolkata Sorting Center', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
        { status: 'OUT_FOR_DELIVERY', location: 'Asansol Hub', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { status: 'DELIVERED', location: 'Asansol Hub', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      ],
    });

    order1.shipment = shipment1._id;
    await order1.save();

    // Order 2: In-Transit Order
    const order2 = await Order.create({
      orderNumber: 'EB-202611-1002',
      user: customer1._id,
      items: [
        {
          product: p2._id,
          title: p2.title,
          brand: p2.brand,
          sku: 'ON-WHEY-CHOC-2KG',
          selectedAttributes: { Flavour: 'Double Rich Chocolate', Weight: '2 kg' },
          image: p2.images[0],
          unitPrice: 6199,
          quantity: 1,
          subtotal: 6199,
        },
      ],
      addressSnapshot: {
        fullName: addr1.fullName,
        phoneNumber: addr1.phoneNumber,
        houseBuilding: addr1.houseBuilding,
        street: addr1.street,
        locality: addr1.locality,
        landmark: addr1.landmark,
        city: addr1.city,
        state: addr1.state,
        pincode: addr1.pincode,
        addressType: addr1.addressType,
      },
      paymentMethod: 'COD',
      paymentStatus: 'PAID',
      subtotal: 6199,
      discount: 500,
      deliveryCharge: 0,
      totalAmount: 5699,
      appliedCoupon: {
        code: 'EASYBUY500',
        discountType: 'FIXED',
        discountValue: 500,
        discountAmount: 500,
      },
      orderStatus: 'Shipped',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      statusHistory: [
        { status: 'Confirmed', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), comment: 'Order confirmed with Cash on Delivery' },
        { status: 'Processing', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), comment: 'Preparing package' },
        { status: 'Packed', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), comment: 'Ready at dispatch hub' },
        { status: 'Shipped', timestamp: new Date(), comment: 'In transit to local hub' },
      ],
      trackingInfo: {
        shippingCompany: 'Delhivery',
        trackingId: 'DEL-928174102',
        trackingUrl: 'https://www.delhivery.com',
      },
    });

    const shipment2 = await Shipment.create({
      order: order2._id,
      orderNumber: order2.orderNumber,
      shippingCompany: 'Delhivery',
      trackingId: 'DEL-928174102',
      trackingUrl: 'https://www.delhivery.com',
      status: 'IN_TRANSIT',
      shipmentDate: new Date(),
      statusUpdates: [
        { status: 'LABEL_CREATED', location: 'Delhi Fulfillment Center', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        { status: 'IN_TRANSIT', location: 'Asansol Hub Transit', timestamp: new Date() },
      ],
    });

    order2.shipment = shipment2._id;
    await order2.save();

    // 10. Create Verified Reviews
    console.log('[Seed]: Creating Verified Customer Reviews...');
    await Review.create([
      {
        product: p1._id,
        user: customer1._id,
        rating: 5,
        title: 'Outstanding quality and very breathable!',
        comment: 'I bought the medium size in Black. The fit is perfect for workouts. Sweat evaporates super fast and stitching is top notch.',
        isVerifiedPurchase: true,
      },
      {
        product: p2._id,
        user: customer1._id,
        rating: 5,
        title: 'The authentic Gold Standard! Great chocolate flavor',
        comment: 'Mixes instantly with just a spoon in water or milk. No bloating and genuine authenticity code verified.',
        isVerifiedPurchase: true,
      },
      {
        product: p3._id,
        user: customer1._id,
        rating: 4,
        title: 'Leak proof and durable',
        comment: 'Does not leak at all. The blender wire ball works wonders for thick shakes.',
        isVerifiedPurchase: true,
      },
    ]);

    // 11. Create Sample Notifications
    console.log('[Seed]: Creating Notifications...');
    await Notification.create([
      {
        user: customer1._id,
        title: 'Package Shipped! 🚚',
        message: 'Your order #EB-202611-1002 has been dispatched via Delhivery (Tracking: DEL-928174102).',
        type: 'ORDER',
        link: `/orders/${order2._id}`,
        isRead: false,
      },
      {
        user: customer1._id,
        title: 'Order Delivered! 🎉',
        message: 'Your order #EB-202611-1001 was delivered successfully. Enjoy your purchase!',
        type: 'DELIVERY',
        link: `/orders/${order1._id}`,
        isRead: true,
      },
    ]);

    console.log('==================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('👤 Admin Credentials:');
    console.log('   Email: admin@gmail.com');
    console.log('   Password: 123456');
    console.log('👤 Customer Credentials:');
    console.log('   Email: customer@gmail.com');
    console.log('   Password: password123');
    console.log('📦 Total Products Seeded: 32+');
    console.log('==================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();

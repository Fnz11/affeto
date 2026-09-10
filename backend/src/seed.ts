export async function seedData(strapi: any) {
  strapi.log.info('Seeding Affeto E-Commerce Catalog...');

  // 1. Categories
  const categoryData = [
    { name: 'Apparel', slug: 'apparel', description: 'Essential modern wardrobe pieces' },
    { name: 'Tops', slug: 'tops', description: 'Shirts, sweaters, and t-shirts' },
    { name: 'Bottoms', slug: 'bottoms', description: 'Denim, trousers, and chinos' },
    { name: 'Outerwear', slug: 'outerwear', description: 'Jackets, coats, and overshirts' },
    { name: 'Footwear', slug: 'footwear', description: 'Handcrafted leather boots and shoes' },
    { name: 'Accessories', slug: 'accessories', description: 'Bags, scarves, and daily essentials' },
  ];

  const categoryMap: Record<string, any> = {};
  for (const cat of categoryData) {
    const existing = await strapi.db.query('api::category.category').findOne({ where: { slug: cat.slug } });
    if (!existing) {
      const created = await strapi.entityService.create('api::category.category', {
        data: cat,
      });
      categoryMap[cat.slug] = created;
    } else {
      categoryMap[cat.slug] = existing;
    }
  }

  // 2. Discount Codes
  const discountCodes = [
    {
      code: 'WELCOME10',
      discountType: 'percent',
      value: 10,
      minOrderAmount: 0,
      maxUses: 1000,
      isActive: true,
    },
    {
      code: 'AFFETO20',
      discountType: 'percent',
      value: 20,
      minOrderAmount: 10000, // $100 min
      maxUses: 500,
      isActive: true,
    },
    {
      code: 'FLAT15',
      discountType: 'flat',
      value: 1500, // $15 off
      minOrderAmount: 5000, // $50 min
      maxUses: 500,
      isActive: true,
    },
  ];

  for (const disc of discountCodes) {
    const existing = await strapi.db.query('api::discount-code.discount-code').findOne({ where: { code: disc.code } });
    if (!existing) {
      await strapi.entityService.create('api::discount-code.discount-code', { data: disc });
    }
  }

  // 3. Products with Variants, Prices & Inventory
  const products = [
    {
      name: 'Minimalist Linen Shirt',
      slug: 'minimalist-linen-shirt',
      description: 'Cut from pure French linen, this relaxed-fit shirt is pre-washed for extra softness and an effortless drape. Features mother-of-pearl buttons and a classic band collar.',
      category: categoryMap['tops']?.id || categoryMap['apparel']?.id,
      isFeatured: true,
      isNewArrival: true,
      images: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80',
      ],
      features: ['100% French Flax Linen', 'Mother-of-pearl buttons', 'Pre-washed for soft feel', 'Relaxed tailored fit'],
      seoTitle: 'Minimalist Linen Shirt — Affeto',
      seoDescription: 'Premium French linen button-up shirt in versatile neutral tones.',
      variants: [
        { title: 'White / S', sku: 'MLS-WHT-S', size: 'S', color: 'White', colorHex: '#FFFFFF', prices: { USD: 8900, EUR: 8200, GBP: 7000 }, stock: 15 },
        { title: 'White / M', sku: 'MLS-WHT-M', size: 'M', color: 'White', colorHex: '#FFFFFF', prices: { USD: 8900, EUR: 8200, GBP: 7000 }, stock: 25 },
        { title: 'White / L', sku: 'MLS-WHT-L', size: 'L', color: 'White', colorHex: '#FFFFFF', prices: { USD: 8900, EUR: 8200, GBP: 7000 }, stock: 20 },
        { title: 'Olive / S', sku: 'MLS-OLV-S', size: 'S', color: 'Olive', colorHex: '#556B2F', prices: { USD: 8900, EUR: 8200, GBP: 7000 }, stock: 10 },
        { title: 'Olive / M', sku: 'MLS-OLV-M', size: 'M', color: 'Olive', colorHex: '#556B2F', prices: { USD: 8900, EUR: 8200, GBP: 7000 }, stock: 18 },
        { title: 'Olive / L', sku: 'MLS-OLV-L', size: 'L', color: 'Olive', colorHex: '#556B2F', prices: { USD: 8900, EUR: 8200, GBP: 7000 }, stock: 14 },
      ],
    },
    {
      name: 'Merino Wool Crewneck Sweater',
      slug: 'merino-wool-crewneck-sweater',
      description: 'Spun from 100% ultra-fine Australian Merino wool. Temperature regulating, naturally odor-resistant, and extraordinarily soft against the skin.',
      category: categoryMap['tops']?.id || categoryMap['apparel']?.id,
      isFeatured: true,
      isNewArrival: false,
      images: [
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=1000&q=80',
      ],
      features: ['100% Extra-Fine Merino Wool', 'Ribbed cuffs and hem', 'Naturally temperature-regulating', 'Dry clean or gentle hand wash'],
      seoTitle: 'Merino Wool Crewneck Sweater — Affeto',
      seoDescription: 'Ultra-fine merino knit sweater crafted for timeless layering.',
      variants: [
        { title: 'Charcoal / S', sku: 'MWS-CHR-S', size: 'S', color: 'Charcoal', colorHex: '#36454F', prices: { USD: 13500, EUR: 12500, GBP: 10800 }, stock: 12 },
        { title: 'Charcoal / M', sku: 'MWS-CHR-M', size: 'M', color: 'Charcoal', colorHex: '#36454F', prices: { USD: 13500, EUR: 12500, GBP: 10800 }, stock: 22 },
        { title: 'Charcoal / L', sku: 'MWS-CHR-L', size: 'L', color: 'Charcoal', colorHex: '#36454F', prices: { USD: 13500, EUR: 12500, GBP: 10800 }, stock: 15 },
        { title: 'Oatmeal / M', sku: 'MWS-OAT-M', size: 'M', color: 'Oatmeal', colorHex: '#E3DAC9', prices: { USD: 13500, EUR: 12500, GBP: 10800 }, stock: 20 },
        { title: 'Oatmeal / L', sku: 'MWS-OAT-L', size: 'L', color: 'Oatmeal', colorHex: '#E3DAC9', prices: { USD: 13500, EUR: 12500, GBP: 10800 }, stock: 16 },
      ],
    },
    {
      name: 'Japanese Selvedge Denim Jeans',
      slug: 'japanese-selvedge-denim-jeans',
      description: 'Woven on vintage shuttle looms in Okayama, Japan. 14oz red-line selvedge denim that shapes to your body and develops unique personal fades over time.',
      category: categoryMap['bottoms']?.id || categoryMap['apparel']?.id,
      isFeatured: true,
      isNewArrival: false,
      images: [
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=80',
      ],
      features: ['14oz Japanese Kurabo Selvedge', 'Red-line edge detail', 'Custom brass hardware', 'Slim straight fit'],
      seoTitle: 'Japanese Selvedge Denim Jeans — Affeto',
      seoDescription: 'Authentic Okayama selvedge denim with classic 5-pocket construction.',
      variants: [
        { title: 'Raw Indigo / 30', sku: 'JSD-IND-30', size: '30', color: 'Raw Indigo', colorHex: '#1A2A44', prices: { USD: 16800, EUR: 15500, GBP: 13400 }, stock: 8 },
        { title: 'Raw Indigo / 32', sku: 'JSD-IND-32', size: '32', color: 'Raw Indigo', colorHex: '#1A2A44', prices: { USD: 16800, EUR: 15500, GBP: 13400 }, stock: 16 },
        { title: 'Raw Indigo / 34', sku: 'JSD-IND-34', size: '34', color: 'Raw Indigo', colorHex: '#1A2A44', prices: { USD: 16800, EUR: 15500, GBP: 13400 }, stock: 14 },
        { title: 'Washed Black / 32', sku: 'JSD-BLK-32', size: '32', color: 'Washed Black', colorHex: '#2B2B2B', prices: { USD: 16800, EUR: 15500, GBP: 13400 }, stock: 12 },
        { title: 'Washed Black / 34', sku: 'JSD-BLK-34', size: '34', color: 'Washed Black', colorHex: '#2B2B2B', prices: { USD: 16800, EUR: 15500, GBP: 13400 }, stock: 10 },
      ],
    },
    {
      name: 'Relaxed Chino Trousers',
      slug: 'relaxed-chino-trousers',
      description: 'Crafted from a sturdy 8.5oz organic cotton twill with a touch of stretch for day-long comfort. Relaxed through the thigh with a clean, slight taper.',
      category: categoryMap['bottoms']?.id || categoryMap['apparel']?.id,
      isFeatured: false,
      isNewArrival: true,
      images: [
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1000&q=80',
      ],
      features: ['98% Organic Cotton, 2% Elastane', 'Corozo nut buttons', 'Deep slant pockets', 'Garment dyed'],
      seoTitle: 'Relaxed Chino Trousers — Affeto',
      seoDescription: 'Versatile organic cotton twill trousers tailored for modern daily wear.',
      variants: [
        { title: 'Khaki / 30', sku: 'RCT-KHK-30', size: '30', color: 'Khaki', colorHex: '#C3B091', prices: { USD: 9800, EUR: 9000, GBP: 7800 }, stock: 15 },
        { title: 'Khaki / 32', sku: 'RCT-KHK-32', size: '32', color: 'Khaki', colorHex: '#C3B091', prices: { USD: 9800, EUR: 9000, GBP: 7800 }, stock: 25 },
        { title: 'Khaki / 34', sku: 'RCT-KHK-34', size: '34', color: 'Khaki', colorHex: '#C3B091', prices: { USD: 9800, EUR: 9000, GBP: 7800 }, stock: 18 },
        { title: 'Olive / 32', sku: 'RCT-OLV-32', size: '32', color: 'Olive', colorHex: '#556B2F', prices: { USD: 9800, EUR: 9000, GBP: 7800 }, stock: 20 },
      ],
    },
    {
      name: 'Waterproof Canvas Trench Coat',
      slug: 'waterproof-canvas-trench-coat',
      description: 'An architectural outerwear statement built with bonded weather-resistant British cotton canvas. Fully taped seams, horn buttons, and storm flap.',
      category: categoryMap['outerwear']?.id || categoryMap['apparel']?.id,
      isFeatured: true,
      isNewArrival: true,
      images: [
        'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=80',
      ],
      features: ['Bonded waterproof cotton canvas', 'Seam-sealed construction', 'Storm flap and throat latch', 'Deep welt pockets'],
      seoTitle: 'Waterproof Canvas Trench Coat — Affeto',
      seoDescription: 'Uncompromising weather protection and minimalist styling.',
      variants: [
        { title: 'Tan / S', sku: 'WTC-TAN-S', size: 'S', color: 'Tan', colorHex: '#D2B48C', prices: { USD: 28500, EUR: 26000, GBP: 22500 }, stock: 6 },
        { title: 'Tan / M', sku: 'WTC-TAN-M', size: 'M', color: 'Tan', colorHex: '#D2B48C', prices: { USD: 28500, EUR: 26000, GBP: 22500 }, stock: 12 },
        { title: 'Tan / L', sku: 'WTC-TAN-L', size: 'L', color: 'Tan', colorHex: '#D2B48C', prices: { USD: 28500, EUR: 26000, GBP: 22500 }, stock: 8 },
      ],
    },
    {
      name: 'Classic Leather Chelsea Boots',
      slug: 'classic-leather-chelsea-boots',
      description: 'Handcrafted in Tuscany from vegetable-tanned calfskin. Features a Goodyear-welted Vibram rubber sole and durable elastic side gussets.',
      category: categoryMap['footwear']?.id,
      isFeatured: true,
      isNewArrival: false,
      images: [
        'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=1000&q=80',
      ],
      features: ['Full-grain Italian calfskin', 'Goodyear welted construction', 'Vibram rubber outsole', 'Dual pull tabs'],
      seoTitle: 'Classic Leather Chelsea Boots — Affeto',
      seoDescription: 'Artisan Tuscan craftsmanship meets modern silhouette in timeless leather boots.',
      variants: [
        { title: 'Chestnut / 41', sku: 'CCB-BRN-41', size: '41', color: 'Chestnut', colorHex: '#8B4513', prices: { USD: 22000, EUR: 20000, GBP: 17500 }, stock: 8 },
        { title: 'Chestnut / 42', sku: 'CCB-BRN-42', size: '42', color: 'Chestnut', colorHex: '#8B4513', prices: { USD: 22000, EUR: 20000, GBP: 17500 }, stock: 14 },
        { title: 'Chestnut / 43', sku: 'CCB-BRN-43', size: '43', color: 'Chestnut', colorHex: '#8B4513', prices: { USD: 22000, EUR: 20000, GBP: 17500 }, stock: 10 },
        { title: 'Black / 42', sku: 'CCB-BLK-42', size: '42', color: 'Onyx Black', colorHex: '#111111', prices: { USD: 22000, EUR: 20000, GBP: 17500 }, stock: 12 },
        { title: 'Black / 43', sku: 'CCB-BLK-43', size: '43', color: 'Onyx Black', colorHex: '#111111', prices: { USD: 22000, EUR: 20000, GBP: 17500 }, stock: 9 },
      ],
    },
    {
      name: 'Everyday Canvas & Leather Tote',
      slug: 'everyday-canvas-leather-tote',
      description: 'Heavy 18oz water-repellent duck canvas paired with vegetable-tanned bridle leather straps. Sized to carry a 16-inch laptop and your daily necessities.',
      category: categoryMap['accessories']?.id,
      isFeatured: false,
      isNewArrival: true,
      images: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80',
      ],
      features: ['18oz Duck Canvas', 'Full-grain bridle leather handles', 'Padded laptop sleeve inside', 'Solid brass snap closure'],
      seoTitle: 'Everyday Canvas & Leather Tote — Affeto',
      seoDescription: 'Rugged, utilitarian canvas tote bag crafted to withstand daily commutes.',
      variants: [
        { title: 'Natural Tan / One Size', sku: 'ECT-NAT-OS', size: 'One Size', color: 'Natural/Tan', colorHex: '#EAE6DF', prices: { USD: 7500, EUR: 7000, GBP: 6000 }, stock: 35 },
        { title: 'All Black / One Size', sku: 'ECT-BLK-OS', size: 'One Size', color: 'Black', colorHex: '#111111', prices: { USD: 7500, EUR: 7000, GBP: 6000 }, stock: 25 },
      ],
    },
    {
      name: 'Brushed Cashmere Scarf',
      slug: 'brushed-cashmere-scarf',
      description: 'Woven in Scotland from pure Grade-A Mongolian cashmere, softly brushed with natural teasels for a rippled water-weave finish.',
      category: categoryMap['accessories']?.id,
      isFeatured: false,
      isNewArrival: false,
      images: [
        'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=80',
      ],
      features: ['100% Scottish-woven Mongolian cashmere', 'Traditional ripple finish', 'Fringed ends', 'Size: 180cm x 30cm'],
      seoTitle: 'Brushed Cashmere Scarf — Affeto',
      seoDescription: 'Exquisitely soft pure cashmere scarf with traditional Scottish ripple finish.',
      variants: [
        { title: 'Heather Grey / One Size', sku: 'BCS-HGY-OS', size: 'One Size', color: 'Heather Grey', colorHex: '#9E9E9E', prices: { USD: 6500, EUR: 6000, GBP: 5200 }, stock: 25 },
        { title: 'Camel / One Size', sku: 'BCS-CML-OS', size: 'One Size', color: 'Camel', colorHex: '#C19A6B', prices: { USD: 6500, EUR: 6000, GBP: 5200 }, stock: 20 },
      ],
    },
  ];

  for (const prodData of products) {
    const { variants, ...prodFields } = prodData;

    const existingProduct = await strapi.db.query('api::product.product').findOne({
      where: { slug: prodFields.slug },
    });

    let product = existingProduct;
    if (!product) {
      product = await strapi.entityService.create('api::product.product', {
        data: {
          ...prodFields,
          publishedAt: new Date(),
        },
      });
    }

    // Create variants, prices & inventory
    for (const vData of variants) {
      const { prices, stock, ...variantFields } = vData;

      const existingVariant = await strapi.db.query('api::variant.variant').findOne({
        where: { sku: variantFields.sku },
      });

      let variant = existingVariant;
      if (!variant) {
        variant = await strapi.entityService.create('api::variant.variant', {
          data: {
            ...variantFields,
            product: product.id,
          },
        });
      }

      // Inventory
      const existingInventory = await strapi.db.query('api::inventory.inventory').findOne({
        where: { variant: variant.id },
      });

      if (!existingInventory) {
        await strapi.entityService.create('api::inventory.inventory', {
          data: {
            variant: variant.id,
            quantity: stock,
            lowStockThreshold: 5,
          },
        });
      }

      // Prices
      for (const [curr, amt] of Object.entries(prices)) {
        const existingPrice = await strapi.db.query('api::price.price').findOne({
          where: { variant: variant.id, currency: curr },
        });

        if (!existingPrice) {
          await strapi.entityService.create('api::price.price', {
            data: {
              variant: variant.id,
              currency: curr,
              amount: amt,
            },
          });
        }
      }
    }
  }

  strapi.log.info('Seeding finished successfully! Affeto catalog is ready.');
}

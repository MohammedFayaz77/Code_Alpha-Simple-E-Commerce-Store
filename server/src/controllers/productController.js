const prisma = require('../config/db');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

/**
 * Get all products with search, filtering, sorting, and pagination
 * GET /api/products
 */
async function getProducts(req, res, next) {
  try {
    const {
      search,
      categoryId,
      categorySlug,
      minPrice,
      maxPrice,
      inStock,
      isFeatured,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
    const skip = (parsedPage - 1) * parsedLimit;

    // Build Prisma where filter
    const where = {};

    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search.trim() } },
        { description: { contains: search.trim() } }
      ];
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId, 10);
    } else if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (inStock === 'true' || inStock === true) {
      where.stock = { gt: 0 };
    }

    if (isFeatured === 'true' || isFeatured === true) {
      where.isFeatured = true;
    }

    // Build orderBy
    let orderBy = { createdAt: 'desc' };
    if (sort === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'name-asc') {
      orderBy = { name: 'asc' };
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: parsedLimit,
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          }
        }
      })
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: parsedPage,
          limit: parsedLimit,
          totalPages,
          hasNextPage: parsedPage < totalPages,
          hasPrevPage: parsedPage > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single product by ID or Slug
 * GET /api/products/:identifier
 */
async function getProduct(req, res, next) {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);

    const product = await prisma.product.findFirst({
      where: isNumeric
        ? { id: parseInt(identifier, 10) }
        : { slug: identifier },
      include: {
        category: true
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Fetch related products in the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id }
      },
      take: 4,
      include: { category: true }
    });

    res.json({
      success: true,
      data: {
        product,
        relatedProducts
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new product (Admin only)
 * POST /api/products
 */
async function createProduct(req, res, next) {
  try {
    const {
      name,
      description,
      price,
      compareAtPrice,
      stock,
      sku,
      image,
      categoryId,
      isFeatured
    } = req.body;

    let baseSlug = slugify(name);
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: uniqueSlug,
        description,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        stock: parseInt(stock, 10) || 0,
        sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
        image,
        categoryId: parseInt(categoryId, 10),
        isFeatured: Boolean(isFeatured)
      },
      include: {
        category: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an existing product (Admin only)
 * PUT /api/products/:id
 */
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);

    const existing = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const {
      name,
      description,
      price,
      compareAtPrice,
      stock,
      sku,
      image,
      categoryId,
      isFeatured
    } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (compareAtPrice !== undefined) data.compareAtPrice = compareAtPrice ? parseFloat(compareAtPrice) : null;
    if (stock !== undefined) data.stock = parseInt(stock, 10);
    if (sku !== undefined) data.sku = sku;
    if (image !== undefined) data.image = image;
    if (categoryId !== undefined) data.categoryId = parseInt(categoryId, 10);
    if (isFeatured !== undefined) data.isFeatured = Boolean(isFeatured);

    const updated = await prisma.product.update({
      where: { id: productId },
      data,
      include: {
        category: true
      }
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updated }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a product (Admin only)
 * DELETE /api/products/:id
 */
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);

    const existing = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await prisma.product.delete({
      where: { id: productId }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};

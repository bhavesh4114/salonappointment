import prisma from '../prisma/client.js';

/**
 * GET /api/admin/services
 * Admin Services Management list.
 * - Returns ALL services (active + inactive) from Service table.
 * - Includes barber relation so we can show assigned barber count.
 * - Supports optional pagination & search.
 */
export const listServices = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const search = (req.query.search || '').trim();
    const category = (req.query.category || '').trim();
    const status = (req.query.status || '').trim().toLowerCase(); // active | inactive
    const minPriceRaw = req.query.minPrice;
    const maxPriceRaw = req.query.maxPrice;

    const andConditions = [];

    if (search) {
      const s = search;
      const orSearch = [
        { name: { contains: s, mode: 'insensitive' } },
        { description: { contains: s, mode: 'insensitive' } },
      ];

      const numId = parseInt(s, 10);
      if (!Number.isNaN(numId) && numId > 0) {
        orSearch.push({ id: numId });
      }

      // IMPORTANT: do NOT search on enum category here; category is handled
      // separately via the dedicated category filter to avoid Prisma enum errors.

      andConditions.push({ OR: orSearch });
    }

    if (category) {
      const normalizedCategory = category.toUpperCase();
      // Guard against invalid enum values – only apply filter when value is a known enum
      const validCategories = ['HAIRCUT', 'BEARD', 'SPA', 'FACIAL', 'GROOMING', 'KIDS', 'ELITE'];
      if (validCategories.includes(normalizedCategory)) {
        andConditions.push({
          category: normalizedCategory,
        });
      }
      // If category is not a valid enum, we silently ignore it instead of breaking other filters.
    }

    if (status === 'active') {
      andConditions.push({ isActive: true });
    } else if (status === 'inactive') {
      andConditions.push({ isActive: false });
    }

    // Price range – only apply when valid numbers are provided
    let minPrice;
    let maxPrice;

    if (minPriceRaw !== undefined && minPriceRaw !== null && String(minPriceRaw).trim() !== '') {
      const parsed = Number(minPriceRaw);
      if (!Number.isNaN(parsed)) minPrice = parsed;
    }

    if (maxPriceRaw !== undefined && maxPriceRaw !== null && String(maxPriceRaw).trim() !== '') {
      const parsed = Number(maxPriceRaw);
      if (!Number.isNaN(parsed)) maxPrice = parsed;
    }

    if (typeof minPrice === 'number' || typeof maxPrice === 'number') {
      const priceCond = {};
      if (typeof minPrice === 'number') priceCond.gte = minPrice;
      if (typeof maxPrice === 'number') priceCond.lte = maxPrice;
      andConditions.push({ price: priceCond });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          barber: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

    res.json({
      success: true,
      data: services,
      total,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Admin listServices error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};


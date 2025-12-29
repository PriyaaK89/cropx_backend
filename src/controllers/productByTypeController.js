const { formatProducts } = require("../service/productFormatter");
const { getBestSellingProducts, getBestSellingCount,getNewArrivals,getNewArrivalsCount,getFeaturedProductsCount,getFeaturedProducts} = require("../models/productsByTypeModel");

exports.bestSellingProducts = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const rows = await getBestSellingProducts(page, limit);
  const productIds = rows.map(p => p.id);

  const products = await formatProducts({ productIds });
  const total = await getBestSellingCount();

  res.json({
    success: true,
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

exports.newArrivals = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const rows = await getNewArrivals(page, limit);
  const productIds = rows.map(p => p.id);

  const products = await formatProducts({ productIds });
  const total = await getNewArrivalsCount();

  res.json({
    success: true,
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};


exports.featuredProducts = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const rows = await getFeaturedProducts(page, limit);
  const productIds = rows.map(p => p.id);

  const products = await formatProducts({ productIds });
  const total = await getFeaturedProductsCount();

  res.json({
    success: true,
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

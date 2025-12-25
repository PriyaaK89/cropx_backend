const {getBestSellingProducts,getBestSellingCount,getNewArrivals,getFeaturedProducts} = require("../models/productsByTypeModel");

exports.bestSellingProducts = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const data = await getBestSellingProducts(page, limit);
  const total = await getBestSellingCount();

  res.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
};

exports.newArrivals = async (req, res) => {
  const limit = req.query.limit || 10;
  const data = await getNewArrivals(limit);

  res.json({ success: true, data });
};

exports.featuredProducts = async (req, res) => {
  const limit = req.query.limit || 10;
  const data = await getFeaturedProducts(limit);

  res.json({ success: true, data });
};




























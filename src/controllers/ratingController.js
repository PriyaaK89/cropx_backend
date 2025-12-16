const RatingModel = require("../models/ratingModel");

exports.rateProduct = async (req, res) => {
  try {
    const {
      product_id,
      variant_id,
      multipack_id = null,
      rating
    } = req.body;

    const user_id = req.user.id;

    //  Validations
    if (!product_id) {
      return res.status(400).json({ message: "product_id is required" });
    }

    if (!variant_id) {
      return res.status(400).json({ message: "variant_id is required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    // Multipack safety check
    if (multipack_id && !variant_id) {
      return res.status(400).json({
        message: "multipack must belong to a variant"
      });
    }

    // Insert or update rating
    await RatingModel.addOrUpdateRating({
      product_id,
      variant_id,
      multipack_id,
      user_id,
      rating
    });

    // Update aggregated product rating
    await RatingModel.updateProductRatingStats(product_id);

    res.status(200).json({
      success: true,
      message: "Rating submitted successfully"
    });

  } catch (error) {
    console.error("Rate product error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

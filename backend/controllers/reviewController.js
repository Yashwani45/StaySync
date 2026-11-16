const Review = require('../models/Review');
const Property = require('../models/Property');
const ServiceProvider = require('../models/ServiceProvider');

// @desc    Get reviews for a property or service provider
// @route   GET /api/reviews/:targetId
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const { targetId } = req.params;
    const targetIds = targetId.includes(',') ? targetId.split(',').map(s => s.trim()) : [targetId];
    const reviews = await Review.find({ targetId: { $in: targetIds } })
      .populate('author', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit a verified review and recalculate target rating
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { targetId, targetType, rating, comment } = req.body;

    if (!targetId || !targetType || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide targetId, targetType, rating (1-5), and a review comment.'
      });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer or decimal between 1 and 5.'
      });
    }

    // Check if user already reviewed this target
    const existing = await Review.findOne({
      author: req.user.id,
      targetId
    });

    let review;
    if (existing) {
      existing.rating = numericRating;
      existing.comment = comment;
      review = await existing.save();
    } else {
      review = await Review.create({
        author: req.user.id,
        targetId,
        targetType,
        rating: numericRating,
        comment
      });
    }

    // Recalculate average rating for the target listing
    const allReviews = await Review.find({ targetId });
    const count = allReviews.length;
    const avg = count > 0 
      ? Number((allReviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1))
      : numericRating;

    if (targetType === 'Property') {
      await Property.findByIdAndUpdate(targetId, {
        rating: avg,
        reviewsCount: count
      });
    } else if (targetType === 'ServiceProvider') {
      await ServiceProvider.findByIdAndUpdate(targetId, {
        rating: avg,
        reviewsCount: count
      });
    }

    const populated = await Review.findById(review._id).populate('author', 'name profileImage');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: populated,
      averageRating: avg,
      reviewsCount: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
}, { timestamps: true });

// Static method to calculate average rating for a recipe
ratingSchema.statics.calculateAverageRating = async function(recipeId) {
  const result = await this.aggregate([
    { $match: { recipe: mongoose.Types.ObjectId(recipeId) } },
    { $group: { _id: '$recipe', averageRating: { $avg: '$rating' } } }
  ]);

  // If ratings exist, return the average; otherwise, return null
  return result.length > 0 ? result[0].averageRating : null;
};

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;

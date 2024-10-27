import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
  },
  cookingTip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CookingTip',
  },
  comment: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
}, { timestamps: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;

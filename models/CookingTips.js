import mongoose from 'mongoose';

const cookingTipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: [String], // Tags related to the tip (e.g., quick, healthy)
}, { timestamps: true });

const CookingTip = mongoose.model('CookingTip', cookingTipSchema);

export default CookingTip;

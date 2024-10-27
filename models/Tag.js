import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure unique tag names
  },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

const Tag = mongoose.model('Tag', tagSchema);

export default Tag;

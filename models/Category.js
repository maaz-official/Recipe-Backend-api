import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure unique category names
  },
  description: String, // Optional description of the category
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

const Category = mongoose.model('Category', categorySchema);

export default Category;

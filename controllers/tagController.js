// controllers/tagController.js
import asyncHandler from '../utils/asyncHandler.js';
import Tag from '../models/Tag.js';
import AppError from '../utils/AppError.js';

// Create a new tag
const createTag = asyncHandler(async (req, res, next) => {
    const { name } = req.body;

    // Validate input
    if (!name) return next(new AppError('Tag name is required', 400));

    // Check if tag already exists
    const existingTag = await Tag.findOne({ name });
    if (existingTag) return next(new AppError('Tag already exists', 400));

    // Create new tag
    const tag = await Tag.create({ name });

    res.status(201).json({
        message: 'Tag created successfully',
        tag,
    });
});

// Get all tags
const getAllTags = asyncHandler(async (req, res, next) => {
    const tags = await Tag.find();
    res.status(200).json({
        tags,
    });
});

// Update a tag
const updateTag = asyncHandler(async (req, res, next) => {
    const { tagId } = req.params;
    const { name } = req.body;

    // Validate input
    if (!name) return next(new AppError('Tag name is required', 400));

    // Find the tag
    const tag = await Tag.findById(tagId);
    if (!tag) return next(new AppError('Tag not found', 404));

    // Check if new name is already in use
    const existingTag = await Tag.findOne({ name });
    if (existingTag && existingTag._id.toString() !== tagId) {
        return next(new AppError('Tag name already exists', 400));
    }

    // Update tag name
    tag.name = name;
    await tag.save();

    res.status(200).json({
        message: 'Tag updated successfully',
        tag,
    });
});

// Delete a tag
const deleteTag = asyncHandler(async (req, res, next) => {
    const { tagId } = req.params;

    // Find the tag
    const tag = await Tag.findById(tagId);
    if (!tag) return next(new AppError('Tag not found', 404));

    // Delete the tag
    await tag.remove();

    res.status(200).json({
        message: 'Tag deleted successfully',
    });
});

export {
    createTag,
    getAllTags,
    updateTag,
    deleteTag,
};

// controllers/commentController.js
import asyncHandler from '../utils/asyncHandler.js';
import Comment from '../models/Comment.js';
import Recipe from '../models/Recipe.js';
import AppError from '../utils/AppError.js';

// Create a new comment
const createComment = asyncHandler(async (req, res, next) => {
    const { recipeId, text } = req.body;

    // Validate inputs
    if (!recipeId || !text) return next(new AppError('Recipe ID and text are required', 400));

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return next(new AppError('Recipe not found', 404));

    // Create a new comment
    const comment = await Comment.create({
        user: req.user._id, // Assuming the user is authenticated and their ID is available in req.user
        recipe: recipeId,
        text,
    });

    // Add the comment to the recipe's comments array
    recipe.comments.push(comment._id);
    await recipe.save();

    res.status(201).json({
        message: 'Comment created successfully',
        comment,
    });
});

// Get all comments for a recipe
const getCommentsForRecipe = asyncHandler(async (req, res, next) => {
    const { recipeId } = req.params;

    // Validate recipe ID
    if (!recipeId) return next(new AppError('Recipe ID is required', 400));

    // Fetch comments for the recipe
    const comments = await Comment.find({ recipe: recipeId }).populate('user', 'name email'); // Populate user info

    res.status(200).json({
        comments,
    });
});

// Update a comment
const updateComment = asyncHandler(async (req, res, next) => {
    const { commentId } = req.params;
    const { text } = req.body;

    // Validate text
    if (!text) return next(new AppError('Text is required', 400));

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) return next(new AppError('Comment not found', 404));

    // Check if the user is the owner of the comment
    if (comment.user.toString() !== req.user._id.toString()) {
        return next(new AppError('You are not authorized to update this comment', 403));
    }

    // Update the comment text
    comment.text = text;
    await comment.save();

    res.status(200).json({
        message: 'Comment updated successfully',
        comment,
    });
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res, next) => {
    const { commentId } = req.params;

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) return next(new AppError('Comment not found', 404));

    // Check if the user is the owner of the comment
    if (comment.user.toString() !== req.user._id.toString()) {
        return next(new AppError('You are not authorized to delete this comment', 403));
    }

    // Remove the comment from the recipe's comments array
    await Recipe.findByIdAndUpdate(comment.recipe, { $pull: { comments: commentId } });

    // Delete the comment
    await comment.remove();

    res.status(200).json({
        message: 'Comment deleted successfully',
    });
});

export {
    createComment,
    getCommentsForRecipe,
    updateComment,
    deleteComment,
};

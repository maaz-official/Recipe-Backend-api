// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: false, // Changed to optional
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'guest'],
        default: 'user',
    },
    additionalInfo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdditionalInfo',
    }],       
    addToFav: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }], // Array of favorite recipe IDs
    profilePicture: String,
    isGuest: {
        type: Boolean,
        default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Virtual for full name (if necessary)
userSchema.virtual('fullName').get(function () {
    return this.name; // Assuming 'name' is already the full name
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next(); // Skip hashing if password is not set
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return this.password ? await bcrypt.compare(enteredPassword, this.password) : false; // Only compare if password exists
};

// Generate verification code
userSchema.methods.generateVerificationCode = function () {
    this.verificationCode = crypto.randomBytes(3).toString('hex');
    return this.verificationCode;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes
};

// Methods for managing favorites
userSchema.methods.addFavoriteLocally = function (recipeId) {
    if (!this.addToFav.includes(recipeId)) {
        this.addToFav.push(recipeId);
        return true;
    }
    return false;
};

userSchema.methods.removeFavoriteLocally = function (recipeId) {
    const index = this.addToFav.indexOf(recipeId);
    if (index > -1) {
        this.addToFav.splice(index, 1);
        return true;
    }
    return false;
};

// Call `user.save()` manually when you’re ready to persist all changes.
const User = mongoose.model('User', userSchema);

export default User;

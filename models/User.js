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
    mobileNumber: String,
    dob: Date,
    address: String,
    addToFav: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Recipe', 
    }],
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

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.name.first} ${this.name.last}`;
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate verification code
userSchema.methods.generateVerificationCode = function() {
    this.verificationCode = crypto.randomBytes(3).toString('hex');
    return this.verificationCode;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes
    return resetToken;
};

// Add favorite recipe
userSchema.methods.addFavoriteRecipe = async function(recipeId) {
    if (!this.addToFav.includes(recipeId)) {
        this.addToFav.push(recipeId);
        await this.save();
        return true;
    }
    return false;
};

// Remove favorite recipe
userSchema.methods.removeFavoriteRecipe = async function(recipeId) {
    const index = this.addToFav.indexOf(recipeId);
    if (index > -1) {
        this.addToFav.splice(index, 1);
        await this.save();
        return true;
    }
    return false;
};

const User = mongoose.model('User', userSchema);

export default User;

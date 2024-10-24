import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure unique email
  },
  mobile: {
    type: String,
    required: true, // Ensure mobile number is required
    unique: true, // Ensure unique mobile number
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false, // Mobile is not verified by default
  },
  verificationCode: {
    type: String, // A random string for mobile verification
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guest'], // Role can be user, admin, or guest
    default: 'user',
  },
  addToFav: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Recipe', // Reference to the Recipe model
  }], // Array of favorite recipe IDs
  profilePicture: {
    type: String, // URL to profile picture
  },
  isGuest: {
    type: Boolean,
    default: false, // Whether the user is a guest or not
  },
  resetPasswordToken: String, // Token for password reset
  resetPasswordExpires: Date,  // Expiry date for password reset token
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

// Hash password before saving user to DB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

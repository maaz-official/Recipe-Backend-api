import jwt from 'jsonwebtoken';

// Function to generate a JWT token
const generateToken = (id) => {
  // Sign the token with the user's ID, using the JWT secret from environment variables
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expiration set to 30 days
  });
};

export default generateToken;

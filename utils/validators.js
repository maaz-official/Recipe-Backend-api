// utils/validators.js
const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
    return regex.test(email);
};

const validateMobile = (mobile) => {
    const regex = /^[0-9]{10,15}$/; // Adjust the length based on your requirements
    return regex.test(mobile);
};

const validatePassword = (password) => {
    // At least 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
};

export { validateEmail, validateMobile, validatePassword };

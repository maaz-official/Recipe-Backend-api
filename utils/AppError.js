class AppError extends Error {
    constructor(message, statusCode) {
        super(message); // Call the parent class (Error) constructor with the message
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // Set status based on statusCode
        this.isOperational = true; // Mark error as operational for known errors

        // Capture the stack trace (excluding the constructor call in this error stack)
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;

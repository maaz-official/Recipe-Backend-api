import nodemailer from 'nodemailer';
import asyncHandler from './asyncHandler.js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create a transporter object using Gmail's SMTP service
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: process.env.GMAIL_USER, // Your Gmail address from environment variable
        pass: process.env.GMAIL_APP_PASSWORD, // Your Gmail App Password from environment variable
    },
});

// Function to send verification email
export const sendVerificationEmail = asyncHandler(async (to, verificationCode) => {
    try {
        // Send mail with defined transport object
        const info = await transporter.sendMail({
            from: `"Your Service Name" <${process.env.GMAIL_USER}>`, // Sender address
            to, // List of recipients
            subject: 'Email Verification Code', // Subject line
            text: `Your verification code is ${verificationCode}.`, // Plain text body
            html: `<b>Your verification code is ${verificationCode}.</b>`, // HTML body
        });

        console.log("Verification email sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error.message); // Log the error message for clarity
        throw new Error('Email could not be sent');
    }
});

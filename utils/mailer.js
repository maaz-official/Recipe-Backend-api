// src/utils/mailer.js
import nodemailer from 'nodemailer';
import asyncHandler from './asyncHandler.js';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export const sendVerificationEmail = asyncHandler(async (to, verificationCode) => {
    try {
        const mailOptions = {
            from: `"Your Service Name" <${process.env.GMAIL_USER}>`,
            to,
            subject: 'Email Verification Code',
            text: `Your verification code is: ${verificationCode}. Please use this code to verify your email.`,
            html: `<p>Your verification code is: <b>${verificationCode}</b></p><p>Please use this code to verify your email.</p>`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Verification email sent:", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error.message);
        throw new Error('Failed to send verification email');
    }
});

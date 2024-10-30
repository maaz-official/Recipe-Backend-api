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
            from: `"Code2Day" <${process.env.GMAIL_USER}>`, // Use brand name in the sender field
            to,
            subject: 'Email Verification Code from Code2Day',
            text: `Hello,\n\nYour verification code is: ${verificationCode}.\nPlease use this code to verify your email with Code2Day.\n\nBest regards,\nMuhammad Maaz, Mentor at Code2Day`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                    <h2 style="color: #333;">Welcome to Code2Day!</h2>
                    <p>Hello,</p>
                    <p>Your verification code is: <b style="font-size: 24px;">${verificationCode}</b>.</p>
                    <p>Please use this code to verify your email with Code2Day.</p>
                    <p>Best regards,<br><strong>Muhammad Maaz</strong><br>Mentor at Code2Day</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Verification email sent:", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error.message);
        throw new Error('Failed to send verification email');
    }
});

// import { isValidNumber, parsePhoneNumber } from 'libphonenumber-js'; // Import necessary functions
// import twilio from 'twilio';

// // Replace these with your actual Twilio credentials

// const twilioClient = twilio(accountSid, authToken);

// const sendSMS = async ({ to, text }) => {
//     try {
//         // Parse and validate the phone number
//         const phoneNumber = parsePhoneNumber(to, 'PK'); // 'PK' for Pakistan

//         if (!isValidNumber(phoneNumber.number)) {
//             throw new Error('Invalid phone number format');
//         }

//         // Send the SMS
//         const message = await twilioClient.messages.create({
//             body: text,
//             to: phoneNumber.number, // Send to the validated number
//         });

//         console.log(`SMS sent successfully to: ${phoneNumber.number}, Message SID: ${message.sid}`);
//     } catch (error) {
//         console.error('Error sending SMS:', error.message);
//         throw error; // Propagate the error
//     }
// };

// export default sendSMS;

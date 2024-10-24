import twilio from 'twilio';

const sendSMS = async ({ to, text }) => {
    // Check for a valid Twilio phone number
    const from = process.env.TWILIO_PHONE_NUMBER || '+923417012094'; // Replace with a test number if needed

    console.log(`Sending SMS from: ${from} to: ${to}`);
    
    // Temporarily simulate SMS sending
    if (!from || from === '+923417012094') {
        console.log(`Simulating SMS sending: "${text}" to ${to}`);
        return; // Exit without sending
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    try {
        if (to === from) {
            throw new Error('The "to" number cannot be the same as the "from" number.');
        }

        const message = await client.messages.create({
            body: text,
            from,
            to,
        });
        console.log('SMS sent successfully:', message.sid);
    } catch (error) {
        console.error('Error sending SMS:', error);
        console.error('Error details:', error.response ? error.response.body : error.message);
        throw new Error('SMS could not be sent');
    }
};

export default sendSMS;

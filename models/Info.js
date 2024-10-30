// models/additionalInfo.js
import mongoose from 'mongoose';

const additionalInfoSchema = new mongoose.Schema({
    mobileNumber: { type: String },
    dob: { type: Date },
    address: { type: String }
});

// Export the model
const AdditionalInfo = mongoose.model('AdditionalInfo', additionalInfoSchema);

export default AdditionalInfo;

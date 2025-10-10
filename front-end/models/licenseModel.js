import mongoose from "mongoose"

const licenseSchema = new mongoose.Schema({
    filename: String,
    mimetype: String,
    data: String,
    uploadedAt:{
        type: Date,
        default: Date.now
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
    },
    rejectionReason: {
        type: String,
        default: null
    },
    verifiedBy: {
        type: String,
        default: null
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'businesses',
    },
}, {
  timestamps: true,
});

const BusinessLicense = mongoose.models.licenses || mongoose.model("licenses", licenseSchema)

export default BusinessLicense;
import mongoose from "mongoose";

const businessSchema = new mongoose.Schema({
  companyName: String,
  businessType: String,
  registrationNumber: String,
  country: String,
  address: String,
  phoneNumber: String,
  website: String,
  description: String,
  role: String,
  verified: {
    type: Boolean,
    default: false,
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
}, {
  timestamps: true,
});

const Business = mongoose.models.businesses || mongoose.model("businesses", businessSchema);

export default Business;
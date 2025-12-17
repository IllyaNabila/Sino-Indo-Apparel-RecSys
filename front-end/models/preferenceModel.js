import mongoose from "mongoose";

const preferenceSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "businesses", 
    required: true,
  },
  primaryMarkets: {
    type: [String],
    default: [],
  },
  productCategories: {
    type: [String],
    default: [],
  },
  materials: {
    type: [String],
    default: [],
  },
  customTags: {
    type: [String],
    default: [],
  },
  primaryMarkets_norm: {
    type: [String],
    default: [],
  },
  productCategories_norm: {
    type: [String],
    default: [],
  },
  materials_norm: {
    type: [String],
    default: [],
  },
  customTags_norm: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

const Preference = mongoose.models.preferences || mongoose.model("preferences", preferenceSchema);

export default Preference;

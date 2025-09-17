import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    name: String,
    category: String,
    material: String,
    moq: String,
    priceMin: String,
    priceMax: String,
    description: String,
    colors: [String],
    sizes: [String],
    leadTime: String,
    images: [String],
  },
  {
    timestamps: true,
  }
);

const Product =
  mongoose.models.products || mongoose.model("products", productSchema);

export default Product;

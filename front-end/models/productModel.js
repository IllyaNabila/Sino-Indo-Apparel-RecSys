import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "businesses",
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
    listingType: String,
    images: [String],
    searchText: String,
    name_norm: String,
    category_norm: String,
    material_norm: String,
    description_norm: String,
  },
  {
    timestamps: true,
  }
);

const Product =
  mongoose.models.products || mongoose.model("products", productSchema);

export default Product;

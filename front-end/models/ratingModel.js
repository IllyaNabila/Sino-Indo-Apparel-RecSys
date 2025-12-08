import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "conversations",
        },        
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products",
        },      
        reviewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "businesses",
        },     
        partnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "businesses",
        },      
        businessRating: Number,   
        productRating: Number,    
        comment: String,
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }
);

const Rating = mongoose.models.ratings || mongoose.model("ratings", ratingSchema);

export default Rating;
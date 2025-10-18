import mongoose from 'mongoose';
import "@/models/businessModel";
import "@/models/licenseModel";
import "@/models/conversationMembershipModel";
import "@/models/conversationModel";
import "@/models/messageModel";
import "@/models/userModel";
import "@/models/preferenceModel";
import "@/models/productModel";

export async function connect() {
    if (mongoose.connection.readyState >= 1) 
        return;

    try {
        mongoose.connect(process.env.MONGO_URI!)
        const connection = mongoose.connection;

        connection.on('connected', () => {
            console.log('MongoDB connected successfully');            
        })

        connection.on('error', (err) => {
            console.log('MongoDB connection error. Please make sure MongoDB is running,' + err);
            process.exit();            
        })
    } catch (error) {
        console.log("Something goes wrong!");
        console.log(error);     
    }
}
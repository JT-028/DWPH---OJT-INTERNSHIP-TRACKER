import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async (): Promise<void> => {
    if (isConnected) {
        return;
    }

    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/internship-tracker';
        
        // Mongoose connection options
        mongoose.set('strictQuery', true);
        
        await mongoose.connect(mongoURI);
        isConnected = true;
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
};

export default connectDB;

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

        // Drop old date-only index if it exists (from pre-auth version)
        try {
            const db = mongoose.connection.db;
            if (db) {
                const collection = db.collection('dailylogs');
                const indexes = await collection.indexes();
                const dateOnlyIndex = indexes.find((idx: any) => 
                    idx.name === 'date_1' && !idx.key.userId
                );
                if (dateOnlyIndex) {
                    await collection.dropIndex('date_1');
                    console.log('✅ Dropped old date_1 index');
                }
            }
        } catch (indexError) {
            // Index might not exist, that's fine
            console.log('Index cleanup skipped:', indexError);
        }
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
};

export default connectDB;

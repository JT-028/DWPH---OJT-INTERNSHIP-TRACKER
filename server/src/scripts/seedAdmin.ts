import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

// Manual SRV resolution fallback for networks where Node.js SRV lookups fail
async function resolveSrvManually(hostname: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
            if (err) {
                reject(err);
            } else {
                resolve(addresses.map(a => `${a.name}:${a.port}`));
            }
        });
    });
}

const seedAdmin = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/internship-tracker';

        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000,
        });
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('⚠️  Main admin already exists:', existingAdmin.email);
            console.log('   Only one main admin is allowed.');
            process.exit(0);
        }

        // Create main admin
        const admin = await User.create({
            email: 'admin@dwph.com',
            password: 'admin123',
            name: 'Main Admin',
            role: 'admin',
            isActive: true,
        });

        console.log('🎉 Main admin account created successfully!');
        console.log('   Email:', admin.email);
        console.log('   Password: admin123');
        console.log('   ⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();

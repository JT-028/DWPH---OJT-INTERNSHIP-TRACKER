import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'intern' | 'sub-admin' | 'admin';

export type Department = 'Creative & Marketing Support Associates' | 'Recruitment Support Interns' | 'IT Support Interns' | '';

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    department: Department;
    isActive: boolean;
    // Supervisor assignment (for interns - who supervises them)
    supervisors: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ['intern', 'sub-admin', 'admin'],
            default: 'intern',
        },
        department: {
            type: String,
            enum: ['Creative & Marketing Support Associates', 'Recruitment Support Interns', 'IT Support Interns', ''],
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        supervisors: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Don't return password in JSON
UserSchema.set('toJSON', {
    transform: (_doc: any, ret: any) => {
        delete ret.password;
        return ret;
    },
});

export default mongoose.model<IUser>('User', UserSchema);

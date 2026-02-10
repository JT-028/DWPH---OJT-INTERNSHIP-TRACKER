import mongoose, { Schema, Document } from 'mongoose';

export type LogStatus = 'scheduled' | 'completed' | 'holiday' | 'off';

export interface IDailyLog extends Document {
    userId: mongoose.Types.ObjectId;
    date: Date;
    hoursWorked: number;
    tasks: string;
    status: LogStatus;
    createdAt: Date;
    updatedAt: Date;
}

const DailyLogSchema = new Schema<IDailyLog>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        date: {
            type: Date,
            required: true,
        },
        hoursWorked: {
            type: Number,
            required: true,
            default: 8,
            min: 0,
            max: 24,
        },
        tasks: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['scheduled', 'completed', 'holiday', 'off'],
            default: 'scheduled',
        },
    },
    {
        timestamps: true,
    }
);

// Compound unique index: one log per user per date
DailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IDailyLog>('DailyLog', DailyLogSchema);

import mongoose, { Schema, Document } from 'mongoose';

export type LogStatus = 'scheduled' | 'completed' | 'holiday' | 'off';

export interface IDailyLog extends Document {
    date: Date;
    hoursWorked: number;
    tasks: string;
    status: LogStatus;
    createdAt: Date;
    updatedAt: Date;
}

const DailyLogSchema = new Schema<IDailyLog>(
    {
        date: {
            type: Date,
            required: true,
            unique: true,
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

// Index for efficient date queries
DailyLogSchema.index({ date: 1 });

export default mongoose.model<IDailyLog>('DailyLog', DailyLogSchema);

import mongoose, { Schema, Document } from 'mongoose';

export type LogStatus = 'scheduled' | 'completed' | 'holiday' | 'off';

export interface IDailyLog extends Document {
    userId: mongoose.Types.ObjectId;
    date: Date;
    hoursWorked: number;
    tasks: string;
    status: LogStatus;
    // Special workday fields (weekends/holidays marked as workday)
    isSpecialWorkday: boolean;
    specialWorkdayReason?: string;
    markedByAdmin?: mongoose.Types.ObjectId;
    // Validation fields (IS verification)
    isValidated: boolean;
    validatedBy?: mongoose.Types.ObjectId;
    validatedAt?: Date;
    validationNotes?: string;
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
        // Special workday fields
        isSpecialWorkday: {
            type: Boolean,
            default: false,
        },
        specialWorkdayReason: {
            type: String,
            default: '',
        },
        markedByAdmin: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        // Validation fields
        isValidated: {
            type: Boolean,
            default: false,
        },
        validatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        validatedAt: {
            type: Date,
        },
        validationNotes: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Compound unique index: one log per user per date
DailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });
// Index for finding unvalidated logs
DailyLogSchema.index({ userId: 1, isValidated: 1 });

export default mongoose.model<IDailyLog>('DailyLog', DailyLogSchema);

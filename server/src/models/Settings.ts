import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
    targetHours: number;
    startDate: Date;
    hoursPerDay: number;
    excludeHolidays: boolean;
    workDays: number[];
    autoProjection: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
    {
        targetHours: {
            type: Number,
            required: true,
            default: 500,
            min: 1,
        },
        startDate: {
            type: Date,
            required: true,
            default: () => new Date(),
        },
        hoursPerDay: {
            type: Number,
            required: true,
            default: 8,
            min: 1,
            max: 12,
        },
        excludeHolidays: {
            type: Boolean,
            default: true,
        },
        workDays: {
            type: [Number],
            default: [1, 2, 3, 4, 5], // Monday to Friday
            validate: {
                validator: (arr: number[]) => arr.every((d) => d >= 0 && d <= 6),
                message: 'Work days must be between 0 (Sunday) and 6 (Saturday)',
            },
        },
        autoProjection: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ISettings>('Settings', SettingsSchema);

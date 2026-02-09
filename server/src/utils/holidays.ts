export interface Holiday {
    date: string; // YYYY-MM-DD format
    name: string;
    type: 'regular' | 'special';
}

// Philippine Holidays for 2026 and beyond
// Regular holidays and Special non-working holidays
const philippineHolidays: Record<number, Holiday[]> = {
    2026: [
        // Regular Holidays
        { date: '2026-01-01', name: "New Year's Day", type: 'regular' },
        { date: '2026-04-02', name: 'Maundy Thursday', type: 'regular' },
        { date: '2026-04-03', name: 'Good Friday', type: 'regular' },
        { date: '2026-04-09', name: 'Day of Valor (Araw ng Kagitingan)', type: 'regular' },
        { date: '2026-05-01', name: 'Labor Day', type: 'regular' },
        { date: '2026-06-12', name: 'Independence Day', type: 'regular' },
        { date: '2026-08-31', name: 'National Heroes Day', type: 'regular' },
        { date: '2026-11-30', name: 'Bonifacio Day', type: 'regular' },
        { date: '2026-12-25', name: 'Christmas Day', type: 'regular' },
        { date: '2026-12-30', name: 'Rizal Day', type: 'regular' },
        // Special Non-Working Holidays
        { date: '2026-02-17', name: 'Chinese New Year', type: 'special' },
        { date: '2026-04-04', name: 'Black Saturday', type: 'special' },
        { date: '2026-08-21', name: 'Ninoy Aquino Day', type: 'special' },
        { date: '2026-11-01', name: "All Saints' Day", type: 'special' },
        { date: '2026-11-02', name: "All Souls' Day", type: 'special' },
        { date: '2026-12-08', name: 'Feast of the Immaculate Conception of Mary', type: 'special' },
        { date: '2026-12-24', name: 'Christmas Eve', type: 'special' },
        { date: '2026-12-31', name: 'Last Day of the Year', type: 'special' },
    ],
    2027: [
        // Regular Holidays (estimated - some dates may vary)
        { date: '2027-01-01', name: "New Year's Day", type: 'regular' },
        { date: '2027-03-25', name: 'Maundy Thursday', type: 'regular' },
        { date: '2027-03-26', name: 'Good Friday', type: 'regular' },
        { date: '2027-04-09', name: 'Day of Valor (Araw ng Kagitingan)', type: 'regular' },
        { date: '2027-05-01', name: 'Labor Day', type: 'regular' },
        { date: '2027-06-12', name: 'Independence Day', type: 'regular' },
        { date: '2027-08-30', name: 'National Heroes Day', type: 'regular' },
        { date: '2027-11-30', name: 'Bonifacio Day', type: 'regular' },
        { date: '2027-12-25', name: 'Christmas Day', type: 'regular' },
        { date: '2027-12-30', name: 'Rizal Day', type: 'regular' },
        // Special Non-Working Holidays
        { date: '2027-02-06', name: 'Chinese New Year', type: 'special' },
        { date: '2027-03-27', name: 'Black Saturday', type: 'special' },
        { date: '2027-08-21', name: 'Ninoy Aquino Day', type: 'special' },
        { date: '2027-11-01', name: "All Saints' Day", type: 'special' },
        { date: '2027-11-02', name: "All Souls' Day", type: 'special' },
        { date: '2027-12-08', name: 'Feast of the Immaculate Conception of Mary', type: 'special' },
        { date: '2027-12-24', name: 'Christmas Eve', type: 'special' },
        { date: '2027-12-31', name: 'Last Day of the Year', type: 'special' },
    ],
};

export const getHolidaysForYear = (year: number): Holiday[] => {
    return philippineHolidays[year] || [];
};

export const getAllHolidays = (): Holiday[] => {
    return Object.values(philippineHolidays).flat();
};

export const isHoliday = (dateStr: string): Holiday | undefined => {
    const allHolidays = getAllHolidays();
    return allHolidays.find((h) => h.date === dateStr);
};

export const getHolidaysBetweenDates = (startDate: Date, endDate: Date): Holiday[] => {
    const allHolidays = getAllHolidays();
    return allHolidays.filter((h) => {
        const holidayDate = new Date(h.date);
        return holidayDate >= startDate && holidayDate <= endDate;
    });
};

export default philippineHolidays;

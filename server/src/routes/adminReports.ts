import { Router, Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import User from '../models/User.js';
import DailyLog from '../models/DailyLog.js';
import Settings from '../models/Settings.js';
import { authenticate, requireAdminOrSubAdmin } from '../middleware/auth.js';

const router = Router();

// All admin report routes require authentication
router.use(authenticate);

// Helper function to check if current user can access target intern
const canAccessIntern = async (currentUser: any, internId: string): Promise<boolean> => {
    if (currentUser.role === 'admin') return true;
    const intern = await User.findById(internId);
    if (!intern) return false;
    return intern.supervisors?.some((s: any) => s.toString() === currentUser._id.toString()) || false;
};

// Helper function to get intern report data
const getInternReportData = async (internId: string) => {
    const user = await User.findById(internId).populate('supervisors', 'name email');
    if (!user) return null;

    const settings = await Settings.findOne({ userId: internId });
    const logs = await DailyLog.find({ userId: internId })
        .sort({ date: 1 })
        .populate('validatedBy', 'name')
        .populate('markedByAdmin', 'name');

    const completedLogs = logs.filter(l => l.status === 'completed');
    const validatedLogs = completedLogs.filter(l => l.isValidated);
    const specialWorkdays = completedLogs.filter(l => l.isSpecialWorkday);
    const totalHoursCompleted = completedLogs.reduce((sum, l) => sum + l.hoursWorked, 0);
    const targetHours = settings?.targetHours || 500;
    const remainingHours = Math.max(0, targetHours - totalHoursCompleted);
    const progressPercentage = Math.min(100, (totalHoursCompleted / targetHours) * 100);

    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            supervisors: user.supervisors,
            createdAt: user.createdAt,
        },
        settings: settings ? {
            targetHours: settings.targetHours,
            startDate: settings.startDate,
            hoursPerDay: settings.hoursPerDay,
            workDays: settings.workDays,
        } : null,
        summary: {
            totalHoursCompleted,
            totalDaysCompleted: completedLogs.length,
            totalDaysValidated: validatedLogs.length,
            totalSpecialWorkdays: specialWorkdays.length,
            remainingHours,
            progressPercentage: Math.round(progressPercentage * 100) / 100,
            targetHours,
        },
        logs: logs.map(l => ({
            date: l.date,
            hoursWorked: l.hoursWorked,
            tasks: l.tasks,
            status: l.status,
            isValidated: l.isValidated,
            validatedBy: l.validatedBy,
            validatedAt: l.validatedAt,
            validationNotes: l.validationNotes,
            isSpecialWorkday: l.isSpecialWorkday,
            specialWorkdayReason: l.specialWorkdayReason,
        })),
    };
};

// GET /api/admin/reports/intern/:id - Get full report data for a specific intern
router.get('/intern/:id', requireAdminOrSubAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const currentUser = req.user!;

        if (!(await canAccessIntern(currentUser, id))) {
            res.status(403).json({ error: 'You do not have access to this intern' });
            return;
        }

        const reportData = await getInternReportData(id);
        if (!reportData) {
            res.status(404).json({ error: 'Intern not found' });
            return;
        }

        res.json(reportData);
    } catch (error) {
        console.error('Error fetching intern report:', error);
        res.status(500).json({ error: 'Failed to fetch intern report' });
    }
});

// GET /api/admin/reports/bulk - Get report data for multiple interns
router.get('/bulk', requireAdminOrSubAdmin, async (req: Request, res: Response) => {
    try {
        const currentUser = req.user!;
        const { ids } = req.query;

        let internIds: string[] = [];

        if (ids && typeof ids === 'string') {
            internIds = ids.split(',');
        } else {
            // Get all accessible interns
            let query: any = { role: 'intern' };
            if (currentUser.role === 'sub-admin') {
                query.supervisors = currentUser._id;
            }
            const interns = await User.find(query);
            internIds = interns.map(i => i._id.toString());
        }

        const reports = await Promise.all(
            internIds.map(async (id) => {
                if (!(await canAccessIntern(currentUser, id))) {
                    return null;
                }
                return getInternReportData(id);
            })
        );

        const validReports = reports.filter(r => r !== null);
        res.json(validReports);
    } catch (error) {
        console.error('Error fetching bulk reports:', error);
        res.status(500).json({ error: 'Failed to fetch bulk reports' });
    }
});

// Helper function to generate PDF for a single intern
const generateInternPDF = (doc: PDFKit.PDFDocument, reportData: any, isFirst: boolean = true) => {
    if (!isFirst) {
        doc.addPage();
    }

    const { user, settings, summary, logs } = reportData;

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('OJT Internship Progress Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#666666').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);

    // Intern Info Section
    doc.fillColor('#000000').fontSize(14).font('Helvetica-Bold').text('Intern Information');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    if (settings?.startDate) {
        doc.text(`Start Date: ${new Date(settings.startDate).toLocaleDateString()}`);
    }
    if (user.supervisors && user.supervisors.length > 0) {
        const supervisorNames = user.supervisors.map((s: any) => s.name).join(', ');
        doc.text(`Supervisor(s): ${supervisorNames}`);
    }
    doc.moveDown(1);

    // Progress Summary Section
    doc.fontSize(14).font('Helvetica-Bold').text('Progress Summary');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Target Hours: ${summary.targetHours}`);
    doc.text(`Completed Hours: ${summary.totalHoursCompleted}`);
    doc.text(`Remaining Hours: ${summary.remainingHours}`);
    doc.text(`Progress: ${summary.progressPercentage.toFixed(1)}%`);
    doc.moveDown(0.3);
    doc.text(`Total Days Logged: ${summary.totalDaysCompleted}`);
    doc.text(`Days Validated: ${summary.totalDaysValidated}`);
    doc.text(`Special Workdays: ${summary.totalSpecialWorkdays}`);
    doc.moveDown(1);

    // Daily Logs Table
    doc.fontSize(14).font('Helvetica-Bold').text('Daily Work Logs');
    doc.moveDown(0.5);

    const completedLogs = logs.filter((l: any) => l.status === 'completed');

    if (completedLogs.length === 0) {
        doc.fontSize(10).font('Helvetica').text('No completed logs found.');
    } else {
        // Table header
        const tableTop = doc.y;
        const colWidths = { date: 80, hours: 50, validated: 60, tasks: 250 };
        const startX = 50;

        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('Date', startX, tableTop);
        doc.text('Hours', startX + colWidths.date, tableTop);
        doc.text('Validated', startX + colWidths.date + colWidths.hours, tableTop);
        doc.text('Tasks', startX + colWidths.date + colWidths.hours + colWidths.validated, tableTop);

        doc.moveTo(startX, tableTop + 12).lineTo(550, tableTop + 12).stroke();

        let yPos = tableTop + 18;
        doc.font('Helvetica').fontSize(8);

        for (const log of completedLogs) {
            // Check if we need a new page
            if (yPos > 700) {
                doc.addPage();
                yPos = 50;
            }

            const dateStr = new Date(log.date).toLocaleDateString();
            const validatedStr = log.isValidated ? 'Yes' : 'No';
            const tasksStr = (log.tasks || '-').substring(0, 80) + (log.tasks && log.tasks.length > 80 ? '...' : '');

            doc.text(dateStr, startX, yPos, { width: colWidths.date - 5 });
            doc.text(log.hoursWorked.toString(), startX + colWidths.date, yPos, { width: colWidths.hours - 5 });
            doc.text(validatedStr, startX + colWidths.date + colWidths.hours, yPos, { width: colWidths.validated - 5 });
            doc.text(tasksStr, startX + colWidths.date + colWidths.hours + colWidths.validated, yPos, { width: colWidths.tasks - 5 });

            yPos += 15;
        }
    }
};

// GET /api/admin/reports/intern/:id/download - Download PDF for single intern
router.get('/intern/:id/download', requireAdminOrSubAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const currentUser = req.user!;

        if (!(await canAccessIntern(currentUser, id))) {
            res.status(403).json({ error: 'You do not have access to this intern' });
            return;
        }

        const reportData = await getInternReportData(id);
        if (!reportData) {
            res.status(404).json({ error: 'Intern not found' });
            return;
        }

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });

        // Set response headers
        const filename = `${reportData.user.name.replace(/[^a-zA-Z0-9]/g, '_')}_OJT_Report.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Pipe to response
        doc.pipe(res);

        // Generate content
        generateInternPDF(doc, reportData);

        // Finalize
        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

// GET /api/admin/reports/bulk/download - Download bulk PDF for multiple interns
router.get('/bulk/download', requireAdminOrSubAdmin, async (req: Request, res: Response) => {
    try {
        const currentUser = req.user!;
        const { ids } = req.query;

        let internIds: string[] = [];

        if (ids && typeof ids === 'string') {
            internIds = ids.split(',');
        } else {
            // Get all accessible interns
            let query: any = { role: 'intern' };
            if (currentUser.role === 'sub-admin') {
                query.supervisors = currentUser._id;
            }
            const interns = await User.find(query);
            internIds = interns.map(i => i._id.toString());
        }

        const reports: any[] = [];
        for (const id of internIds) {
            if (await canAccessIntern(currentUser, id)) {
                const data = await getInternReportData(id);
                if (data) reports.push(data);
            }
        }

        if (reports.length === 0) {
            res.status(404).json({ error: 'No interns found' });
            return;
        }

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });

        // Set response headers
        const filename = `OJT_Bulk_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Pipe to response
        doc.pipe(res);

        // Generate content for each intern
        reports.forEach((reportData, index) => {
            generateInternPDF(doc, reportData, index === 0);
        });

        // Finalize
        doc.end();
    } catch (error) {
        console.error('Error generating bulk PDF:', error);
        res.status(500).json({ error: 'Failed to generate bulk PDF' });
    }
});

export default router;

import { useState } from 'react';
import { adminApi } from '@/lib/api';
import type { User, InternReportData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    Loader2, FileText, Download, Users, CheckSquare, Square,
    Clock, CheckCircle2, Star, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportsPanelProps {
    users: User[];
}

export function ReportsPanel({ users }: ReportsPanelProps) {
    const [selectedInterns, setSelectedInterns] = useState<Set<string>>(new Set());
    const [reports, setReports] = useState<InternReportData[]>([]);
    const [isLoadingReports, setIsLoadingReports] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const interns = users.filter(u => u.role === 'intern');

    const toggleIntern = (id: string) => {
        const newSet = new Set(selectedInterns);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedInterns(newSet);
    };

    const selectAll = () => {
        if (selectedInterns.size === interns.length) {
            setSelectedInterns(new Set());
        } else {
            setSelectedInterns(new Set(interns.map(i => i._id)));
        }
    };

    const loadReports = async () => {
        if (selectedInterns.size === 0) {
            toast.error('Please select at least one intern');
            return;
        }

        setIsLoadingReports(true);
        try {
            const data = await adminApi.getBulkReport(Array.from(selectedInterns));
            setReports(data);
        } catch (error) {
            toast.error('Failed to load reports');
        } finally {
            setIsLoadingReports(false);
        }
    };

    const downloadSinglePDF = async (internId: string, internName: string) => {
        setIsDownloading(true);
        try {
            const blob = await adminApi.downloadInternPDF(internId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${internName.replace(/[^a-zA-Z0-9]/g, '_')}_OJT_Report.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('PDF downloaded');
        } catch (error) {
            toast.error('Failed to download PDF');
        } finally {
            setIsDownloading(false);
        }
    };

    const downloadBulkPDF = async () => {
        if (selectedInterns.size === 0) {
            toast.error('Please select at least one intern');
            return;
        }

        setIsDownloading(true);
        try {
            const blob = await adminApi.downloadBulkPDF(Array.from(selectedInterns));
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `OJT_Bulk_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Bulk PDF downloaded');
        } catch (error) {
            toast.error('Failed to download bulk PDF');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Intern Selection */}
            <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-amber-500" />
                            Select Interns for Report
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={selectAll}
                        >
                            {selectedInterns.size === interns.length ? (
                                <>
                                    <CheckSquare className="h-4 w-4 mr-1" />
                                    Deselect All
                                </>
                            ) : (
                                <>
                                    <Square className="h-4 w-4 mr-1" />
                                    Select All ({interns.length})
                                </>
                            )}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {interns.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No interns found</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {interns.map((intern) => {
                                const isSelected = selectedInterns.has(intern._id);
                                const progress = intern.targetHours
                                    ? Math.min(100, ((intern.totalHoursCompleted || 0) / intern.targetHours) * 100)
                                    : 0;

                                return (
                                    <button
                                        key={intern._id}
                                        onClick={() => toggleIntern(intern._id)}
                                        className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                                            isSelected
                                                ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                                                : 'border-border/50 hover:border-amber-500/50'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                                            isSelected
                                                ? 'bg-amber-500 border-amber-500 text-white'
                                                : 'border-muted-foreground/30'
                                        }`}>
                                            {isSelected && <CheckSquare className="h-3 w-3" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{intern.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{intern.totalHoursCompleted || 0}/{intern.targetHours || 0}h</span>
                                                <span>({progress.toFixed(0)}%)</span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                        <Button
                            onClick={loadReports}
                            disabled={selectedInterns.size === 0 || isLoadingReports}
                            variant="outline"
                        >
                            {isLoadingReports && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Preview Reports
                        </Button>
                        <Button
                            onClick={downloadBulkPDF}
                            disabled={selectedInterns.size === 0 || isDownloading}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                        >
                            {isDownloading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF ({selectedInterns.size})
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Report Preview */}
            {reports.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-amber-500" />
                        Report Preview
                    </h3>

                    {reports.map((report) => (
                        <Card key={report.user._id} className="border-border/50 bg-card/50">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base">{report.user.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{report.user.email}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => downloadSinglePDF(report.user._id, report.user.name)}
                                        disabled={isDownloading}
                                    >
                                        <Download className="h-4 w-4 mr-1" />
                                        PDF
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Progress</span>
                                        <span className="font-medium">{report.summary.progressPercentage.toFixed(1)}%</span>
                                    </div>
                                    <Progress value={report.summary.progressPercentage} className="h-2" />
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="p-3 bg-muted/30 rounded-lg text-center">
                                        <Clock className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                                        <p className="text-lg font-bold">{report.summary.totalHoursCompleted}</p>
                                        <p className="text-xs text-muted-foreground">Hours Done</p>
                                    </div>
                                    <div className="p-3 bg-amber-500/10 rounded-lg text-center">
                                        <Clock className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                                        <p className="text-lg font-bold">{report.summary.remainingHours}</p>
                                        <p className="text-xs text-muted-foreground">Remaining</p>
                                    </div>
                                    <div className="p-3 bg-emerald-500/10 rounded-lg text-center">
                                        <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
                                        <p className="text-lg font-bold">{report.summary.totalDaysValidated}</p>
                                        <p className="text-xs text-muted-foreground">Validated</p>
                                    </div>
                                    <div className="p-3 bg-purple-500/10 rounded-lg text-center">
                                        <Star className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                                        <p className="text-lg font-bold">{report.summary.totalSpecialWorkdays}</p>
                                        <p className="text-xs text-muted-foreground">Special Days</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

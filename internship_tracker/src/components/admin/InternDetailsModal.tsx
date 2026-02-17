import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { adminApi } from '@/lib/api';
import type { User, DailyLog } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    Loader2, Calendar, Clock, CheckCircle2, XCircle,
    FileText, AlertCircle, Star, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

interface InternDetailsModalProps {
    intern: User | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: () => void;
}

export function InternDetailsModal({ intern, isOpen, onClose, onUpdate }: InternDetailsModalProps) {
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
    const [validationNotes, setValidationNotes] = useState('');
    const [expandedLog, setExpandedLog] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    useEffect(() => {
        if (intern && isOpen) {
            fetchLogs();
        }
    }, [intern, isOpen]);

    const fetchLogs = async () => {
        if (!intern) return;
        setIsLoading(true);
        try {
            const data = await adminApi.getInternLogs(intern._id);
            setLogs(data.logs);
        } catch (error) {
            toast.error('Failed to fetch intern logs');
        } finally {
            setIsLoading(false);
        }
    };

    const handleValidate = async (log: DailyLog) => {
        if (!intern) return;
        setIsValidating(true);
        try {
            const dateStr = log.date.split('T')[0];
            await adminApi.validateLog(intern._id, dateStr, validationNotes);
            toast.success('Log validated');
            setValidationNotes('');
            fetchLogs();
            onUpdate?.();
        } catch (error) {
            toast.error('Failed to validate log');
        } finally {
            setIsValidating(false);
        }
    };

    const handleInvalidate = async (log: DailyLog, reason: string) => {
        if (!intern) return;
        try {
            const dateStr = log.date.split('T')[0];
            await adminApi.invalidateLog(intern._id, dateStr, reason);
            toast.success('Validation removed');
            fetchLogs();
            onUpdate?.();
        } catch (error) {
            toast.error('Failed to invalidate log');
        }
    };

    const handleBulkValidate = async () => {
        if (!intern || selectedLogs.size === 0) return;
        setIsValidating(true);
        try {
            const dates = Array.from(selectedLogs);
            await adminApi.validateLogsBulk(intern._id, dates, validationNotes);
            toast.success(`${dates.length} logs validated`);
            setSelectedLogs(new Set());
            setValidationNotes('');
            fetchLogs();
            onUpdate?.();
        } catch (error) {
            toast.error('Failed to bulk validate');
        } finally {
            setIsValidating(false);
        }
    };

    const handleToggleSpecialWorkday = async (log: DailyLog) => {
        if (!intern) return;
        try {
            const dateStr = log.date.split('T')[0];
            if (log.isSpecialWorkday) {
                await adminApi.removeSpecialWorkday(intern._id, dateStr);
                toast.success('Special workday status removed');
            } else {
                await adminApi.markSpecialWorkday(intern._id, dateStr, {
                    reason: 'Weekend/Holiday work',
                    hoursWorked: log.hoursWorked,
                });
                toast.success('Marked as special workday');
            }
            fetchLogs();
            onUpdate?.();
        } catch (error) {
            toast.error('Failed to update special workday status');
        }
    };

    const toggleLogSelection = (dateStr: string) => {
        const newSet = new Set(selectedLogs);
        if (newSet.has(dateStr)) {
            newSet.delete(dateStr);
        } else {
            newSet.add(dateStr);
        }
        setSelectedLogs(newSet);
    };

    const selectAllPending = () => {
        const pending = logs
            .filter(l => l.status === 'completed' && !l.isValidated)
            .map(l => l.date.split('T')[0]);
        setSelectedLogs(new Set(pending));
    };

    const completedLogs = logs.filter(l => l.status === 'completed');
    const validatedCount = completedLogs.filter(l => l.isValidated).length;
    const pendingCount = completedLogs.length - validatedCount;

    if (!intern) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-amber-500" />
                        {intern.name}'s Work Logs
                    </DialogTitle>
                </DialogHeader>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 py-2">
                    <Card className="border-border/50">
                        <CardContent className="py-3 px-4 text-center">
                            <p className="text-2xl font-bold text-foreground">{completedLogs.length}</p>
                            <p className="text-xs text-muted-foreground">Total Days</p>
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-500/30 bg-emerald-500/5">
                        <CardContent className="py-3 px-4 text-center">
                            <p className="text-2xl font-bold text-emerald-500">{validatedCount}</p>
                            <p className="text-xs text-muted-foreground">Validated</p>
                        </CardContent>
                    </Card>
                    <Card className="border-amber-500/30 bg-amber-500/5">
                        <CardContent className="py-3 px-4 text-center">
                            <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
                            <p className="text-xs text-muted-foreground">Pending</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Bulk Actions */}
                {pendingCount > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={selectAllPending}
                        >
                            Select All Pending ({pendingCount})
                        </Button>
                        {selectedLogs.size > 0 && (
                            <>
                                <Input
                                    placeholder="Validation notes (optional)"
                                    value={validationNotes}
                                    onChange={(e) => setValidationNotes(e.target.value)}
                                    className="flex-1 h-8 text-sm"
                                />
                                <Button
                                    size="sm"
                                    onClick={handleBulkValidate}
                                    disabled={isValidating}
                                    className="bg-emerald-500 hover:bg-emerald-600"
                                >
                                    {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    Validate {selectedLogs.size} Selected
                                </Button>
                            </>
                        )}
                    </div>
                )}

                {/* Logs List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                        </div>
                    ) : completedLogs.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No completed logs found
                        </div>
                    ) : (
                        completedLogs.map((log) => {
                            const dateStr = log.date.split('T')[0];
                            const isExpanded = expandedLog === dateStr;
                            const isSelected = selectedLogs.has(dateStr);

                            return (
                                <Card
                                    key={dateStr}
                                    className={`border transition-colors ${
                                        log.isValidated
                                            ? 'border-emerald-500/30 bg-emerald-500/5'
                                            : isSelected
                                            ? 'border-amber-500/50 bg-amber-500/10'
                                            : 'border-border/50'
                                    }`}
                                >
                                    <CardContent className="p-3">
                                        <div className="flex items-center gap-3">
                                            {/* Checkbox */}
                                            {!log.isValidated && (
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleLogSelection(dateStr)}
                                                    className="h-4 w-4 rounded border-gray-300"
                                                />
                                            )}

                                            {/* Date */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {format(new Date(log.date), 'MMM d, yyyy (EEEE)')}
                                                    </span>
                                                    {log.isSpecialWorkday && (
                                                        <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-500">
                                                            <Star className="h-3 w-3 mr-1" />
                                                            Special
                                                        </Badge>
                                                    )}
                                                    {log.isValidated ? (
                                                        <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30">
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            Validated
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="border-amber-500/50 text-amber-500">
                                                            <AlertCircle className="h-3 w-3 mr-1" />
                                                            Pending
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {log.hoursWorked}h
                                                    </span>
                                                    {log.tasks && (
                                                        <span className="flex items-center gap-1 truncate max-w-md">
                                                            <FileText className="h-3 w-3" />
                                                            {log.tasks.substring(0, 50)}{log.tasks.length > 50 ? '...' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleToggleSpecialWorkday(log)}
                                                    title={log.isSpecialWorkday ? 'Remove special workday' : 'Mark as special workday'}
                                                    className={log.isSpecialWorkday 
                                                        ? 'text-purple-500 hover:text-purple-600 hover:bg-purple-500/10' 
                                                        : 'text-muted-foreground hover:text-purple-500 hover:bg-purple-500/10'}
                                                >
                                                    <Star className={`h-4 w-4 ${log.isSpecialWorkday ? 'fill-current' : ''}`} />
                                                </Button>
                                                {!log.isValidated && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleValidate(log)}
                                                        disabled={isValidating}
                                                        className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {log.isValidated && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleInvalidate(log, 'Removed by admin')}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setExpandedLog(isExpanded ? null : dateStr)}
                                                >
                                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground uppercase">Tasks</p>
                                                    <p className="text-sm mt-1 whitespace-pre-wrap">{log.tasks || 'No tasks recorded'}</p>
                                                </div>
                                                {log.isValidated && log.validationNotes && (
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground uppercase">Validation Notes</p>
                                                        <p className="text-sm mt-1 text-emerald-600">{log.validationNotes}</p>
                                                    </div>
                                                )}
                                                {log.isSpecialWorkday && log.specialWorkdayReason && (
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground uppercase">Special Workday Reason</p>
                                                        <p className="text-sm mt-1 text-purple-600">{log.specialWorkdayReason}</p>
                                                    </div>
                                                )}
                                                {!log.isValidated && (
                                                    <div className="flex gap-2 mt-2">
                                                        <Textarea
                                                            placeholder="Add validation notes..."
                                                            value={validationNotes}
                                                            onChange={(e) => setValidationNotes(e.target.value)}
                                                            className="flex-1 text-sm h-16"
                                                        />
                                                        <Button
                                                            onClick={() => handleValidate(log)}
                                                            disabled={isValidating}
                                                            className="bg-emerald-500 hover:bg-emerald-600"
                                                        >
                                                            Validate
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

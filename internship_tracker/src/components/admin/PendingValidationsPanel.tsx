import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { adminApi } from '@/lib/api';
import type { DailyLog, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Loader2, CheckCircle2, Clock, ChevronDown, ChevronUp,
    List, Grid3X3, AlertCircle, User as UserIcon, Calendar, Star
} from 'lucide-react';
import { toast } from 'sonner';

interface PendingValidationsPanelProps {
    onSelectIntern?: (intern: User) => void;
    onRefresh?: () => void;
}

interface GroupedPending {
    intern: { _id: string; name: string; email: string };
    logs: DailyLog[];
}

export function PendingValidationsPanel({ onSelectIntern, onRefresh }: PendingValidationsPanelProps) {
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [grouped, setGrouped] = useState<GroupedPending[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');
    const [expandedInterns, setExpandedInterns] = useState<Set<string>>(new Set());
    const [validatingLogs, setValidatingLogs] = useState<Set<string>>(new Set());
    const [validationNotes, setValidationNotes] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchPendingValidations();
    }, []);

    const fetchPendingValidations = async () => {
        setIsLoading(true);
        try {
            const data = await adminApi.getAllPendingValidations();
            setLogs(data.logs);

            // Process grouped data
            const groupedArray: GroupedPending[] = [];
            for (const [internId, internLogs] of Object.entries(data.grouped)) {
                const firstLog = internLogs[0];
                const internInfo = (firstLog as any).userId;
                if (internInfo && typeof internInfo === 'object') {
                    groupedArray.push({
                        intern: {
                            _id: internInfo._id || internId,
                            name: internInfo.name || 'Unknown',
                            email: internInfo.email || ''
                        },
                        logs: internLogs
                    });
                }
            }
            // Sort by number of pending logs (most first)
            groupedArray.sort((a, b) => b.logs.length - a.logs.length);
            setGrouped(groupedArray);
        } catch (error) {
            toast.error('Failed to fetch pending validations');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickValidate = async (internId: string, log: DailyLog) => {
        const dateStr = log.date.split('T')[0];
        const logKey = `${internId}-${dateStr}`;
        
        setValidatingLogs(prev => new Set(prev).add(logKey));
        try {
            const notes = validationNotes[logKey] || '';
            await adminApi.validateLog(internId, dateStr, notes);
            toast.success('Log validated');
            // Remove from local state
            setLogs(prev => prev.filter(l => !(l.date.split('T')[0] === dateStr && ((l as any).userId?._id || (l as any).userId) === internId)));
            setGrouped(prev => prev.map(g => 
                g.intern._id === internId 
                    ? { ...g, logs: g.logs.filter(l => l.date.split('T')[0] !== dateStr) }
                    : g
            ).filter(g => g.logs.length > 0));
            onRefresh?.();
        } catch (error) {
            toast.error('Failed to validate log');
        } finally {
            setValidatingLogs(prev => {
                const next = new Set(prev);
                next.delete(logKey);
                return next;
            });
        }
    };

    const toggleInternExpanded = (internId: string) => {
        setExpandedInterns(prev => {
            const next = new Set(prev);
            if (next.has(internId)) {
                next.delete(internId);
            } else {
                next.add(internId);
            }
            return next;
        });
    };

    const totalPending = logs.length;
    const internsWithPending = grouped.length;

    if (isLoading) {
        return (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="py-12 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with stats */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-500" />
                        Pending Validations
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {totalPending} logs from {internsWithPending} intern{internsWithPending !== 1 ? 's' : ''} need validation
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'grouped' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grouped')}
                    >
                        <Grid3X3 className="h-4 w-4 mr-1" />
                        Grouped
                    </Button>
                    <Button
                        variant={viewMode === 'flat' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('flat')}
                    >
                        <List className="h-4 w-4 mr-1" />
                        Chronological
                    </Button>
                    <Button variant="outline" size="sm" onClick={fetchPendingValidations}>
                        Refresh
                    </Button>
                </div>
            </div>

            {totalPending === 0 ? (
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="py-12 text-center">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500 opacity-50" />
                        <p className="text-muted-foreground">All logs are validated!</p>
                        <p className="text-sm text-muted-foreground">Great job keeping up with validations.</p>
                    </CardContent>
                </Card>
            ) : viewMode === 'grouped' ? (
                /* Grouped View */
                <div className="space-y-3">
                    {grouped.map(({ intern, logs: internLogs }) => {
                        const isExpanded = expandedInterns.has(intern._id);
                        return (
                            <Card key={intern._id} className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                                <div
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                                    onClick={() => toggleInternExpanded(intern._id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-medium">
                                            {intern.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium">{intern.name}</p>
                                            <p className="text-sm text-muted-foreground">{intern.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="border-amber-500/50 text-amber-500">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            {internLogs.length} pending
                                        </Badge>
                                        {isExpanded ? (
                                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="border-t border-border/50 p-4 space-y-2 bg-muted/10">
                                        {internLogs.map(log => {
                                            const dateStr = log.date.split('T')[0];
                                            const logKey = `${intern._id}-${dateStr}`;
                                            const isValidating = validatingLogs.has(logKey);

                                            return (
                                                <div
                                                    key={dateStr}
                                                    className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/50"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <p className="font-medium text-sm">
                                                                {format(new Date(log.date), 'MMM d, yyyy (EEEE)')}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {log.hoursWorked}h logged
                                                                {log.isSpecialWorkday && (
                                                                    <span className="ml-2 text-purple-500">
                                                                        <Star className="h-3 w-3 inline mr-1" />
                                                                        Special
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            placeholder="Notes..."
                                                            value={validationNotes[logKey] || ''}
                                                            onChange={(e) => setValidationNotes(prev => ({ ...prev, [logKey]: e.target.value }))}
                                                            className="w-32 h-8 text-xs"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleQuickValidate(intern._id, log);
                                                            }}
                                                            disabled={isValidating}
                                                            className="bg-emerald-500 hover:bg-emerald-600 h-8"
                                                        >
                                                            {isValidating ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <CheckCircle2 className="h-3 w-3" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full mt-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectIntern?.({ _id: intern._id, name: intern.name, email: intern.email } as User);
                                            }}
                                        >
                                            <UserIcon className="h-4 w-4 mr-2" />
                                            View Full Intern Details
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            ) : (
                /* Flat Chronological View */
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">All Pending Logs (Newest First)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {logs.map((log, index) => {
                            const intern = (log as any).userId;
                            const internId = intern?._id || intern;
                            const internName = intern?.name || 'Unknown';
                            const dateStr = log.date.split('T')[0];
                            const logKey = `${internId}-${dateStr}`;
                            const isValidating = validatingLogs.has(logKey);

                            return (
                                <div
                                    key={`${internId}-${dateStr}-${index}`}
                                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-medium">
                                            {internName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{internName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(log.date), 'MMM d, yyyy')} • {log.hoursWorked}h
                                                {log.isSpecialWorkday && (
                                                    <span className="ml-2 text-purple-500">
                                                        <Star className="h-3 w-3 inline" />
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            placeholder="Notes..."
                                            value={validationNotes[logKey] || ''}
                                            onChange={(e) => setValidationNotes(prev => ({ ...prev, [logKey]: e.target.value }))}
                                            className="w-32 h-8 text-xs"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() => handleQuickValidate(internId, log)}
                                            disabled={isValidating}
                                            className="bg-emerald-500 hover:bg-emerald-600 h-8"
                                        >
                                            {isValidating ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="h-3 w-3" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

import { useState } from 'react';
import { format } from 'date-fns';
import { adminApi } from '@/lib/api';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, Star, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface SpecialWorkdayModalProps {
    intern: User | null;
    selectedDate: Date | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: () => void;
}

export function SpecialWorkdayModal({ intern, selectedDate, isOpen, onClose, onUpdate }: SpecialWorkdayModalProps) {
    const [reason, setReason] = useState('Weekend/Holiday work');
    const [hoursWorked, setHoursWorked] = useState(8);
    const [tasks, setTasks] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!intern || !selectedDate) return;
        setIsSaving(true);
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            await adminApi.markSpecialWorkday(intern._id, dateStr, {
                reason,
                hoursWorked,
                tasks,
            });
            toast.success('Special workday marked');
            onUpdate?.();
            onClose();
            // Reset form
            setReason('Weekend/Holiday work');
            setHoursWorked(8);
            setTasks('');
        } catch (error) {
            toast.error('Failed to mark special workday');
        } finally {
            setIsSaving(false);
        }
    };

    if (!intern || !selectedDate) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-purple-500" />
                        Mark Special Workday
                    </DialogTitle>
                    <DialogDescription>
                        Mark {format(selectedDate, 'MMMM d, yyyy (EEEE)')} as a worked day for {intern.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-center gap-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                        <Calendar className="h-5 w-5 text-purple-500" />
                        <div>
                            <p className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                            <p className="text-xs text-muted-foreground">This is typically an off day (weekend/holiday)</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Reason</Label>
                        <Input
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., Weekend makeup, Holiday OT"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Hours Worked</Label>
                        <Input
                            type="number"
                            min={0}
                            max={24}
                            value={hoursWorked}
                            onChange={(e) => setHoursWorked(Number(e.target.value))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tasks (optional)</Label>
                        <Textarea
                            value={tasks}
                            onChange={(e) => setTasks(e.target.value)}
                            placeholder="What was accomplished on this day..."
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-purple-500 hover:bg-purple-600"
                    >
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Mark as Workday
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

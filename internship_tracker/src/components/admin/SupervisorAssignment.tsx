import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, Users, Check } from 'lucide-react';
import { toast } from 'sonner';

interface SupervisorAssignmentProps {
    intern: User | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: () => void;
}

export function SupervisorAssignment({ intern, isOpen, onClose, onUpdate }: SupervisorAssignmentProps) {
    const [supervisors, setSupervisors] = useState<User[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchSupervisors();
        }
    }, [isOpen]);

    useEffect(() => {
        if (intern?.supervisors) {
            setSelectedIds(new Set(intern.supervisors));
        } else {
            setSelectedIds(new Set());
        }
    }, [intern]);

    const fetchSupervisors = async () => {
        setIsLoading(true);
        try {
            const data = await adminApi.getSupervisors();
            setSupervisors(data);
        } catch (error) {
            toast.error('Failed to fetch supervisors');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSupervisor = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleSave = async () => {
        if (!intern) return;
        setIsSaving(true);
        try {
            await adminApi.assignSupervisors(intern._id, Array.from(selectedIds));
            toast.success('Supervisors assigned');
            onUpdate?.();
            onClose();
        } catch (error) {
            toast.error('Failed to assign supervisors');
        } finally {
            setIsSaving(false);
        }
    };

    if (!intern) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        Assign Supervisors to {intern.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        </div>
                    ) : supervisors.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                            No supervisors available
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {supervisors.map((supervisor) => {
                                const isSelected = selectedIds.has(supervisor._id);
                                return (
                                    <button
                                        key={supervisor._id}
                                        onClick={() => toggleSupervisor(supervisor._id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                                            isSelected
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : 'border-border/50 hover:border-blue-500/50 hover:bg-muted/50'
                                        }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                            isSelected ? 'bg-blue-500 text-white' : 'bg-muted'
                                        }`}>
                                            {isSelected && <Check className="h-4 w-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{supervisor.name}</p>
                                            <p className="text-xs text-muted-foreground">{supervisor.email}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded ${
                                            supervisor.role === 'admin'
                                                ? 'bg-amber-500/15 text-amber-500'
                                                : 'bg-blue-500/15 text-blue-500'
                                        }`}>
                                            {supervisor.role}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save ({selectedIds.size} selected)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

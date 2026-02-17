import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import type { Department } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader,
    DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Loader2, User, Mail, Building2, Lock, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DEPARTMENTS: { value: string; label: string }[] = [
    { value: 'none', label: 'Not Assigned' },
    { value: 'Creative & Marketing Support Associates', label: 'Creative & Marketing Support' },
    { value: 'Recruitment Support Interns', label: 'Recruitment Support' },
    { value: 'IT Support Interns', label: 'IT Support' },
];

export function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
    const { user, refreshUser } = useAuth();
    const [name, setName] = useState('');
    const [department, setDepartment] = useState<string>('none');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);

    useEffect(() => {
        if (user && isOpen) {
            setName(user.name || '');
            setDepartment(user.department || 'none');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordSection(false);
        }
    }, [user, isOpen]);

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Name is required');
            return;
        }

        // Validate password fields if trying to change password
        if (showPasswordSection && (currentPassword || newPassword || confirmPassword)) {
            if (!currentPassword || !newPassword) {
                toast.error('Please fill in both current and new password');
                return;
            }
            if (newPassword.length < 6) {
                toast.error('New password must be at least 6 characters');
                return;
            }
            if (newPassword !== confirmPassword) {
                toast.error('New passwords do not match');
                return;
            }
        }

        setIsLoading(true);
        try {
            const updateData: { name?: string; department?: Department; currentPassword?: string; newPassword?: string } = {
                name: name.trim(),
                department: (department === 'none' ? '' : department) as Department,
            };

            if (showPasswordSection && currentPassword && newPassword) {
                updateData.currentPassword = currentPassword;
                updateData.newPassword = newPassword;
            }

            await authApi.updateProfile(updateData);
            await refreshUser();
            toast.success('Profile updated successfully');
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.error || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin': return 'Main Admin';
            case 'sub-admin': return 'Supervisor';
            default: return 'Intern';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-amber-500" />
                        Profile Settings
                    </DialogTitle>
                    <DialogDescription>
                        Update your profile information
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Email (read-only) */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            Email
                        </Label>
                        <Input
                            value={user?.email || ''}
                            disabled
                            className="bg-muted/50"
                        />
                        <p className="text-xs text-muted-foreground">
                            Email cannot be changed • Role: {getRoleLabel(user?.role || '')}
                        </p>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Name
                        </Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Department
                        </Label>
                        <Select value={department} onValueChange={setDepartment} disabled={isLoading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                {DEPARTMENTS.map((dept) => (
                                    <SelectItem key={dept.value} value={dept.value}>
                                        {dept.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Change Password Section */}
                    <div className="border-t pt-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPasswordSection(!showPasswordSection)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Lock className="h-4 w-4 mr-2" />
                            {showPasswordSection ? 'Cancel Password Change' : 'Change Password'}
                        </Button>

                        {showPasswordSection && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 mt-3"
                            >
                                <div className="space-y-2">
                                    <Label>Current Password</Label>
                                    <Input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>New Password</Label>
                                    <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password (min. 6 chars)"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Confirm New Password</Label>
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        disabled={isLoading}
                                    />
                                    {newPassword && confirmPassword && newPassword === confirmPassword && (
                                        <p className="text-xs text-emerald-500 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" /> Passwords match
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

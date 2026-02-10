import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/lib/api';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader,
    DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
    Users, Shield, ShieldCheck, UserPlus, Trash2, Search,
    ArrowLeft, Loader2, ToggleLeft, ToggleRight,
    Crown, UserCog, GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminPage() {
    const { user: currentUser, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newSubAdmin, setNewSubAdmin] = useState({ name: '', email: '', password: '' });
    const [isCreating, setIsCreating] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            const data = await adminApi.getUsers();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            setFilteredUsers(
                users.filter(
                    (u) =>
                        u.name.toLowerCase().includes(q) ||
                        u.email.toLowerCase().includes(q) ||
                        u.role.toLowerCase().includes(q)
                )
            );
        } else {
            setFilteredUsers(users);
        }
    }, [searchQuery, users]);

    const handleToggleActive = async (userId: string, currentStatus: boolean) => {
        try {
            await adminApi.updateUser(userId, { isActive: !currentStatus });
            setUsers((prev) =>
                prev.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus } : u))
            );
            toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
        } catch (error: any) {
            toast.error(error?.response?.data?.error || 'Failed to update user');
        }
    };

    const handleChangeRole = async (userId: string, newRole: string) => {
        try {
            await adminApi.updateUserRole(userId, newRole);
            setUsers((prev) =>
                prev.map((u) => (u._id === userId ? { ...u, role: newRole as User['role'] } : u))
            );
            toast.success(`Role changed to ${newRole}`);
        } catch (error: any) {
            toast.error(error?.response?.data?.error || 'Failed to change role');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            await adminApi.deleteUser(userId);
            setUsers((prev) => prev.filter((u) => u._id !== userId));
            toast.success('User deleted');
        } catch (error: any) {
            toast.error(error?.response?.data?.error || 'Failed to delete user');
        }
    };

    const handleCreateSubAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubAdmin.name || !newSubAdmin.email || !newSubAdmin.password) {
            toast.error('All fields are required');
            return;
        }
        if (newSubAdmin.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsCreating(true);
        try {
            const created = await adminApi.createSubAdmin(newSubAdmin);
            setUsers((prev) => [created, ...prev]);
            setNewSubAdmin({ name: '', email: '', password: '' });
            setIsCreateOpen(false);
            toast.success('Sub-admin created successfully');
        } catch (error: any) {
            toast.error(error?.response?.data?.error || 'Failed to create sub-admin');
        } finally {
            setIsCreating(false);
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Crown className="h-4 w-4 text-amber-500" />;
            case 'sub-admin': return <ShieldCheck className="h-4 w-4 text-blue-500" />;
            default: return <GraduationCap className="h-4 w-4 text-emerald-500" />;
        }
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-amber-500/15 text-amber-500 border-amber-500/30';
            case 'sub-admin': return 'bg-blue-500/15 text-blue-500 border-blue-500/30';
            default: return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
        }
    };

    const stats = {
        total: users.length,
        admins: users.filter((u) => u.role === 'admin' || u.role === 'sub-admin').length,
        interns: users.filter((u) => u.role === 'intern').length,
        active: users.filter((u) => u.isActive).length,
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-br from-amber-500/8 to-yellow-500/4 blur-3xl"
                />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/')}
                            className="hover:bg-amber-500/10"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-amber-500" />
                            <h1 className="text-lg font-bold">Admin Dashboard</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getRoleIcon(currentUser?.role || 'intern')}
                        <span>{currentUser?.name}</span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Users', value: stats.total, icon: Users, color: 'text-foreground' },
                        { label: 'Admins', value: stats.admins, icon: ShieldCheck, color: 'text-blue-500' },
                        { label: 'Interns', value: stats.interns, icon: GraduationCap, color: 'text-emerald-500' },
                        { label: 'Active', value: stats.active, icon: ToggleRight, color: 'text-amber-500' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                                <CardContent className="pt-4 pb-4 px-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                                        </div>
                                        <stat.icon className={`h-8 w-8 ${stat.color} opacity-50`} />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or role..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-background/50"
                        />
                    </div>
                    {isAdmin && (
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Create Sub-Admin
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Create Sub-Admin Account</DialogTitle>
                                    <DialogDescription>
                                        Sub-admins can view intern accounts and toggle their active status.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateSubAdmin} className="space-y-4 mt-2">
                                    <Input
                                        placeholder="Full Name"
                                        value={newSubAdmin.name}
                                        onChange={(e) => setNewSubAdmin({ ...newSubAdmin, name: e.target.value })}
                                    />
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        value={newSubAdmin.email}
                                        onChange={(e) => setNewSubAdmin({ ...newSubAdmin, email: e.target.value })}
                                    />
                                    <Input
                                        type="password"
                                        placeholder="Password (min. 6 chars)"
                                        value={newSubAdmin.password}
                                        onChange={(e) => setNewSubAdmin({ ...newSubAdmin, password: e.target.value })}
                                    />
                                    <DialogFooter>
                                        <Button type="submit" disabled={isCreating}>
                                            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Create Sub-Admin
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {/* Users Table */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <UserCog className="h-4 w-4 text-amber-500" />
                            User Accounts ({filteredUsers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                {searchQuery ? 'No users match your search' : 'No users found'}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/30">
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Email</th>
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                                            <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                                            <th className="text-center py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Hours</th>
                                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {filteredUsers.map((user, i) => (
                                                <motion.tr
                                                    key={user._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    transition={{ delay: i * 0.03 }}
                                                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                                                >
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/10 flex items-center justify-center text-xs font-bold text-amber-500">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{user.name}</p>
                                                                <p className="text-xs text-muted-foreground md:hidden">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{user.email}</td>
                                                    <td className="py-3 px-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleBadgeClass(user.role)}`}>
                                                            {getRoleIcon(user.role)}
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        {user.isActive ? (
                                                            <span className="inline-flex items-center gap-1 text-emerald-500 text-xs">
                                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-red-500 text-xs">
                                                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-center hidden lg:table-cell">
                                                        <span className="text-xs font-mono">
                                                            {user.totalHoursCompleted ?? 0}/{user.targetHours ?? 0}h
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {/* Toggle Active - admin and sub-admin can do this */}
                                                            {user.role !== 'admin' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => handleToggleActive(user._id, user.isActive)}
                                                                    title={user.isActive ? 'Deactivate' : 'Activate'}
                                                                >
                                                                    {user.isActive ? (
                                                                        <ToggleRight className="h-4 w-4 text-emerald-500" />
                                                                    ) : (
                                                                        <ToggleLeft className="h-4 w-4 text-red-500" />
                                                                    )}
                                                                </Button>
                                                            )}

                                                            {/* Change Role - main admin only */}
                                                            {isAdmin && user.role !== 'admin' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() =>
                                                                        handleChangeRole(
                                                                            user._id,
                                                                            user.role === 'intern' ? 'sub-admin' : 'intern'
                                                                        )
                                                                    }
                                                                    title={`Change to ${user.role === 'intern' ? 'sub-admin' : 'intern'}`}
                                                                >
                                                                    <Shield className="h-4 w-4 text-blue-500" />
                                                                </Button>
                                                            )}

                                                            {/* Delete - main admin only */}
                                                            {isAdmin && user.role !== 'admin' && (
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                This will permanently delete <strong>{user.name}</strong> and all their data (settings, logs). This action cannot be undone.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleDeleteUser(user._id)}
                                                                                className="bg-red-500 hover:bg-red-600"
                                                                            >
                                                                                Delete
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

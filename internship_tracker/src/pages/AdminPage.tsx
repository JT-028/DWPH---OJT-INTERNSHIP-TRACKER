import { useState, useEffect, useCallback } from 'react';
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
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    Users, Shield, ShieldCheck, UserPlus, Trash2, Search,
    Loader2, ToggleLeft, ToggleRight, LogOut,
    Crown, UserCog, GraduationCap, Eye, FileText, UserCheck, Clock, Settings, Building2, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ProfileSettingsModal } from '@/components/ProfileSettingsModal';
import {
    InternDetailsModal,
    SupervisorAssignment,
    ReportsPanel,
    PendingValidationsPanel
} from '@/components/admin';

export function AdminPage() {
    const { user: currentUser, isAdmin, logout } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'reports'>('pending');
    const [selectedIntern, setSelectedIntern] = useState<User | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isSupervisorOpen, setIsSupervisorOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newSubAdmin, setNewSubAdmin] = useState({ name: '', email: '', password: '' });
    const [isCreating, setIsCreating] = useState(false);
    const [isSelfAssigning, setIsSelfAssigning] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

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
        let filtered = users;

        // Apply search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (u) =>
                    u.name.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q) ||
                    u.role.toLowerCase().includes(q)
            );
        }

        // Apply department filter
        if (departmentFilter !== 'all') {
            filtered = filtered.filter((u) => {
                if (departmentFilter === 'none') {
                    return !u.department;
                }
                return u.department === departmentFilter;
            });
        }

        setFilteredUsers(filtered);
    }, [searchQuery, departmentFilter, users]);

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

    const handleSelfAssignAll = async (onlyUnassigned: boolean) => {
        setIsSelfAssigning(true);
        try {
            const result = await adminApi.selfAssignAll(onlyUnassigned);
            toast.success(`Assigned self as supervisor to ${result.assignedCount} intern(s)`);
            fetchUsers(); // Refresh the user list
        } catch (error: any) {
            toast.error(error?.response?.data?.error || 'Failed to bulk assign');
        } finally {
            setIsSelfAssigning(false);
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
            {/* Animated background elements & Base Background Color - Matching Intern Design */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.03, 0.06, 0.03],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.04, 0.08, 0.04],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-green rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.02, 0.05, 0.02],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                    className="absolute top-1/3 left-1/3 w-1/3 h-1/3 bg-amber rounded-full blur-3xl"
                />

                {/* Paper plane background overlay - Repeating pattern */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: 'url("/Paper_plane.png")',
                        backgroundSize: '500px 500px',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'repeat',
                        filter: 'invert(1) opacity(0.06)',
                    }}
                />
                {/* Additional layer for dark mode - inverts back */}
                <div
                    className="absolute inset-0 pointer-events-none hidden dark:block"
                    style={{
                        backgroundImage: 'url("/Paper_plane.png")',
                        backgroundSize: '500px 500px',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'repeat',
                        opacity: 0.04,
                    }}
                />
            </div>

            {/* Header - Matching Intern Design */}
            <header className="sticky top-0 z-40 w-full bg-amber dark:bg-amber shadow-lg transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
                    {/* Left Side - Title */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 12 }}
                        className="flex items-center gap-2 flex-1"
                    >
                        <div>
                            <h1 className="text-lg font-bold text-white">
                                Admin Dashboard
                            </h1>
                            <p className="text-xs text-white/70">
                                Manage users & validate logs 🛡️
                            </p>
                        </div>
                    </motion.div>

                    {/* Center - Logo (pops out) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.1 }}
                        className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative"
                        >
                            {/* Outer ring */}
                            <div className="w-60 h-28 rounded-[60px] bg-amber dark:bg-amber border-6 border-amber dark:border-amber flex items-center justify-center shadow-xl">
                                {/* Inner circle with logo */}
                                <div className="w-56 h-24 rounded-[56px] bg-white dark:bg-slate-100 flex items-center justify-center overflow-hidden shadow-inner">
                                    <img
                                        src="/dw-logo.png"
                                        alt="Digital Workforce"
                                        className="w-40 h-40 object-contain"
                                    />
                                </div>
                            </div>
                            {/* Glow effect */}
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute inset-0 bg-white/20 rounded-full blur-md -z-10"
                            />
                        </motion.div>
                    </motion.div>

                    {/* Right Side - Admin Controls & Theme Toggle */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 12 }}
                        className="flex-1 flex items-center justify-end gap-2"
                    >
                        <div className="flex items-center gap-1 text-white/80 text-xs">
                            {getRoleIcon(currentUser?.role || 'intern')}
                            <span className="hidden sm:inline">{currentUser?.name}</span>
                        </div>
                        {/* Profile Settings */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsProfileOpen(true)}
                            className="text-white/80 hover:text-white hover:bg-white/10 text-xs gap-1.5 h-8"
                            title="Profile Settings"
                        >
                            <Settings className="h-3.5 w-3.5" />
                        </Button>
                        <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 hover:bg-white/20 transition-colors duration-200">
                            <ThemeToggle />
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white/80 hover:text-white hover:bg-white/10 text-xs gap-1.5 h-8"
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Logout</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to logout? You will need to sign in again to access the admin dashboard.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => logout()}>
                                        Logout
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </motion.div>
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

                {/* Tab Navigation */}
                <div className="flex gap-2 border-b border-border/50">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                            activeTab === 'pending'
                                ? 'border-amber-500 text-amber-500'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Clock className="h-4 w-4 inline mr-2" />
                        Pending Validations
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                            activeTab === 'users'
                                ? 'border-amber-500 text-amber-500'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Users className="h-4 w-4 inline mr-2" />
                        User Management
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                            activeTab === 'reports'
                                ? 'border-amber-500 text-amber-500'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <FileText className="h-4 w-4 inline mr-2" />
                        Reports
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'pending' ? (
                    <PendingValidationsPanel 
                        onSelectIntern={(intern) => {
                            setSelectedIntern(intern);
                            setIsDetailsOpen(true);
                        }}
                        onRefresh={fetchUsers}
                    />
                ) : activeTab === 'reports' ? (
                    <ReportsPanel users={users} />
                ) : (
                <>
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, or role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-background/50"
                            />
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                <SelectTrigger className="bg-background/50">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="All Departments" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        <div className="flex items-center gap-2">
                                            <Filter className="h-4 w-4" />
                                            <span>All Departments</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="Creative & Marketing Support Associates">
                                        <span>Creative & Marketing Support</span>
                                    </SelectItem>
                                    <SelectItem value="Recruitment Support Interns">
                                        <span>Recruitment Support</span>
                                    </SelectItem>
                                    <SelectItem value="IT Support Interns">
                                        <span>IT Support</span>
                                    </SelectItem>
                                    <SelectItem value="none">
                                        <span>Not Assigned</span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {isAdmin && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handleSelfAssignAll(true)}
                                disabled={isSelfAssigning}
                                className="text-sm"
                            >
                                {isSelfAssigning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
                                Assign Self (Unassigned)
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleSelfAssignAll(false)}
                                disabled={isSelfAssigning}
                                className="text-sm"
                            >
                                {isSelfAssigning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
                                Assign Self (All)
                            </Button>
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
                        </div>
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
                                {searchQuery || departmentFilter !== 'all' ? 'No users match your filters' : 'No users found'}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/30">
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Email</th>
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden xl:table-cell">Department</th>
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
                                                    <td className="py-3 px-4 text-muted-foreground hidden xl:table-cell">
                                                        {user.department ? (
                                                            <span className="inline-flex items-center gap-1.5 text-xs">
                                                                <Building2 className="h-3 w-3" />
                                                                {user.department === 'Creative & Marketing Support Associates' ? 'Creative & Marketing' :
                                                                 user.department === 'Recruitment Support Interns' ? 'Recruitment' :
                                                                 user.department === 'IT Support Interns' ? 'IT Support' :
                                                                 user.department}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground/50">Not assigned</span>
                                                        )}
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
                                                            {/* View Logs - for interns only */}
                                                            {user.role === 'intern' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 hover:bg-amber-500/10"
                                                                    onClick={() => {
                                                                        setSelectedIntern(user);
                                                                        setIsDetailsOpen(true);
                                                                    }}
                                                                    title="View Logs"
                                                                >
                                                                    <Eye className="h-4 w-4 text-amber-500" />
                                                                </Button>
                                                            )}

                                                            {/* Assign Supervisor - main admin only, for interns */}
                                                            {isAdmin && user.role === 'intern' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 hover:bg-blue-500/10"
                                                                    onClick={() => {
                                                                        setSelectedIntern(user);
                                                                        setIsSupervisorOpen(true);
                                                                    }}
                                                                    title="Assign Supervisor"
                                                                >
                                                                    <UserCheck className="h-4 w-4 text-blue-500" />
                                                                </Button>
                                                            )}

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
                </>
                )}
            </main>

            {/* Modals */}
            <InternDetailsModal
                intern={selectedIntern}
                isOpen={isDetailsOpen}
                onClose={() => {
                    setIsDetailsOpen(false);
                    setSelectedIntern(null);
                }}
                onUpdate={fetchUsers}
            />

            <SupervisorAssignment
                intern={selectedIntern}
                isOpen={isSupervisorOpen}
                onClose={() => {
                    setIsSupervisorOpen(false);
                    setSelectedIntern(null);
                }}
                onUpdate={fetchUsers}
            />

            <ProfileSettingsModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
        </div>
    );
}

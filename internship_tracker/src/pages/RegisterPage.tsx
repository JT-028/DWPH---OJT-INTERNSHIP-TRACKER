import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus, Eye, EyeOff, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';

export function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!name || !email || !password || !confirmPassword) {
            setErrorMessage('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            setErrorMessage('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await register(name, email, password);
            toast.success('Account created successfully!');
            navigate('/');
        } catch (error: any) {
            const message = error?.response?.data?.error || 'Registration failed. Please try again.';
            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            {/* Animated background */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, -30, 0],
                        y: [0, 20, 0],
                    }}
                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full bg-gradient-to-br from-emerald-500/10 to-blue-500/5 blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.15, 1],
                        x: [0, 25, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full bg-gradient-to-tl from-amber-500/10 to-yellow-500/5 blur-3xl"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="text-center space-y-2">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25"
                        >
                            <UserPlus className="h-8 w-8 text-white" />
                        </motion.div>
                        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                        <CardDescription>Register to start tracking your internship</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Error Alert */}
                            <AnimatePresence>
                                {errorMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -10, height: 0 }}
                                        className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-3"
                                    >
                                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-red-500">Registration Failed</p>
                                            <p className="text-sm text-red-400">{errorMessage}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setErrorMessage(null)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-foreground">
                                    Full Name
                                </label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Juan Dela Cruz"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={isLoading}
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="register-email" className="text-sm font-medium text-foreground">
                                    Email
                                </label>
                                <Input
                                    id="register-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="register-password" className="text-sm font-medium text-foreground">
                                    Password
                                </label>
                                <div className="relative">
                                    <Input
                                        id="register-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Min. 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                        className="bg-background/50 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                                    Confirm Password
                                </label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="bg-background/50"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-200"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>
                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="font-semibold text-amber-500 hover:text-amber-400 transition-colors"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

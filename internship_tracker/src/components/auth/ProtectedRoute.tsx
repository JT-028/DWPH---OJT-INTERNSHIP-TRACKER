import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
    const { isAuthenticated, isAdminOrSubAdmin, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3"
                >
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </motion.div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdminOrSubAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

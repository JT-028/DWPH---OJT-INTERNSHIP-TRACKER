import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import App from '@/App';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { AdminPage } from '@/pages/AdminPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Component to redirect admins to /admin
function InternRoute({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    // Redirect admin/sub-admin to /admin
    if (user?.role === 'admin' || user?.role === 'sub-admin') {
        return <Navigate to="/admin" replace />;
    }
    
    return <>{children}</>;
}

export function AppRouter() {
    const { isAuthenticated, user } = useAuth();
    
    // Determine redirect destination based on role
    const defaultRoute = isAuthenticated && user 
        ? (user.role === 'admin' || user.role === 'sub-admin' ? '/admin' : '/')
        : '/';

    return (
        <Routes>
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to={defaultRoute} replace /> : <LoginPage />}
            />
            <Route
                path="/register"
                element={isAuthenticated ? <Navigate to={defaultRoute} replace /> : <RegisterPage />}
            />
            <Route
                path="/admin"
                element={
                    <ProtectedRoute adminOnly>
                        <AdminPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/"
                element={
                    <InternRoute>
                        <App />
                    </InternRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

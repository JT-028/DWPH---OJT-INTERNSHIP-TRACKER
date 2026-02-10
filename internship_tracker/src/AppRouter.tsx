import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import App from '@/App';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { AdminPage } from '@/pages/AdminPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function AppRouter() {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
            />
            <Route
                path="/register"
                element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
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
                    <ProtectedRoute>
                        <App />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = user?.roles?.some((role) => allowedRoles.includes(role)) || user?.roles?.includes('Admin');
    if (!hasRole) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-slate-800">Không có quyền truy cập</h2>
          <p className="text-slate-500 mt-2">Bạn không có quyền thực hiện chức năng này.</p>
        </div>
      );
    }
  }

  return children;
}

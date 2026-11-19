import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Dashboard from '../pages/dashboard/Dashboard';
import OffboardingList from '../pages/offboarding/OffboardingList';
import OffboardingCreate from '../pages/offboarding/OffboardingCreate';
import OffboardingDetail from '../pages/offboarding/OffboardingDetail';
import EmployeeList from '../pages/employees/EmployeeList';
import UserList from '../pages/users/UserList';
import AssetList from '../pages/assets/AssetList';
import AccessList from '../pages/access/AccessList';
import TaskList from '../pages/tasks/TaskList';
import HandoverList from '../pages/handovers/HandoverList';
import TemplateList from '../pages/templates/TemplateList';
import ApprovalList from '../pages/approvals/ApprovalList';
import AIAssistant from '../pages/ai/AIAssistant';
import Reports from '../pages/reports/Reports';
import Settings from '../pages/settings/Settings';
import ResignationList from '../pages/resignation/ResignationList';
import FinanceList from '../pages/finance/FinanceList';
import ExceptionList from '../pages/exceptions/ExceptionList';
import AuditLogList from '../pages/audit/AuditLogList';
import Profile from '../pages/profile/Profile';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* App Authenticated Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resignation" element={<ResignationList />} />
        <Route path="/offboarding" element={<OffboardingList />} />
        <Route path="/offboarding/new" element={<OffboardingCreate />} />
        <Route path="/offboarding/:id" element={<OffboardingDetail />} />
        <Route path="/finance" element={<FinanceList />} />
        <Route path="/exceptions" element={<ExceptionList />} />
        <Route path="/audit-logs" element={<AuditLogList />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/assets" element={<AssetList />} />
        <Route path="/access" element={<AccessList />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/handovers" element={<HandoverList />} />
        <Route path="/templates" element={<TemplateList />} />
        <Route path="/approvals" element={<ApprovalList />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

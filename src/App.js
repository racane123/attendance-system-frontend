import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ErrorBoundary from './components/ErrorBoundary';
import BackendConfig from './components/BackendConfig';
import PWAInstall from './components/PWAInstall';
import PWAStatus from './components/PWAStatus';
import { LoadingFallback } from './components/LazyLoader';

// Lazy load heavy components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const Subjects = lazy(() => import('./pages/Subjects'));
const Scanner = lazy(() => import('./pages/Scanner'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Reports = lazy(() => import('./pages/Reports'));
const EmailManagement = lazy(() => import('./pages/EmailManagement'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const EnrollmentManagement = lazy(() => import('./components/EnrollmentManagement'));




function App() {


  const handleBackendConfigChange = (newUrl) => {
    // Force a page reload to apply the new API URL
    if (newUrl) {
      window.location.reload();
    }
  };

  return (
    <AuthProvider>
      <ErrorBoundary>
        <div className="min-h-screen">
          <Suspense fallback={<LoadingFallback message="Loading application..." />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<LoadingFallback message="Loading dashboard..." />}>
                      <Dashboard />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<LoadingFallback message="Loading dashboard..." />}>
                      <Dashboard />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/students" element={
                <ProtectedRoute requiredRoles={['admin', 'teacher']}>
                  <Layout>
                    <Suspense fallback={<LoadingFallback message="Loading students..." />}>
                      <Students />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/subjects" element={
                <ProtectedRoute requiredRoles={['admin', 'teacher']}>
                  <Layout>
                    <Suspense fallback={<LoadingFallback message="Loading subjects..." />}>
                      <Subjects />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/scanner" element={
                <ProtectedRoute requiredRoles={['admin', 'teacher']}>
                  <Layout>
                    <Suspense fallback={<LoadingFallback message="Loading scanner..." />}>
                      <Scanner />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/attendance" element={
                <ProtectedRoute requiredRoles={['admin', 'teacher', 'viewer']}>
                  <Layout>
                    <Suspense fallback={<LoadingFallback message="Loading attendance..." />}>
                      <Attendance />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/reports" element={
                <ProtectedRoute requiredRoles={['admin', 'teacher', 'viewer']}>
                  <Layout>
                    <Suspense fallback={<LoadingFallback message="Loading reports..." />}>
                      <Reports />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/email-management" element={
                <ProtectedRoute requiredRoles={['admin', 'teacher']}>
                  <Layout>
                    <Suspense fallback={<LoadingFallback message="Loading email management..." />}>
                      <EmailManagement />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/user-management" element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <Layout>
                    <Suspense fallback={<LoadingFallback message="Loading user management..." />}>
                      <UserManagement />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/enrollment-management" element={
                <ProtectedRoute requiredRoles={['admin', 'teacher']}>
                  <Layout>
                    <Suspense fallback={<LoadingFallback message="Loading enrollment management..." />}>
                      <EnrollmentManagement />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Redirect any unknown routes to dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          
          {/* Backend Configuration Component */}
          <BackendConfig onConfigChange={handleBackendConfigChange} />
          
          {/* PWA Install Prompt */}
          <PWAInstall />
          
          {/* PWA Status (for debugging) */}
          <PWAStatus />
        </div>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App; 
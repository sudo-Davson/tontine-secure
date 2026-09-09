'use client';

import Sidebar from '../../components/shared/Sidebar';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredKYCLevel={0}>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
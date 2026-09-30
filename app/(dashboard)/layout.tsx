// app/(dashboard)/layout.tsx
'use client';

import Sidebar from '../../components/shared/Sidebar';
import BottomNavigation from '../../components/shared/BottomNavigation';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredKYCLevel={0}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="pb-20 lg:pb-0 lg:pl-64">
          <div className="p-4 pt-20 lg:p-6">
            {children}
          </div>
        </main>
        <BottomNavigation />
      </div>
    </ProtectedRoute>
  );
}
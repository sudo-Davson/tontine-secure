// app/(dashboard)/layout.tsx
import Sidebar from '../../components/shared/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* La sidebar est en flux normal sur desktop grâce à lg:static */}
      <Sidebar />
      {/* Le contenu prend le reste de l'espace */}
      <main className="flex-1">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
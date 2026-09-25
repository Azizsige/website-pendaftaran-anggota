import AdminSidebar from "./_components/AdminSidebar";
import AdminHeader from "./_components/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-portal flex h-full font-body-md text-body-md bg-background min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 flex flex-col md:pl-sidebar-width min-h-screen w-full">
        <AdminHeader />
        
        {/* Dashboard Content */}
        {children}
      </main>
    </div>
  );
}

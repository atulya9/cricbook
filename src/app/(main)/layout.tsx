import { Navbar, Sidebar } from "@/components/layout/navbar";
import { RightSidebar } from "@/components/layout/right-sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 border-x border-gray-200 bg-white min-h-[calc(100vh-4rem)]">
            {children}
          </main>
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
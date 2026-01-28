import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Trophy,
  UserCog,
  LogOut,
  Settings,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Allow access to admin-login page without authentication
  // The children will handle their own auth

  return (
    <div className="min-h-screen bg-gray-100">{children}</div>
  );
}

// Separate authenticated layout for admin pages (not login)
export function AdminAuthenticatedLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session: { user: { name?: string | null; username: string; role: string } };
}) {
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "Matches", href: "/dashboard/matches" },
    { icon: Trophy, label: "Teams", href: "/dashboard/teams" },
    { icon: Users, label: "Players", href: "/dashboard/players" },
    { icon: UserCog, label: "Users", href: "/dashboard/users" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-gray-900 text-white shadow-lg">
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500">
              <span className="text-xl">🏏</span>
            </div>
            <div>
              <span className="text-lg font-bold">Cricbook</span>
              <span className="ml-2 text-xs bg-amber-500 px-2 py-0.5 rounded">ADMIN</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">
              Welcome, {session.user.name || session.user.username}
            </span>
            <Link
              href="/api/auth/signout"
              className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm hover:bg-gray-700 transition"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 bg-gray-900 text-white">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
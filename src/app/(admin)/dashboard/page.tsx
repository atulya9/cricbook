import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Trophy,
  UserCog,
  LogOut,
  Settings,
  TrendingUp,
  Activity,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Cricbook Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin-login");
  }

  // Get stats
  const [usersCount, matchesCount, teamsCount, postsCount] = await Promise.all([
    db.user.count(),
    db.match.count(),
    db.team.count(),
    db.post.count(),
  ]);

  const liveMatchesCount = await db.match.count({
    where: { status: "live" },
  });

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
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
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                  item.active
                    ? "bg-amber-500 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome to the Cricbook admin panel</p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatsCard
              title="Total Users"
              value={usersCount}
              icon={Users}
              color="bg-blue-500"
            />
            <StatsCard
              title="Total Matches"
              value={matchesCount}
              icon={Calendar}
              color="bg-green-500"
            />
            <StatsCard
              title="Live Matches"
              value={liveMatchesCount}
              icon={Activity}
              color="bg-red-500"
            />
            <StatsCard
              title="Teams"
              value={teamsCount}
              icon={Trophy}
              color="bg-purple-500"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition cursor-pointer">
              <Link href="/dashboard/matches">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    Manage Matches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Add, edit, or update match schedules and live scores.
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition cursor-pointer">
              <Link href="/dashboard/teams">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-purple-600" />
                    Manage Teams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Add or update team details and rosters.
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition cursor-pointer">
              <Link href="/dashboard/users">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="h-5 w-5 text-blue-600" />
                    Manage Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    View and manage user accounts and permissions.
                  </p>
                </CardContent>
              </Link>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                Activity feed will appear here
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`rounded-full p-3 ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
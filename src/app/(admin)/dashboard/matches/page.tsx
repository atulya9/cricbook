import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Trophy,
  UserCog,
  LogOut,
  Settings,
  Plus,
  Edit,
  Eye,
  Play,
  Clock,
  CheckCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Manage Matches",
  description: "Admin - Manage cricket matches",
};

export default async function AdminMatchesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin-login");
  }

  // Get all matches
  const matches = await db.match.findMany({
    include: {
      homeTeam: true,
      awayTeam: true,
      winner: true,
      series: true,
    },
    orderBy: { startDate: "desc" },
  });

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "Matches", href: "/dashboard/matches", active: true },
    { icon: Trophy, label: "Teams", href: "/dashboard/teams" },
    { icon: Users, label: "Players", href: "/dashboard/players" },
    { icon: UserCog, label: "Users", href: "/dashboard/users" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "live":
        return <Play className="h-4 w-4 text-red-500" />;
      case "upcoming":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-100 text-red-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Matches</h1>
              <p className="text-gray-600">Create, edit, and manage cricket matches</p>
            </div>
            <Link href="/dashboard/matches/add">
              <Button className="bg-amber-500 hover:bg-amber-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Match
              </Button>
            </Link>
          </div>

          {/* Matches List */}
          <div className="space-y-4">
            {matches.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-4">No matches found</p>
                  <Link href="/dashboard/matches/add">
                    <Button className="bg-amber-500 hover:bg-amber-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Match
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              matches.map((match) => (
                <Card key={match.id} className="hover:shadow-md transition">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(match.status)}
                          <Badge className={getStatusColor(match.status)}>
                            {match.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {match.homeTeam.shortName} vs {match.awayTeam.shortName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {match.matchType.toUpperCase()} • {match.format}
                          </p>
                          {match.series && (
                            <p className="text-sm text-gray-500">{match.series.name}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {formatDate(match.startDate, "MMM d, yyyy")}
                          </p>
                          <p className="text-sm text-gray-500">{match.venue}</p>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/matches/${match.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/matches/${match.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Match Scores */}
                    {(match.homeScore || match.awayScore) && (
                      <div className="mt-4 flex items-center gap-8">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{match.homeTeam.shortName}:</span>
                          <span className="font-semibold">{match.homeScore || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{match.awayTeam.shortName}:</span>
                          <span className="font-semibold">{match.awayScore || "-"}</span>
                        </div>
                        {match.result && (
                          <div className="text-sm text-green-600 font-medium">
                            {match.result}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
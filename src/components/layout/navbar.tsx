"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  Search,
  Bell,
  Bookmark,
  User,
  LogOut,
  Calendar,
  TrendingUp,
  Settings,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white">
            <span className="text-xl font-bold">🏏</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Cricbook</span>
        </Link>

        {/* Search - Desktop */}
        <div className="hidden flex-1 max-w-md mx-8 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search players, teams, matches..."
              className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {status === "authenticated" && session?.user ? (
            <>
              <Link
                href="/feed"
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
              >
                <Home className="h-5 w-5 text-gray-700" />
              </Link>
              <Link
                href="/explore"
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 md:hidden"
              >
                <Search className="h-5 w-5 text-gray-700" />
              </Link>
              <Link
                href="/matches"
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
              >
                <Calendar className="h-5 w-5 text-gray-700" />
              </Link>
              <Link
                href="/notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
              >
                <Bell className="h-5 w-5 text-gray-700" />
                {/* Notification badge */}
                {/* <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" /> */}
              </Link>
              <Link
                href="/bookmarks"
                className="hidden md:flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
              >
                <Bookmark className="h-5 w-5 text-gray-700" />
              </Link>

              {/* User Menu */}
              <div className="relative ml-2 group">
                <button className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100">
                  <Avatar
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    fallback={session.user.username}
                    size="sm"
                  />
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link
                    href={`/profile/${session.user.username}`}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    href="/bookmarks"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:hidden"
                  >
                    <Bookmark className="h-4 w-4" />
                    Bookmarks
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <hr className="my-2 border-gray-200" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function Sidebar() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const navItems = [
    { icon: Home, label: "Feed", href: "/feed" },
    { icon: Search, label: "Explore", href: "/explore" },
    { icon: Calendar, label: "Matches", href: "/matches" },
    { icon: TrendingUp, label: "Trending", href: "/trending" },
    { icon: Bell, label: "Notifications", href: "/notifications" },
    { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
    { icon: User, label: "Profile", href: `/profile/${session.user.username}` },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-64 shrink-0 lg:block">
      <nav className="space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100 transition"
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <Button className="w-full" size="lg">
          New Post
        </Button>
      </div>
    </aside>
  );
}
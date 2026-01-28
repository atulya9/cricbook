import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { AddMatchForm } from "@/components/forms/add-match-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Add Match",
  description: "Admin - Add a new cricket match",
};

export default async function AddMatchPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin-login");
  }

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
              Logout
            </Link>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/dashboard/matches">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Matches
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Add New Match</h1>
            <p className="text-gray-600">Create a new cricket match</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <AddMatchForm />
          </div>
        </div>
      </div>
    </div>
  );
}
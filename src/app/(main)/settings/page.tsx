import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings",
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      location: true,
      website: true,
      favoriteTeam: true,
      favoritePlayer: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        </div>
      </div>

      {/* Settings content */}
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  defaultValue={user.username}
                  disabled
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500">Username cannot be changed</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  defaultValue={user.name}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  defaultValue={user.bio || ""}
                  placeholder="Tell us about yourself"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  defaultValue={user.location || ""}
                  placeholder="Where are you from?"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Website</label>
                <input
                  type="url"
                  defaultValue={user.website || ""}
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Favorite Team</label>
                  <input
                    type="text"
                    defaultValue={user.favoriteTeam || ""}
                    placeholder="e.g., India, Mumbai Indians"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Favorite Player</label>
                  <input
                    type="text"
                    defaultValue={user.favoritePlayer || ""}
                    placeholder="e.g., Virat Kohli"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-green-600 py-2 text-white font-medium hover:bg-green-700 transition"
              >
                Save Changes
              </button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Password</p>
                <p className="text-sm text-gray-500">••••••••</p>
              </div>
              <button className="text-sm text-green-600 hover:underline">
                Change Password
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <button className="w-full rounded-lg border border-red-600 py-2 text-red-600 font-medium hover:bg-red-50 transition">
              Delete Account
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
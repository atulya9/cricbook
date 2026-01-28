import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminLoginForm } from "@/components/forms/admin-login-form";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Admin login for Cricbook",
};

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role === "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white">
              <span className="text-xl">🏏</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Cricbook</span>
          </Link>
        </div>

        <Card className="border-amber-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
            <CardDescription>
              Sign in with your administrator credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminLoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
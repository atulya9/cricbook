import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Cricbook account",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    if (session.user.role === "admin") {
      redirect("/dashboard");
    }
    redirect("/feed");
  }

  return (
    <>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in with your username and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </>
  );
}
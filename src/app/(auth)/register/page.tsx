import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Cricbook account",
};

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/feed");
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Join Cricbook</CardTitle>
        <CardDescription>
          Create your account and join the cricket community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
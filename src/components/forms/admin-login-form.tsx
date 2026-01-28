"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminLoginSchema } from "@/lib/validations";
import { z } from "zod";

type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data: AdminLoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("admin-login", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex justify-center mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <Shield className="h-8 w-8 text-amber-600" />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium text-gray-700">
          Admin Username
        </label>
        <Input
          id="username"
          type="text"
          placeholder="Enter admin username"
          error={errors.username?.message}
          {...register("username")}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Enter password"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>

      <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" isLoading={isLoading}>
        Sign in as Admin
      </Button>

      <p className="text-center text-xs text-gray-500 mt-4">
        This page is for administrators only.
        <br />
        Unauthorized access is prohibited.
      </p>
    </form>
  );
}
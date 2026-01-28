"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { registerUser } from "@/actions/auth";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await registerUser(data);

      if (!result.success) {
        setError(result.error || "Registration failed");
        return;
      }

      // Auto sign in after registration
      const signInResult = await signIn("user-login", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created but sign in failed. Please try logging in.");
      } else {
        router.push("/feed");
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
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Full Name
        </label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your full name"
          error={errors.name?.message}
          {...register("name")}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium text-gray-700">
          Username
        </label>
        <Input
          id="username"
          type="text"
          placeholder="Choose a username"
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
          placeholder="Create a password (min 6 characters)"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
      </div>

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Create account
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-green-600 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
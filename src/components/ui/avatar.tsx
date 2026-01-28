import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getAvatarUrl } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  children?: React.ReactNode;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-20 w-20",
};

export function Avatar({ src, alt, fallback, size = "md", className, children }: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  // If children are provided, render as a wrapper (for AvatarFallback pattern)
  if (children) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-full bg-gray-200",
          sizeClasses[size],
          className
        )}
      >
        {children}
      </div>
    );
  }

  const avatarSrc = hasError || !src ? getAvatarUrl(fallback || alt || "user") : src;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-gray-200",
        sizeClasses[size],
        className
      )}
    >
      <Image
        src={avatarSrc}
        alt={alt || "Avatar"}
        fill
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

interface AvatarFallbackProps {
  children: React.ReactNode;
  className?: string;
}

export function AvatarFallback({ children, className }: AvatarFallbackProps) {
  return (
    <span
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-400 to-gray-500 text-white font-medium",
        className
      )}
    >
      {children}
    </span>
  );
}
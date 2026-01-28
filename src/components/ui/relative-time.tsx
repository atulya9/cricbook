"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface RelativeTimeProps {
  date: Date | string;
  className?: string;
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  const [timeString, setTimeString] = useState<string>("");

  useEffect(() => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    setTimeString(formatDistanceToNow(dateObj, { addSuffix: true }));

    // Update every minute for better accuracy
    const interval = setInterval(() => {
      setTimeString(formatDistanceToNow(dateObj, { addSuffix: true }));
    }, 60000);

    return () => clearInterval(interval);
  }, [date]);

  return <span className={className}>{timeString}</span>;
}
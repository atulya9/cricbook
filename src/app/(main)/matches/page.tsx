import { Metadata } from "next";
import { Suspense } from "react";
import { MatchesContent } from "@/components/cricket/matches-content";

export const metadata: Metadata = {
  title: "Matches",
  description: "Live cricket scores and match schedules",
};

export default function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <Suspense fallback={<MatchesLoading />}>
      <MatchesContent searchParamsPromise={searchParams} />
    </Suspense>
  );
}

function MatchesLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
    </div>
  );
}
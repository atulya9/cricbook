"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Match } from "@/types";

export function RightSidebar() {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLiveMatches = async () => {
      try {
        const response = await fetch("/api/matches?status=live&limit=3");
        const data = await response.json();
        if (data.success) {
          setLiveMatches(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch live matches:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveMatches();
  }, []);
  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-80 shrink-0 space-y-4 p-4 xl:block">
      {/* Live Matches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            </span>
            Live Matches
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-20 bg-gray-100 rounded animate-pulse" />
              <div className="h-20 bg-gray-100 rounded animate-pulse" />
            </div>
          ) : liveMatches.length > 0 ? (
            liveMatches.map((match) => (
              <LiveMatchCard key={match.id} match={match} />
            ))
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              No live matches at the moment
            </div>
          )}
          <Link
            href="/matches"
            className="block text-center text-sm text-green-600 hover:underline"
          >
            View all matches
          </Link>
        </CardContent>
      </Card>

      {/* Trending Hashtags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trending</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <TrendingItem hashtag="IPL2024" posts={12500} />
          <TrendingItem hashtag="INDvAUS" posts={8700} />
          <TrendingItem hashtag="ViratKohli" posts={6200} />
          <TrendingItem hashtag="WorldCup" posts={5100} />
          <TrendingItem hashtag="ODICricket" posts={3400} />
          <Link
            href="/explore"
            className="block text-center text-sm text-green-600 hover:underline"
          >
            See more
          </Link>
        </CardContent>
      </Card>

      {/* Who to Follow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500">
            Suggestions will appear here based on your interests.
          </p>
        </CardContent>
      </Card>
    </aside>
  );
}

interface LiveMatchCardProps {
  match: Match;
}

function LiveMatchCard({ match }: LiveMatchCardProps) {
  const getStatusText = () => {
    if (match.currentOver) {
      return `Over ${match.currentOver}`;
    }
    return match.status;
  };

  return (
    <Link href={`/matches/${match.id}`}>
      <div className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50 cursor-pointer transition">
        <div className="mb-2 flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {match.matchType.toUpperCase()}
          </Badge>
          <span className="text-xs text-gray-500">{getStatusText()}</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">{match.homeTeam.shortName}</span>
            <span className="font-bold">{match.homeScore || "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">{match.awayTeam.shortName}</span>
            <span className="font-bold">{match.awayScore || "-"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface TrendingItemProps {
  hashtag: string;
  posts: number;
}

function TrendingItem({ hashtag, posts }: TrendingItemProps) {
  const formatPosts = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <Link href={`/explore?hashtag=${hashtag}`} className="block hover:bg-gray-50 -mx-4 px-4 py-2">
      <p className="font-medium text-gray-900">#{hashtag}</p>
      <p className="text-xs text-gray-500">{formatPosts(posts)} posts</p>
    </Link>
  );
}
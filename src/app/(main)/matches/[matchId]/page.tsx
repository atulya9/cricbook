import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowLeft, MapPin, Calendar, Trophy, Share2, Bell } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { MatchTabsClient } from "@/components/match";

interface MatchPageProps {
  params: Promise<{ matchId: string }>;
}

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  const { matchId } = await params;
  
  const match = await db.match.findUnique({
    where: { id: matchId },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  });

  if (!match) {
    return { title: "Match not found" };
  }

  return {
    title: `${match.homeTeam.shortName} vs ${match.awayTeam.shortName} | Cricbook`,
    description: `${match.homeTeam.name} vs ${match.awayTeam.name} - ${match.matchType.toUpperCase()} match at ${match.venue}`,
  };
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { matchId } = await params;
  const session = await getServerSession(authOptions);

  const match = await db.match.findUnique({
    where: { id: matchId },
    include: {
      homeTeam: true,
      awayTeam: true,
      winner: true,
      series: true,
      performances: {
        include: {
          player: true,
        },
      },
    },
  });

  if (!match) {
    notFound();
  }

  // Get user's existing prediction if logged in
  let userPrediction: string | null = null;
  if (session?.user?.id) {
    const prediction = await db.matchPrediction.findUnique({
      where: {
        userId_matchId: {
          userId: session.user.id,
          matchId: match.id,
        },
      },
    });
    userPrediction = prediction?.predictedTeamId || null;
  }

  const statusColors: Record<string, string> = {
    live: "bg-red-500",
    upcoming: "bg-blue-500",
    completed: "bg-gray-500",
    abandoned: "bg-yellow-500",
  };

  const statusLabels: Record<string, string> = {
    live: "LIVE",
    upcoming: "Upcoming",
    completed: "Completed",
    abandoned: "Abandoned",
  };

  return (
    <div>
      {/* Header */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center gap-4">
          <Link
            href="/matches"
            className="rounded-full p-2 hover:bg-gray-100 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">
              {match.homeTeam.shortName} vs {match.awayTeam.shortName}
            </h1>
            <p className="text-sm text-gray-500">
              {match.matchType.toUpperCase()} • {match.format}
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Follow
          </Button>
          <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Match Header Card */}
      <div className="cricket-gradient p-6 text-white">
        <div className="max-w-4xl mx-auto">
          {/* Match Info */}
          <div className="flex items-center gap-2 mb-4">
            <Badge className={statusColors[match.status]}>
              {match.status === "live" && (
                <span className="mr-1 flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                </span>
              )}
              {statusLabels[match.status]}
            </Badge>
            <Badge variant="outline" className="border-white/50 text-white">
              {match.matchType.toUpperCase()}
            </Badge>
            {match.currentOver && (
              <Badge variant="outline" className="border-white/50 text-white">
                Over {match.currentOver}
              </Badge>
            )}
          </div>

          {match.series && (
            <p className="text-white/80 mb-4">{match.series.name}</p>
          )}

          {/* Score Display */}
          <div className="grid grid-cols-3 items-center gap-4 mb-6">
            {/* Home Team */}
            <div className="text-center">
              <div className="h-16 w-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold">
                  {match.homeTeam.shortName.charAt(0)}
                </span>
              </div>
              <p className={`font-bold text-lg ${match.winnerId === match.homeTeam.id ? "text-yellow-300" : ""}`}>
                {match.homeTeam.name}
              </p>
              {match.homeScore && (
                <p className="text-2xl font-bold mt-1">{match.homeScore}</p>
              )}
              {match.winnerId === match.homeTeam.id && (
                <span className="text-xs text-yellow-300">🏆 Winner</span>
              )}
            </div>

            {/* VS */}
            <div className="text-center">
              <p className="text-white/60 text-lg font-medium">VS</p>
            </div>

            {/* Away Team */}
            <div className="text-center">
              <div className="h-16 w-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold">
                  {match.awayTeam.shortName.charAt(0)}
                </span>
              </div>
              <p className={`font-bold text-lg ${match.winnerId === match.awayTeam.id ? "text-yellow-300" : ""}`}>
                {match.awayTeam.name}
              </p>
              {match.awayScore && (
                <p className="text-2xl font-bold mt-1">{match.awayScore}</p>
              )}
              {match.winnerId === match.awayTeam.id && (
                <span className="text-xs text-yellow-300">🏆 Winner</span>
              )}
            </div>
          </div>

          {/* Result */}
          {match.result && (
            <div className="text-center bg-white/10 rounded-lg p-3">
              <p className="font-medium">{match.result}</p>
            </div>
          )}

          {/* Match Details */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {match.venue}
              {match.city && `, ${match.city}`}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(match.startDate, "EEEE, MMMM d, yyyy")}
            </span>
            {match.tossWinnerId && (
              <span className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                Toss: {match.tossWinnerId === match.homeTeam.id ? match.homeTeam.name : match.awayTeam.name}
                {match.tossDecision && ` (${match.tossDecision})`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Match Content Tabs */}
      <MatchTabsClient match={match} userPrediction={userPrediction} />
    </div>
  );
}
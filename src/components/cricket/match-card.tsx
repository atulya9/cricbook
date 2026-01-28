import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Match } from "@/types";

interface MatchCardProps {
  match: Match;
  compact?: boolean;
}

export function MatchCard({ match, compact = false }: MatchCardProps) {
  const statusColors = {
    live: "bg-red-500",
    upcoming: "bg-blue-500",
    completed: "bg-gray-500",
    abandoned: "bg-yellow-500",
  };

  const statusLabels = {
    live: "LIVE",
    upcoming: "Upcoming",
    completed: "Completed",
    abandoned: "Abandoned",
  };

  if (compact) {
    return (
      <Link href={`/matches/${match.id}`}>
        <div className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition">
          <div className="mb-2 flex items-center justify-between">
            <Badge
              variant="outline"
              className={`text-xs ${match.status === "live" ? "border-red-500 text-red-500" : ""}`}
            >
              {match.matchType.toUpperCase()}
            </Badge>
            {match.status === "live" && (
              <span className="flex items-center gap-1 text-xs text-red-500">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                </span>
                LIVE
              </span>
            )}
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
          {match.result && (
            <p className="mt-2 text-xs text-gray-600">{match.result}</p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/matches/${match.id}`}>
      <Card className="hover:shadow-md transition">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{match.matchType.toUpperCase()}</Badge>
              <Badge variant="secondary">{match.format}</Badge>
            </div>
            <Badge className={statusColors[match.status]}>
              {statusLabels[match.status]}
            </Badge>
          </div>
          {match.series && (
            <p className="text-sm text-gray-500">{match.series.name}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Teams */}
            <div className="space-y-3">
              <TeamScore
                team={match.homeTeam}
                score={match.homeScore}
                isWinner={match.winnerId === match.homeTeam.id}
              />
              <TeamScore
                team={match.awayTeam}
                score={match.awayScore}
                isWinner={match.winnerId === match.awayTeam.id}
              />
            </div>

            {/* Match details */}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm text-gray-600">{match.venue}</p>
              {match.city && (
                <p className="text-xs text-gray-500">
                  {match.city}, {match.country}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                {formatDate(match.startDate, "EEE, MMM d, yyyy")}
              </p>
            </div>

            {/* Result */}
            {match.result && (
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-sm font-medium text-gray-800">{match.result}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

interface TeamScoreProps {
  team: Match["homeTeam"];
  score?: string | null;
  isWinner?: boolean;
}

function TeamScore({ team, score, isWinner }: TeamScoreProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg font-bold">
          {team.shortName.charAt(0)}
        </div>
        <div>
          <p className={`font-semibold ${isWinner ? "text-green-600" : ""}`}>
            {team.name}
          </p>
          <p className="text-xs text-gray-500">{team.shortName}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-xl font-bold ${isWinner ? "text-green-600" : ""}`}>
          {score || "-"}
        </p>
      </div>
    </div>
  );
}
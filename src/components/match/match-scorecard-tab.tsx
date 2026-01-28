"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

interface Player {
  id: string;
  name: string;
  role: string;
}

interface PlayerPerformance {
  id: string;
  playerId: string;
  runsScored?: number | null;
  ballsFaced?: number | null;
  fours?: number | null;
  sixes?: number | null;
  strikeRate?: number | null;
  wicketsTaken?: number | null;
  oversBowled?: number | null;
  runsConceded?: number | null;
  economy?: number | null;
  catches?: number | null;
  stumpings?: number | null;
  runOuts?: number | null;
  isManOfMatch: boolean;
  player: Player;
}

interface Team {
  id: string;
  name: string;
  shortName: string;
}

interface MatchScorecardTabProps {
  match: {
    id: string;
    homeTeam: Team;
    awayTeam: Team;
    homeScore?: string | null;
    awayScore?: string | null;
    status: string;
    tossWinnerId?: string | null;
    tossDecision?: string | null;
  };
  performances: PlayerPerformance[];
  inningsNumber: number;
  onInningsChange: (innings: number) => void;
}

export function MatchScorecardTab({
  match,
  performances,
  inningsNumber,
  onInningsChange,
}: MatchScorecardTabProps) {
  // Determine which team bats in each innings based on toss result
  let firstInningsTeam: Team;
  let secondInningsTeam: Team;
  let firstInningsScore: string | null = null;
  let secondInningsScore: string | null = null;

  if (match.tossWinnerId && match.tossDecision) {
    // If toss winner chose to bat, they bat first
    if (match.tossDecision === 'bat') {
      firstInningsTeam = match.tossWinnerId === match.homeTeam.id ? match.homeTeam : match.awayTeam;
      secondInningsTeam = match.tossWinnerId === match.homeTeam.id ? match.awayTeam : match.homeTeam;
      firstInningsScore = match.tossWinnerId === match.homeTeam.id ? match.homeScore : match.awayScore;
      secondInningsScore = match.tossWinnerId === match.homeTeam.id ? match.awayScore : match.homeScore;
    } else {
      // If toss winner chose to bowl/field, the other team bats first
      firstInningsTeam = match.tossWinnerId === match.homeTeam.id ? match.awayTeam : match.homeTeam;
      secondInningsTeam = match.tossWinnerId === match.homeTeam.id ? match.homeTeam : match.awayTeam;
      firstInningsScore = match.tossWinnerId === match.homeTeam.id ? match.awayScore : match.homeScore;
      secondInningsScore = match.tossWinnerId === match.homeTeam.id ? match.homeScore : match.awayScore;
    }
  } else {
    // Fallback: assume home team bats first if no toss info
    firstInningsTeam = match.homeTeam;
    secondInningsTeam = match.awayTeam;
    firstInningsScore = match.homeScore;
    secondInningsScore = match.awayScore;
  }

  // Separate batting and bowling performances
  const battingPerformances = performances.filter(
    (p) => p.runsScored !== null && p.runsScored !== undefined
  );
  const bowlingPerformances = performances.filter(
    (p) => p.wicketsTaken !== null && p.wicketsTaken !== undefined
  );

  // Calculate totals
  const totalRuns = battingPerformances.reduce(
    (sum, p) => sum + (p.runsScored || 0),
    0
  );
  const totalWickets = bowlingPerformances.reduce(
    (sum, p) => sum + (p.wicketsTaken || 0),
    0
  );
  const totalOvers = bowlingPerformances.reduce(
    (sum, p) => sum + (p.oversBowled || 0),
    0
  );

  return (
    <div className="p-4 space-y-4">
      {/* Innings Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Innings:</span>
          <div className="flex gap-1">
            {[1, 2].map((innings) => (
              <Button
                key={innings}
                variant={inningsNumber === innings ? "default" : "outline"}
                size="sm"
                onClick={() => onInningsChange(innings)}
              >
                {innings === 1 ? "1st" : "2nd"}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Score Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <ScoreSummaryCard
          team={firstInningsTeam}
          score={firstInningsScore}
          isCurrentInnings={inningsNumber === 1}
        />
        <ScoreSummaryCard
          team={secondInningsTeam}
          score={secondInningsScore}
          isCurrentInnings={inningsNumber === 2}
        />
      </div>

      {performances.length > 0 ? (
        <>
          {/* Batting Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏏 Batting
                <Badge variant="secondary" className="ml-auto">
                  {totalRuns} runs
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {battingPerformances.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-gray-500">
                        <th className="pb-2 font-medium">Batter</th>
                        <th className="pb-2 font-medium text-right">R</th>
                        <th className="pb-2 font-medium text-right">B</th>
                        <th className="pb-2 font-medium text-right">4s</th>
                        <th className="pb-2 font-medium text-right">6s</th>
                        <th className="pb-2 font-medium text-right">SR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {battingPerformances.map((perf) => (
                        <tr
                          key={perf.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {perf.player.name}
                              </span>
                              {perf.isManOfMatch && (
                                <Badge
                                  variant="success"
                                  className="text-xs bg-yellow-100 text-yellow-700"
                                >
                                  ⭐ MOM
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 capitalize">
                              {perf.player.role}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <span
                              className={`font-semibold ${
                                (perf.runsScored || 0) >= 50
                                  ? "text-green-600"
                                  : (perf.runsScored || 0) >= 100
                                  ? "text-purple-600"
                                  : ""
                              }`}
                            >
                              {perf.runsScored ?? 0}
                              {(perf.runsScored || 0) >= 100 && " 💯"}
                              {(perf.runsScored || 0) >= 50 &&
                                (perf.runsScored || 0) < 100 &&
                                " ⭐"}
                            </span>
                          </td>
                          <td className="py-3 text-right text-gray-500">
                            {perf.ballsFaced ?? 0}
                          </td>
                          <td className="py-3 text-right text-gray-500">
                            {perf.fours ?? 0}
                          </td>
                          <td className="py-3 text-right text-gray-500">
                            {perf.sixes ?? 0}
                          </td>
                          <td className="py-3 text-right text-gray-500">
                            {perf.strikeRate?.toFixed(1) ?? "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No batting data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Bowling Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 Bowling
                <Badge variant="secondary" className="ml-auto">
                  {totalOvers} overs
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bowlingPerformances.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-gray-500">
                        <th className="pb-2 font-medium">Bowler</th>
                        <th className="pb-2 font-medium text-right">O</th>
                        <th className="pb-2 font-medium text-right">M</th>
                        <th className="pb-2 font-medium text-right">R</th>
                        <th className="pb-2 font-medium text-right">W</th>
                        <th className="pb-2 font-medium text-right">Econ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bowlingPerformances.map((perf) => (
                        <tr
                          key={perf.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {perf.player.name}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400 capitalize">
                              {perf.player.role}
                            </span>
                          </td>
                          <td className="py-3 text-right text-gray-500">
                            {perf.oversBowled ?? 0}
                          </td>
                          <td className="py-3 text-right text-gray-500">-</td>
                          <td className="py-3 text-right text-gray-500">
                            {perf.runsConceded ?? 0}
                          </td>
                          <td className="py-3 text-right">
                            <span
                              className={`font-semibold ${
                                (perf.wicketsTaken || 0) >= 3
                                  ? "text-green-600"
                                  : (perf.wicketsTaken || 0) >= 5
                                  ? "text-purple-600"
                                  : ""
                              }`}
                            >
                              {perf.wicketsTaken ?? 0}
                              {(perf.wicketsTaken || 0) >= 5 && " 🔥"}
                            </span>
                          </td>
                          <td className="py-3 text-right text-gray-500">
                            {perf.economy?.toFixed(1) ?? "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No bowling data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Fall of Wickets (placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Fall of Wickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-4">
                Fall of wickets data will be displayed here
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">
              {match.status === "upcoming"
                ? "Scorecard will be available once the match starts."
                : "No scorecard data available yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface ScoreSummaryCardProps {
  team: Team;
  score?: string | null;
  isCurrentInnings: boolean;
}

function ScoreSummaryCard({ team, score, isCurrentInnings }: ScoreSummaryCardProps) {
  // Parse score (e.g., "234/5 (45.2)" -> runs=234, wickets=5, overs=45.2)
  let runs = 0;
  let wickets = 0;
  let overs = "";

  if (score) {
    const match = score.match(/(\d+)\/(\d+)\s*\(?([\d.]+)?\)?/);
    if (match) {
      runs = parseInt(match[1]) || 0;
      wickets = parseInt(match[2]) || 0;
      overs = match[3] || "";
    }
  }

  return (
    <Card className={isCurrentInnings ? "border-2 border-green-500" : ""}>
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
            {team.shortName.charAt(0)}
          </div>
          <div>
            <p className="font-semibold">{team.name}</p>
            {score ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{score}</span>
              </div>
            ) : (
              <span className="text-gray-400">Yet to bat</span>
            )}
          </div>
        </div>
        {isCurrentInnings && (
          <Badge variant="success" className="mt-2 bg-green-100 text-green-700">
            Current Innings
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
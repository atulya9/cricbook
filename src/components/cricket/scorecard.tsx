import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PlayerPerformance } from "@/types";

interface ScorecardProps {
  batting: PlayerPerformance[];
  bowling: PlayerPerformance[];
  teamName: string;
  totalScore: string;
}

export function Scorecard({ batting, bowling, teamName, totalScore }: ScorecardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{teamName}</CardTitle>
          <Badge variant="secondary" className="text-lg font-bold">
            {totalScore}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Batting */}
        <div>
          <h4 className="mb-3 font-semibold text-gray-900">Batting</h4>
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
                {batting.map((perf) => (
                  <tr key={perf.id} className="border-b border-gray-100">
                    <td className="py-2">
                      <span className="font-medium">{perf.player.name}</span>
                      {perf.isManOfMatch && (
                        <Badge variant="success" className="ml-2 text-xs">
                          MOM
                        </Badge>
                      )}
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {perf.runsScored ?? 0}
                    </td>
                    <td className="py-2 text-right text-gray-500">
                      {perf.ballsFaced ?? 0}
                    </td>
                    <td className="py-2 text-right text-gray-500">
                      {perf.fours ?? 0}
                    </td>
                    <td className="py-2 text-right text-gray-500">
                      {perf.sixes ?? 0}
                    </td>
                    <td className="py-2 text-right text-gray-500">
                      {perf.strikeRate?.toFixed(1) ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bowling */}
        <div>
          <h4 className="mb-3 font-semibold text-gray-900">Bowling</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-2 font-medium">Bowler</th>
                  <th className="pb-2 font-medium text-right">O</th>
                  <th className="pb-2 font-medium text-right">R</th>
                  <th className="pb-2 font-medium text-right">W</th>
                  <th className="pb-2 font-medium text-right">Econ</th>
                </tr>
              </thead>
              <tbody>
                {bowling.map((perf) => (
                  <tr key={perf.id} className="border-b border-gray-100">
                    <td className="py-2">
                      <span className="font-medium">{perf.player.name}</span>
                    </td>
                    <td className="py-2 text-right text-gray-500">
                      {perf.oversBowled ?? 0}
                    </td>
                    <td className="py-2 text-right text-gray-500">
                      {perf.runsConceded ?? 0}
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {perf.wicketsTaken ?? 0}
                    </td>
                    <td className="py-2 text-right text-gray-500">
                      {perf.economy?.toFixed(1) ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
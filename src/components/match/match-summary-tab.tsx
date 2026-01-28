"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Users } from "lucide-react";
import { voteForTeam } from "@/actions/match";

interface Team {
  id: string;
  name: string;
  shortName: string;
}

interface MatchSummary {
  id: string;
  title: string;
  content: string;
}

interface PredictionStats {
  teamId: string;
  count: number;
  percentage: number;
}

interface MatchSummaryTabProps {
  match: {
    id: string;
    status: string;
    homeTeam: Team;
    awayTeam: Team;
  };
  summary: MatchSummary | null;
  predictions: PredictionStats[];
  userPrediction?: string | null;
}

export function MatchSummaryTab({
  match,
  summary,
  predictions,
  userPrediction,
}: MatchSummaryTabProps) {
  const { data: session } = useSession();
  const [isVoting, setIsVoting] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(userPrediction || null);

  const homeTeamPrediction = predictions.find((p) => p.teamId === match.homeTeam.id);
  const awayTeamPrediction = predictions.find((p) => p.teamId === match.awayTeam.id);
  const totalVotes = predictions.reduce((sum, p) => sum + p.count, 0);



  const handleVote = async (teamId: string) => {
    if (!session?.user) return;
    setIsVoting(true);

    const formData = new FormData();
    formData.append("matchId", match.id);
    formData.append("predictedTeamId", teamId);

    try {
      const result = await voteForTeam(formData);
      if (result.success) {
        setSelectedTeam(teamId);
      }
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Match Prediction Voting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Who Will Win?
            {totalVotes > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {match.status === "completed" ? (
            <p className="text-center text-gray-500">
              The match has ended. Voting is closed.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Voting Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <VoteButton
                  team={match.homeTeam}
                  isSelected={selectedTeam === match.homeTeam.id}
                  percentage={homeTeamPrediction?.percentage || 0}
                  votes={homeTeamPrediction?.count || 0}
                  onVote={() => handleVote(match.homeTeam.id)}
                  disabled={isVoting || !session?.user}
                  showResults={totalVotes > 0}
                />
                <VoteButton
                  team={match.awayTeam}
                  isSelected={selectedTeam === match.awayTeam.id}
                  percentage={awayTeamPrediction?.percentage || 0}
                  votes={awayTeamPrediction?.count || 0}
                  onVote={() => handleVote(match.awayTeam.id)}
                  disabled={isVoting || !session?.user}
                  showResults={totalVotes > 0}
                />
              </div>
              {!session?.user && (
                <p className="text-center text-sm text-gray-500">
                  Please log in to vote
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Match Summary / Editorial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Match Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary ? (
            <div>
              <h3 className="text-xl font-bold mb-4">{summary.title}</h3>
              <div className="prose prose-sm max-w-none">
                {summary.content.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No match summary available yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface VoteButtonProps {
  team: Team;
  isSelected: boolean;
  percentage: number;
  votes: number;
  onVote: () => void;
  disabled: boolean;
  showResults: boolean;
}

function VoteButton({
  team,
  isSelected,
  percentage,
  votes,
  onVote,
  disabled,
  showResults,
}: VoteButtonProps) {
  return (
    <button
      onClick={onVote}
      disabled={disabled}
      className={`relative overflow-hidden rounded-lg border-2 p-4 transition-all ${
        isSelected
          ? "border-green-500 bg-green-50"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      } ${disabled && !isSelected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {/* Progress bar background */}
      {showResults && (
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            isSelected ? "bg-green-100" : "bg-gray-100"
          }`}
          style={{ width: `${percentage}%` }}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-center mb-2">
          <div
            className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
              isSelected
                ? "bg-gradient-to-br from-green-500 to-emerald-600"
                : "bg-gradient-to-br from-gray-400 to-gray-500"
            }`}
          >
            {team.shortName.charAt(0)}
          </div>
        </div>
        <p className="font-semibold text-gray-900">{team.name}</p>
        <p className="text-xs text-gray-500">{team.shortName}</p>
        {showResults && (
          <div className="mt-2">
            <p className="text-lg font-bold text-gray-900">{percentage}%</p>
            <p className="text-xs text-gray-500">
              {votes} {votes === 1 ? "vote" : "votes"}
            </p>
          </div>
        )}
        {isSelected && (
          <Badge className="mt-2 bg-green-500">Your Pick</Badge>
        )}
      </div>
    </button>
  );
}
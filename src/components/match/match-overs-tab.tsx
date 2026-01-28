"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TrendingUp, Users } from "lucide-react";
import { submitOverPrediction } from "@/actions/match";

interface User {
  id: string;
  username: string;
  name: string;
}

interface OverPrediction {
  id: string;
  userId: string;
  predictedRuns: number;
  predictedWicket: boolean;
  isCorrectRuns?: boolean;
  isCorrectWicket?: boolean;
}

interface OverSummary {
  id: string;
  matchId: string;
  inningsNumber: number;
  overNumber: number;
  balls: string;
  totalRuns: number;
  wickets: number;
  extras: number;
  bowlerName?: string;
  predictions: OverPrediction[];
}

interface MatchOversTabProps {
  matchId: string;
  overSummaries: OverSummary[];
  inningsNumber: number;
  onInningsChange: (innings: number) => void;
  matchStatus: string;
  currentOver: number | null;
}

export function MatchOversTab({
  matchId,
  overSummaries,
  inningsNumber,
  onInningsChange,
  matchStatus,
  currentOver,
}: MatchOversTabProps) {
  const { data: session } = useSession();
  const isLive = matchStatus === "live";

  return (
    <div className="p-4 space-y-4">
      {/* Innings Selector */}
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

      {/* Over Summaries List */}
      {overSummaries.length > 0 ? (
        <div className="space-y-3">
          {overSummaries.map((overSummary) => (
            <OverSummaryCard
              key={overSummary.id}
              overSummary={overSummary}
              userId={session?.user?.id || ""}
              isLive={isLive && overSummary.overNumber === currentOver}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No over summaries available yet.</p>
            {isLive && (
              <p className="text-sm text-gray-400 mt-2">
                Over summaries will appear as the match progresses.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface OverSummaryCardProps {
  overSummary: OverSummary;
  userId: string;
  isLive: boolean;
}

function OverSummaryCard({ overSummary, userId, isLive }: OverSummaryCardProps) {
  const balls = overSummary.balls ? JSON.parse(overSummary.balls) : [];
  const userPrediction = overSummary.predictions.find((p) => p.userId === userId);

  return (
    <Card className={isLive ? "border-green-500 bg-green-50/50" : ""}>
      <CardContent className="py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Over {overSummary.overNumber}</Badge>
            {overSummary.bowlerName && (
              <span className="text-sm text-gray-600">
                🎯 {overSummary.bowlerName}
              </span>
            )}
            {isLive && (
              <Badge className="bg-green-500 animate-pulse">LIVE</Badge>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">
              {overSummary.totalRuns}/{overSummary.wickets}
            </p>
            <p className="text-xs text-gray-500">
              {overSummary.extras > 0 && `+${overSummary.extras} extras`}
            </p>
          </div>
        </div>

        {/* Balls */}
        {balls.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {balls.map((ball: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center justify-center w-8 h-8 text-xs font-medium rounded bg-gray-100"
              >
                {ball}
              </span>
            ))}
          </div>
        )}

        {/* Predictions */}
        {overSummary.predictions.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{overSummary.predictions.length} predictions</span>
            {userPrediction && (
              <Badge variant="secondary" className="text-xs">
                Your prediction: {userPrediction.predictedRuns}
                {userPrediction.predictedWicket && " + W"}
              </Badge>
            )}
          </div>
        )}

        {/* Prediction Form - Only for live matches */}
        {isLive && userId && (
          <PredictionCard
            overSummary={overSummary}
            userPrediction={userPrediction}
            userId={userId}
          />
        )}
      </CardContent>
    </Card>
  );
}

interface PredictionCardProps {
  overSummary: OverSummary;
  userPrediction?: OverPrediction;
  userId: string;
}

function PredictionCard({ overSummary, userPrediction, userId }: PredictionCardProps) {
  const [isPending, startTransition] = useTransition();
  const [predictedRuns, setPredictedRuns] = useState(userPrediction?.predictedRuns || 6);
  const [predictedWicket, setPredictedWicket] = useState(userPrediction?.predictedWicket || false);

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("overSummaryId", overSummary.id);
    formData.append("predictedRuns", predictedRuns.toString());
    formData.append("predictedWicket", predictedWicket.toString());

    startTransition(async () => {
      await submitOverPrediction(formData);
    });
  };

  if (userPrediction) {
    return (
      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm font-medium text-blue-900">Your Prediction</p>
        <p className="text-sm text-blue-700">
          {userPrediction.predictedRuns} runs
          {userPrediction.predictedWicket && " + wicket"}
        </p>
        {userPrediction.isCorrectRuns !== null && (
          <Badge variant={userPrediction.isCorrectRuns ? "default" : "secondary"} className="mt-1">
            {userPrediction.isCorrectRuns ? "✅ Runs correct" : "❌ Runs wrong"}
          </Badge>
        )}
        {userPrediction.isCorrectWicket !== null && (
          <Badge variant={userPrediction.isCorrectWicket ? "default" : "secondary"} className="mt-1 ml-1">
            {userPrediction.isCorrectWicket ? "✅ Wicket correct" : "❌ Wicket wrong"}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 border rounded-lg">
      <p className="text-sm font-medium mb-2">Predict this over:</p>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm">Runs:</label>
          <Input
            type="number"
            min={0}
            max={36}
            value={predictedRuns}
            onChange={(e) => setPredictedRuns(parseInt(e.target.value) || 0)}
            className="w-16 h-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`wicket-${overSummary.id}`}
            checked={predictedWicket}
            onChange={(e) => setPredictedWicket(e.target.checked)}
            className="rounded"
          />
          <label htmlFor={`wicket-${overSummary.id}`} className="text-sm">
            Wicket
          </label>
        </div>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isPending}
          className="ml-auto"
        >
          {isPending ? "Predicting..." : "Predict"}
        </Button>
      </div>
    </div>
  );
}

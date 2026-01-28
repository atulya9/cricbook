"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchInfoTab } from "./match-info-tab";
import { MatchSummaryTab } from "./match-summary-tab";
import { MatchCommentaryTab } from "./match-commentary-tab";
import { MatchOversTab } from "./match-overs-tab";
import { MatchScorecardTab } from "./match-scorecard-tab";
import {
  getMatchCommentary,
  getOverSummaries,
  getMatchPredictions,
  getMatchSummary,
} from "@/actions/match";

interface Team {
  id: string;
  name: string;
  shortName: string;
  country?: string | null;
  teamType: string;
  logo?: string | null;
}

interface Series {
  id: string;
  name: string;
}

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

interface Match {
  id: string;
  matchType: string;
  format: string;
  venue: string;
  city?: string | null;
  country?: string | null;
  startDate: Date;
  endDate?: Date | null;
  status: string;
  homeTeamId: string;
  awayTeamId: string;
  winnerId?: string | null;
  tossWinnerId?: string | null;
  tossDecision?: string | null;
  homeScore?: string | null;
  awayScore?: string | null;
  result?: string | null;
  weather?: string | null;
  pitch?: string | null;
  currentOver?: number | null;
  currentInnings?: number | null;
  homeTeam: Team;
  awayTeam: Team;
  winner?: Team | null;
  series?: Series | null;
  performances: PlayerPerformance[];
}

interface MatchTabsClientProps {
  match: Match;
  userPrediction?: string | null;
  onMatchUpdate?: (updatedMatch: Match) => void;
}

export function MatchTabsClient({ match, userPrediction }: MatchTabsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTabState] = useState(searchParams.get("tab") || "info");
  const [inningsNumber, setInningsNumber] = useState(match.currentInnings || 1);

  // State for async data
  const [commentaries, setCommentaries] = useState<any[]>([]);
  const [overSummaries, setOverSummaries] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("tab", tab);
    router.replace(`?${newParams.toString()}`, { scroll: false });
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [commentaryData, oversData, predictionsData, summaryData] = await Promise.all([
        getMatchCommentary(match.id, inningsNumber),
        getOverSummaries(match.id, inningsNumber),
        getMatchPredictions(match.id),
        getMatchSummary(match.id),
      ]);
      
      setCommentaries(commentaryData);
      setOverSummaries(oversData);
      setPredictions(predictionsData);
      setSummary(summaryData);
    } catch (error) {
      console.error("Error loading match data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [match.id, inningsNumber]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh data when innings changes
  const handleInningsChange = (innings: number) => {
    setInningsNumber(innings);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4 overflow-x-auto">
        <TabsTrigger value="info" className="flex-shrink-0">
          Info
        </TabsTrigger>
        <TabsTrigger value="summary" className="flex-shrink-0">
          Summary
        </TabsTrigger>
        <TabsTrigger value="commentary" className="flex-shrink-0">
          Commentary
        </TabsTrigger>
        <TabsTrigger value="scorecard" className="flex-shrink-0">
          Scorecard
        </TabsTrigger>
        <TabsTrigger value="overs" className="flex-shrink-0">
          Overs
        </TabsTrigger>
      </TabsList>

      <TabsContent value="info" className="mt-0">
        <MatchInfoTab match={match} />
      </TabsContent>

      <TabsContent value="summary" className="mt-0">
        <MatchSummaryTab
          match={match}
          summary={summary}
          predictions={predictions}
          userPrediction={userPrediction}
        />
      </TabsContent>

      <TabsContent value="commentary" className="mt-0">
        <MatchCommentaryTab
          matchId={match.id}
          commentaries={commentaries}
          inningsNumber={inningsNumber}
          onInningsChange={handleInningsChange}
          onCommentariesUpdate={setCommentaries}
        />
      </TabsContent>

      <TabsContent value="scorecard" className="mt-0">
        <MatchScorecardTab
          match={match}
          performances={match.performances}
          inningsNumber={inningsNumber}
          onInningsChange={handleInningsChange}
        />
      </TabsContent>

      <TabsContent value="overs" className="mt-0">
        <MatchOversTab
          matchId={match.id}
          overSummaries={overSummaries}
          inningsNumber={inningsNumber}
          onInningsChange={handleInningsChange}
          matchStatus={match.status}
          currentOver={match.currentOver ?? null}
        />
      </TabsContent>
    </Tabs>
  );
}
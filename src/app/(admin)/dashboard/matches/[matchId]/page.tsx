import { getMatchById, getMatchCommentary } from "@/actions/match";
import MatchEditClient from "./client";

interface MatchEditPageProps {
  params: Promise<{
    matchId: string;
  }>;
}

export default async function MatchEditPage({ params }: MatchEditPageProps) {
  const { matchId } = await params;

  // Fetch initial data on server
  let match = null;
  let commentaries = [];

  try {
    const [matchData, commentaryData] = await Promise.all([
      getMatchById(matchId),
      getMatchCommentary(matchId),
    ]);

    match = matchData as any;
    commentaries = commentaryData as any;
  } catch (error) {
    console.error("Failed to load match data:", error);
  }

  return <MatchEditClient matchId={matchId} initialMatch={match} initialCommentaries={commentaries} />;
}
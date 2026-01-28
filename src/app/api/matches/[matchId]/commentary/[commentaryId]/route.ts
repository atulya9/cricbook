import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Import the shared calculateMatchScores function
function calculateMatchScores(match: any, commentaries: any[]) {
  // Group commentaries by innings
  const inningsData: { [innings: number]: { runs: number; wickets: number; teamId: string; maxOver: number; maxBall: number } } = {};

  if (match) {
    // Determine which team bats in each innings based on toss result
    let firstInningsTeamId: string;
    let secondInningsTeamId: string;

    if (match.tossWinnerId && match.tossDecision) {
      // If toss winner chose to bat, they bat first
      if (match.tossDecision === 'bat') {
        firstInningsTeamId = match.tossWinnerId;
        secondInningsTeamId = match.tossWinnerId === match.homeTeamId ? match.awayTeamId : match.homeTeamId;
      } else {
        // If toss winner chose to bowl/field, the other team bats first
        firstInningsTeamId = match.tossWinnerId === match.homeTeamId ? match.awayTeamId : match.homeTeamId;
        secondInningsTeamId = match.tossWinnerId;
      }
    } else {
      // Fallback: assume home team bats first if no toss info
      firstInningsTeamId = match.homeTeamId;
      secondInningsTeamId = match.awayTeamId;
    }

    inningsData[1] = { runs: 0, wickets: 0, teamId: firstInningsTeamId, maxOver: 0, maxBall: 0 };
    inningsData[2] = { runs: 0, wickets: 0, teamId: secondInningsTeamId, maxOver: 0, maxBall: 0 };
  }

  // Calculate scores from commentary
  commentaries.forEach(commentary => {
    const innings = commentary.inningsNumber || 1;
    if (!inningsData[innings]) {
      // This shouldn't happen with proper initialization, but fallback just in case
      const fallbackTeamId = innings === 1 ?
        (match?.tossWinnerId === match?.homeTeamId && match?.tossDecision === 'bat' ? match?.tossWinnerId : match?.homeTeamId) :
        (match?.tossWinnerId === match?.homeTeamId && match?.tossDecision === 'bat' ? match?.awayTeamId : match?.awayTeamId);
      inningsData[innings] = { runs: 0, wickets: 0, teamId: fallbackTeamId, maxOver: 0, maxBall: 0 };
    }

    inningsData[innings].runs += commentary.runs || 0;
    if (commentary.isWicket) {
      inningsData[innings].wickets += 1;
    }

    // Track the maximum over and ball for this innings
    inningsData[innings].maxOver = Math.max(inningsData[innings].maxOver, commentary.overNumber || 0);
    inningsData[innings].maxBall = Math.max(inningsData[innings].maxBall, commentary.ballNumber || 0);
  });

  // Format scores - assign to correct teams based on which team batted in each innings
  let homeScore = null;
  let awayScore = null;
  let currentOver = null;
  let currentInnings = null;

  if (inningsData[1]) {
    const team1Score = `${inningsData[1].runs}/${inningsData[1].wickets}`;
    if (inningsData[1].teamId === match?.homeTeamId) {
      homeScore = team1Score;
    } else {
      awayScore = team1Score;
    }
  }

  if (inningsData[2]) {
    const team2Score = `${inningsData[2].runs}/${inningsData[2].wickets}`;
    if (inningsData[2].teamId === match?.homeTeamId) {
      homeScore = team2Score;
    } else {
      awayScore = team2Score;
    }
  }

  // Determine current innings and over
  // If there are commentaries in innings 2 (maxBall > 0), that's current
  // Otherwise if there are commentaries in innings 1 (maxBall > 0), that's current
  if (inningsData[2] && inningsData[2].maxBall > 0) {
    currentInnings = 2;
    currentOver = inningsData[2].maxOver + (inningsData[2].maxBall / 10);
  } else if (inningsData[1] && inningsData[1].maxBall > 0) {
    currentInnings = 1;
    currentOver = inningsData[1].maxOver + (inningsData[1].maxBall / 10);
  }

  return { homeScore, awayScore, currentOver, currentInnings };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string; commentaryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { matchId, commentaryId } = await params;
    const body = await request.json();

    const updatedCommentary = await db.commentary.update({
      where: { id: commentaryId },
      data: {
        overNumber: body.overNumber,
        ballNumber: body.ballNumber,
        runs: body.runs,
        isWicket: body.isWicket,
        wicketType: body.isWicket ? body.wicketType : null,
        isExtra: body.isExtra,
        extraType: body.isExtra ? body.extraType : null,
        isBoundary: body.isBoundary,
        isSix: body.isSix,
        description: body.description,
        batsmanName: body.batsmanName || null,
        bowlerName: body.bowlerName || null,
      },
    });

    // Recalculate match scores after updating commentary
    // Get match details for toss information
    const match = await db.match.findUnique({
      where: { id: matchId },
      select: {
        homeTeamId: true,
        awayTeamId: true,
        tossWinnerId: true,
        tossDecision: true,
      },
    });

    if (!match) {
      throw new Error("Match not found");
    }

    // Get all commentaries
    const commentaries = await db.commentary.findMany({
      where: { matchId },
    });

    // Calculate scores using the shared function
    const { homeScore, awayScore } = calculateMatchScores(match, commentaries);

    await db.match.update({
      where: { id: matchId },
      data: {
        homeScore,
        awayScore,
      },
    });

    // Revalidate relevant pages
    revalidatePath(`/matches/${matchId}`);
    revalidatePath("/dashboard/matches");
    revalidatePath(`/dashboard/matches/${matchId}`);

    return NextResponse.json({
      success: true,
      data: updatedCommentary,
    });
  } catch (error) {
    console.error("Update commentary error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update commentary" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string; commentaryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { matchId, commentaryId } = await params;

    await db.commentary.delete({
      where: { id: commentaryId },
    });

    // Recalculate match scores after deleting commentary
    // Get match details for toss information
    const match = await db.match.findUnique({
      where: { id: matchId },
      select: {
        homeTeamId: true,
        awayTeamId: true,
        tossWinnerId: true,
        tossDecision: true,
      },
    });

    if (!match) {
      throw new Error("Match not found");
    }

    // Get all commentaries
    const commentaries = await db.commentary.findMany({
      where: { matchId },
    });

    // Calculate scores using the shared function
    const { homeScore, awayScore } = calculateMatchScores(match, commentaries);

    await db.match.update({
      where: { id: matchId },
      data: {
        homeScore,
        awayScore,
      },
    });

    // Revalidate relevant pages
    revalidatePath(`/matches/${matchId}`);
    revalidatePath("/dashboard/matches");
    revalidatePath(`/dashboard/matches/${matchId}`);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete commentary error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete commentary" },
      { status: 500 }
    );
  }
}
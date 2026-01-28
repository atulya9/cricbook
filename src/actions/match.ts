"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { createMatchSchema } from "@/lib/validations";

// ==================== VALIDATION SCHEMAS ====================

const matchPredictionSchema = z.object({
  matchId: z.string(),
  predictedTeamId: z.string(),
});

const commentarySchema = z.object({
  matchId: z.string(),
  inningsNumber: z.number().min(1).max(4),
  overNumber: z.number().min(0),
  ballNumber: z.number().min(1).max(6),
  runs: z.number().min(0),
  isWicket: z.boolean().optional(),
  wicketType: z.string().optional(),
  isExtra: z.boolean().optional(),
  extraType: z.string().optional(),
  isBoundary: z.boolean().optional(),
  isSix: z.boolean().optional(),
  description: z.string().min(1),
  batsmanName: z.string().optional(),
  bowlerName: z.string().optional(),
});

const commentaryCommentSchema = z.object({
  commentaryId: z.string(),
  content: z.string().min(1).max(500),
});

const reactionSchema = z.object({
  targetId: z.string(),
  reactionType: z.enum(["bat", "ball", "wow", "clap", "mindblown", "fire"]),
});

const overPredictionSchema = z.object({
  overSummaryId: z.string(),
  predictedRuns: z.number().min(0).max(36),
  predictedWicket: z.boolean(),
});

const overSummarySchema = z.object({
  matchId: z.string(),
  inningsNumber: z.number().min(1).max(4),
  overNumber: z.number().min(0),
  balls: z.array(z.string()),
  totalRuns: z.number().min(0),
  wickets: z.number().min(0),
  extras: z.number().min(0),
  bowlerName: z.string().optional(),
});

const matchSummarySchema = z.object({
  matchId: z.string(),
  title: z.string().min(1),
  content: z.string().min(1),
});

const updateMatchSchema = z.object({
  status: z.enum(["upcoming", "live", "completed", "abandoned"]).optional(),
  venue: z.string().optional(),
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  weather: z.string().nullable().optional(),
  pitch: z.string().nullable().optional(),
  tossWinnerId: z.string().nullable().optional(),
  tossDecision: z.enum(["bat", "bowl"]).nullable().optional(),
  currentOver: z.number().nullable().optional(),
  currentInnings: z.number().nullable().optional(),
});

// ==================== MATCH PREDICTION ACTIONS ====================

export async function voteForTeam(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in to vote" };
  }

  const matchId = formData.get("matchId") as string;
  const predictedTeamId = formData.get("predictedTeamId") as string;

  const validatedData = matchPredictionSchema.safeParse({
    matchId,
    predictedTeamId,
  });

  if (!validatedData.success) {
    return { success: false, error: "Invalid data" };
  }

  try {
    await db.matchPrediction.upsert({
      where: {
        userId_matchId: {
          userId: session.user.id,
          matchId: validatedData.data.matchId,
        },
      },
      update: {
        predictedTeamId: validatedData.data.predictedTeamId,
      },
      create: {
        userId: session.user.id,
        matchId: validatedData.data.matchId,
        predictedTeamId: validatedData.data.predictedTeamId,
      },
    });

    revalidatePath(`/matches/${matchId}`);
    return { success: true };
  } catch (error) {
    console.error("Error voting for team:", error);
    return { success: false, error: "Failed to submit vote" };
  }
}

export async function getMatchPredictions(matchId: string) {
  try {
    const predictions = await db.matchPrediction.groupBy({
      by: ["predictedTeamId"],
      where: { matchId },
      _count: { id: true },
    });

    const total = predictions.reduce((sum, p) => sum + p._count.id, 0);
    
    return predictions.map((p) => ({
      teamId: p.predictedTeamId,
      count: p._count.id,
      percentage: total > 0 ? Math.round((p._count.id / total) * 100) : 0,
    }));
  } catch (error) {
    console.error("Error getting predictions:", error);
    return [];
  }
}

// ==================== COMMENTARY ACTIONS (ADMIN ONLY) ====================

export async function addCommentary(data: z.infer<typeof commentarySchema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return { success: false, error: "Only admins can add commentary" };
  }

  const validatedData = commentarySchema.safeParse(data);
  if (!validatedData.success) {
    return { success: false, error: "Invalid data" };
  }

  try {
    const commentary = await db.commentary.create({
      data: {
        ...validatedData.data,
        authorId: session.user.id,
      },
    });

    // Recalculate match scores after adding commentary
    // Get match details first
    const match = await db.match.findUnique({
      where: { id: validatedData.data.matchId },
      select: {
        id: true,
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
    const allCommentaries = await db.commentary.findMany({
      where: { matchId: validatedData.data.matchId },
    });

    const { homeScore, awayScore, currentOver, currentInnings } = calculateMatchScores(match, allCommentaries);

    // Update match with calculated scores and live match info
    await db.match.update({
      where: { id: validatedData.data.matchId },
      data: {
        homeScore,
        awayScore,
        currentOver,
        currentInnings,
      },
    });

    // Revalidate relevant pages
    revalidatePath(`/matches/${validatedData.data.matchId}`);
    revalidatePath("/dashboard/matches");
    revalidatePath(`/dashboard/matches/${validatedData.data.matchId}`);

    return { success: true, data: commentary };
  } catch (error) {
    console.error("Error adding commentary:", error);
    return { success: false, error: "Failed to add commentary" };
  }
}

export async function getMatchCommentary(matchId: string, inningsNumber = 1) {
  try {
    const commentaries = await db.commentary.findMany({
      where: { matchId, inningsNumber },
      orderBy: [
        { overNumber: "desc" },
        { ballNumber: "desc" },
        { createdAt: "desc" },
      ],
      include: {
        reactions: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
              },
            },
            reactions: true,
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
    });

    return commentaries;
  } catch (error) {
    console.error("Error getting commentary:", error);
    return [];
  }
}

// ==================== COMMENTARY REACTION ACTIONS ====================

export async function toggleCommentaryReaction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in to react" };
  }

  const commentaryId = formData.get("targetId") as string;
  const reactionType = formData.get("reactionType") as string;

  const validatedData = reactionSchema.safeParse({
    targetId: commentaryId,
    reactionType,
  });

  if (!validatedData.success) {
    return { success: false, error: "Invalid data" };
  }

  try {
    const existingReaction = await db.commentaryReaction.findUnique({
      where: {
        userId_commentaryId_reactionType: {
          userId: session.user.id,
          commentaryId: validatedData.data.targetId,
          reactionType: validatedData.data.reactionType,
        },
      },
    });

    if (existingReaction) {
      await db.commentaryReaction.delete({
        where: { id: existingReaction.id },
      });
    } else {
      await db.commentaryReaction.create({
        data: {
          userId: session.user.id,
          commentaryId: validatedData.data.targetId,
          reactionType: validatedData.data.reactionType,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error toggling reaction:", error);
    return { success: false, error: "Failed to toggle reaction" };
  }
}

// ==================== COMMENTARY COMMENT ACTIONS ====================

export async function addCommentaryComment(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in to comment" };
  }

  const commentaryId = formData.get("commentaryId") as string;
  const content = formData.get("content") as string;

  const validatedData = commentaryCommentSchema.safeParse({
    commentaryId,
    content,
  });

  if (!validatedData.success) {
    return { success: false, error: "Invalid data" };
  }

  try {
    const comment = await db.commentaryComment.create({
      data: {
        userId: session.user.id,
        commentaryId: validatedData.data.commentaryId,
        content: validatedData.data.content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return { success: true, data: comment };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { success: false, error: "Failed to add comment" };
  }
}

export async function toggleCommentReaction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in to react" };
  }

  const commentId = formData.get("targetId") as string;
  const reactionType = formData.get("reactionType") as string;

  const validatedData = reactionSchema.safeParse({
    targetId: commentId,
    reactionType,
  });

  if (!validatedData.success) {
    return { success: false, error: "Invalid data" };
  }

  try {
    const existingReaction = await db.commentaryCommentReaction.findUnique({
      where: {
        userId_commentId_reactionType: {
          userId: session.user.id,
          commentId: validatedData.data.targetId,
          reactionType: validatedData.data.reactionType,
        },
      },
    });

    if (existingReaction) {
      await db.commentaryCommentReaction.delete({
        where: { id: existingReaction.id },
      });
    } else {
      await db.commentaryCommentReaction.create({
        data: {
          userId: session.user.id,
          commentId: validatedData.data.targetId,
          reactionType: validatedData.data.reactionType,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error toggling reaction:", error);
    return { success: false, error: "Failed to toggle reaction" };
  }
}

// ==================== OVER SUMMARY ACTIONS ====================

export async function addOverSummary(data: z.infer<typeof overSummarySchema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return { success: false, error: "Only admins can add over summaries" };
  }

  const validatedData = overSummarySchema.safeParse(data);
  if (!validatedData.success) {
    return { success: false, error: "Invalid data" };
  }

  try {
    const overSummary = await db.overSummary.upsert({
      where: {
        matchId_inningsNumber_overNumber: {
          matchId: validatedData.data.matchId,
          inningsNumber: validatedData.data.inningsNumber,
          overNumber: validatedData.data.overNumber,
        },
      },
      update: {
        balls: JSON.stringify(validatedData.data.balls),
        totalRuns: validatedData.data.totalRuns,
        wickets: validatedData.data.wickets,
        extras: validatedData.data.extras,
        bowlerName: validatedData.data.bowlerName,
      },
      create: {
        matchId: validatedData.data.matchId,
        inningsNumber: validatedData.data.inningsNumber,
        overNumber: validatedData.data.overNumber,
        balls: JSON.stringify(validatedData.data.balls),
        totalRuns: validatedData.data.totalRuns,
        wickets: validatedData.data.wickets,
        extras: validatedData.data.extras,
        bowlerName: validatedData.data.bowlerName,
      },
    });

    revalidatePath(`/matches/${data.matchId}`);
    return { success: true, data: overSummary };
  } catch (error) {
    console.error("Error adding over summary:", error);
    return { success: false, error: "Failed to add over summary" };
  }
}

export async function getOverSummaries(matchId: string, inningsNumber = 1) {
  try {
    const overSummaries = await db.overSummary.findMany({
      where: { matchId, inningsNumber },
      orderBy: { overNumber: "desc" },
      include: {
        predictions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return overSummaries;
  } catch (error) {
    console.error("Error getting over summaries:", error);
    return [];
  }
}

// ==================== OVER PREDICTION ACTIONS ====================

export async function submitOverPrediction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in to predict" };
  }

  const overSummaryId = formData.get("overSummaryId") as string;
  const predictedRuns = parseInt(formData.get("predictedRuns") as string, 10);
  const predictedWicket = formData.get("predictedWicket") === "true";

  const validatedData = overPredictionSchema.safeParse({
    overSummaryId,
    predictedRuns,
    predictedWicket,
  });

  if (!validatedData.success) {
    return { success: false, error: "Invalid data" };
  }

  try {
    const prediction = await db.overPrediction.upsert({
      where: {
        userId_overSummaryId: {
          userId: session.user.id,
          overSummaryId: validatedData.data.overSummaryId,
        },
      },
      update: {
        predictedRuns: validatedData.data.predictedRuns,
        predictedWicket: validatedData.data.predictedWicket,
      },
      create: {
        userId: session.user.id,
        overSummaryId: validatedData.data.overSummaryId,
        predictedRuns: validatedData.data.predictedRuns,
        predictedWicket: validatedData.data.predictedWicket,
      },
    });

    const overSummary = await db.overSummary.findUnique({
      where: { id: overSummaryId },
      select: { matchId: true },
    });

    if (overSummary) {
      revalidatePath(`/matches/${overSummary.matchId}`);
    }

    return { success: true, data: prediction };
  } catch (error) {
    console.error("Error submitting prediction:", error);
    return { success: false, error: "Failed to submit prediction" };
  }
}

// ==================== MATCH SUMMARY ACTIONS ====================

export async function updateMatchSummary(data: z.infer<typeof matchSummarySchema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return { success: false, error: "Only admins can update match summary" };
  }

  const validatedData = matchSummarySchema.safeParse(data);
  if (!validatedData.success) {
    return { success: false, error: "Invalid data" };
  }

  try {
    const summary = await db.matchSummary.upsert({
      where: { matchId: validatedData.data.matchId },
      update: {
        title: validatedData.data.title,
        content: validatedData.data.content,
      },
      create: {
        matchId: validatedData.data.matchId,
        title: validatedData.data.title,
        content: validatedData.data.content,
        authorId: session.user.id,
      },
    });

    revalidatePath(`/matches/${data.matchId}`);
    return { success: true, data: summary };
  } catch (error) {
    console.error("Error updating match summary:", error);
    return { success: false, error: "Failed to update match summary" };
  }
}

export async function getMatchSummary(matchId: string) {
  try {
    const summary = await db.matchSummary.findUnique({
      where: { matchId },
    });

    return summary;
  } catch (error) {
    console.error("Error getting match summary:", error);
    return null;
  }
}

// ==================== MATCH MANAGEMENT ACTIONS ====================

// Calculate match scores from commentary
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

    // Add runs
    inningsData[innings].runs += commentary.runs || 0;

    // Add wickets
    if (commentary.isWicket) {
      inningsData[innings].wickets += 1;
    }

    // Track the maximum over and ball for this innings
    inningsData[innings].maxOver = Math.max(inningsData[innings].maxOver, commentary.overNumber || 0);
    inningsData[innings].maxBall = Math.max(inningsData[innings].maxBall, commentary.ballNumber || 0);

    // Handle extras (they add to runs but not to batsman scoring)
    if (commentary.isExtra) {
      // Extras are already included in the runs field
    }
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

// Determine match result based on commentary and match format
function calculateMatchResult(match: any, homeScore: string | null, awayScore: string | null, commentaries: any[]) {
  if (!homeScore || !awayScore) return null;

  const [homeRuns] = homeScore.split('/').map(Number);
  const [awayRuns] = awayScore.split('/').map(Number);

  // Simple win/loss logic (can be enhanced based on match format)
  if (homeRuns > awayRuns) {
    return `${match.homeTeam.name} won by ${homeRuns - awayRuns} runs`;
  } else if (awayRuns > homeRuns) {
    return `${match.awayTeam.name} won by ${awayRuns - homeRuns} runs`;
  } else {
    return "Match tied";
  }
}

export async function getMatchById(matchId: string) {
  try {
    const match = await db.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
        winner: true,
        series: true,
      },
    });

    return match;
  } catch (error) {
    console.error("Error getting match:", error);
    return null;
  }
}

export async function updateMatch(matchId: string, data: z.infer<typeof updateMatchSchema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return { success: false, error: "Admin access required" };
  }

  const validatedData = updateMatchSchema.safeParse(data);
  if (!validatedData.success) {
    return { success: false, error: "Invalid data" };
  }

  try {
    const updatedMatch = await db.match.update({
      where: { id: matchId },
      data: validatedData.data,
    });

    return { success: true, data: updatedMatch };
  } catch (error) {
    console.error("Error updating match:", error);
    return { success: false, error: "Failed to update match" };
  }
}

export async function createMatch(data: z.infer<typeof createMatchSchema>) {
  console.log("Received raw data:", data);

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return { success: false, error: "Admin access required" };
  }

  const validatedData = createMatchSchema.safeParse(data);
  if (!validatedData.success) {
    console.error("Validation errors:", validatedData.error.errors);
    return { success: false, error: "Invalid data: " + validatedData.error.errors.map(e => e.message).join(", ") };
  }

  console.log("Validated data:", validatedData.data);

  try {
    // First, verify that the referenced entities exist
    console.log("Checking team IDs:", validatedData.data.homeTeamId, validatedData.data.awayTeamId);

    const [homeTeam, awayTeam, series] = await Promise.all([
      db.team.findUnique({ where: { id: validatedData.data.homeTeamId } }),
      db.team.findUnique({ where: { id: validatedData.data.awayTeamId } }),
      validatedData.data.seriesId ? db.series.findUnique({ where: { id: validatedData.data.seriesId } }) : null,
    ]);

    console.log("Home team found:", !!homeTeam, homeTeam?.name, "ID:", validatedData.data.homeTeamId);
    console.log("Away team found:", !!awayTeam, awayTeam?.name, "ID:", validatedData.data.awayTeamId);
    console.log("Series found:", !!series, series?.name, "ID:", validatedData.data.seriesId);

    if (!homeTeam) {
      return { success: false, error: `Home team with ID ${validatedData.data.homeTeamId} not found` };
    }
    if (!awayTeam) {
      return { success: false, error: `Away team with ID ${validatedData.data.awayTeamId} not found` };
    }
    if (validatedData.data.seriesId && !series) {
      return { success: false, error: `Series with ID ${validatedData.data.seriesId} not found` };
    }

    const matchData = {
      matchType: validatedData.data.matchType,
      format: validatedData.data.format,
      venue: validatedData.data.venue,
      city: validatedData.data.city || null,
      country: validatedData.data.country || null,
      startDate: new Date(validatedData.data.startDate),
      endDate: validatedData.data.endDate ? new Date(validatedData.data.endDate) : null,
      status: "upcoming" as const,
      homeTeamId: validatedData.data.homeTeamId,
      awayTeamId: validatedData.data.awayTeamId,
      seriesId: validatedData.data.seriesId || null,
      weather: validatedData.data.weather || null,
      pitch: validatedData.data.pitch || null,
    };

    console.log("Creating match with data:", matchData);

    const match = await db.match.create({
      data: matchData,
    });

    revalidatePath("/dashboard/matches");
    return { success: true, data: match };
  } catch (error) {
    console.error("Error creating match:", error);

    // Try to create a test match with hardcoded data to isolate the issue
    try {
      console.log("Attempting to create test match with hardcoded data...");
      const testTeams = await db.team.findMany({ take: 2 });
      if (testTeams.length >= 2) {
        const testMatch = await db.match.create({
          data: {
            matchType: "t20",
            format: "league",
            venue: "Test Venue",
            startDate: new Date(),
            status: "upcoming",
            homeTeamId: testTeams[0].id,
            awayTeamId: testTeams[1].id,
          },
        });
        console.log("Test match created successfully:", testMatch.id);
      } else {
        console.log("Not enough teams for test");
      }
    } catch (testError) {
      console.error("Test match creation also failed:", testError);
    }

    return { success: false, error: `Failed to create match: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}
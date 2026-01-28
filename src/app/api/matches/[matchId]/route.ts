import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;

    const match = await db.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
        winner: true,
        series: true,
      },
    });

    if (!match) {
      return NextResponse.json(
        { success: false, error: "Match not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: match,
    });
  } catch (error) {
    console.error("Get match error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch match" },
      { status: 500 }
    );
  }
}
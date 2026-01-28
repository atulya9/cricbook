import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // live, upcoming, completed
    const format = searchParams.get("format"); // international, domestic, league
    const matchType = searchParams.get("matchType"); // test, odi, t20, t10
    const teamId = searchParams.get("teamId");
    const seriesId = searchParams.get("seriesId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (format) {
      where.format = format;
    }

    if (matchType) {
      where.matchType = matchType;
    }

    if (teamId) {
      where.OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }];
    }

    if (seriesId) {
      where.seriesId = seriesId;
    }

    // Determine ordering based on status
    let orderBy: { startDate: "asc" | "desc" } = { startDate: "desc" };
    if (status === "upcoming") {
      orderBy = { startDate: "asc" }; // Upcoming matches should show nearest first
    }

    const [matches, total] = await Promise.all([
      db.match.findMany({
        where,
        include: {
          homeTeam: true,
          awayTeam: true,
          winner: true,
          series: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.match.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: matches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + matches.length < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get matches error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}
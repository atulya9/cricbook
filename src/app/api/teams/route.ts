import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const teams = await db.team.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: teams,
    });
  } catch (error) {
    console.error("Get teams error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
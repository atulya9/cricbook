import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const series = await db.series.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: series,
    });
  } catch (error) {
    console.error("Get series error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch series" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    const { searchParams } = new URL(request.url);
    const inningsNumber = searchParams.get("inningsNumber")
      ? parseInt(searchParams.get("inningsNumber")!, 10)
      : undefined;

    const commentaries = await db.commentary.findMany({
      where: {
        matchId,
        ...(inningsNumber && { inningsNumber }),
      },
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
      orderBy: [
        { overNumber: "desc" },
        { ballNumber: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({
      success: true,
      data: commentaries,
    });
  } catch (error) {
    console.error("Get commentaries error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch commentaries" },
      { status: 500 }
    );
  }
}
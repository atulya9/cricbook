import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const authorId = searchParams.get("authorId");
    const matchId = searchParams.get("matchId");
    const hashtag = searchParams.get("hashtag");

    const skip = (page - 1) * limit;
    const session = await getServerSession(authOptions);

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (authorId) {
      where.authorId = authorId;
    }

    if (matchId) {
      where.matchId = matchId;
    }

    if (hashtag) {
      where.hashtags = {
        some: {
          hashtag: {
            name: hashtag.toLowerCase(),
          },
        },
      };
    }

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              isVerified: true,
            },
          },
          match: {
            include: {
              homeTeam: true,
              awayTeam: true,
            },
          },
          originalPost: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  avatar: true,
                  isVerified: true,
                },
              },
            },
          },
          hashtags: {
            include: {
              hashtag: true,
            },
          },
          poll: {
            include: {
              options: {
                include: {
                  _count: {
                    select: { votes: true },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
              reposts: true,
            },
          },
          ...(session?.user?.id && {
            likes: {
              where: { userId: session.user.id },
              select: { id: true },
            },
            bookmarks: {
              where: { userId: session.user.id },
              select: { id: true },
            },
            reposts: {
              where: { authorId: session.user.id },
              select: { id: true },
            },
          }),
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.post.count({ where }),
    ]);

    // Transform posts to include isLiked and isBookmarked
    const transformedPosts = posts.map((post) => ({
      ...post,
      isLiked: post.likes?.length > 0,
      isBookmarked: post.bookmarks?.length > 0,
      isReposted: post.reposts?.length > 0,
      likes: undefined,
      bookmarks: undefined,
      reposts: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: transformedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + posts.length < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
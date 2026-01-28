import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostCard } from "@/components/feed/post-card";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Your saved posts",
};

export default async function BookmarksPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const bookmarks = await db.bookmark.findMany({
    where: { userId: session.user.id },
    include: {
      post: {
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
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      {/* Header */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Bookmarks</h1>
          <p className="text-sm text-gray-500">@{session.user.username}</p>
        </div>
      </div>

      {/* Bookmarked posts */}
      <div>
        {bookmarks.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Save posts for later
            </h2>
            <p className="text-gray-500">
              Bookmark posts to easily find them again in the future.
            </p>
          </div>
        ) : (
          bookmarks.map((bookmark) => (
            <PostCard
              key={bookmark.id}
              post={{
                ...bookmark.post,
                isBookmarked: true,
                isLiked: false,
              } as never}
            />
          ))
        )}
      </div>
    </div>
  );
}
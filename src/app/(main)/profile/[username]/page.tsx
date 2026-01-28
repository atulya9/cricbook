import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { CalendarDays, MapPin, LinkIcon, BadgeCheck } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedList } from "@/components/feed/feed-list";
import { formatDate, formatNumber } from "@/lib/utils";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await db.user.findUnique({
    where: { username },
    select: { name: true, username: true, bio: true },
  });

  if (!user) {
    return { title: "User not found" };
  }

  return {
    title: `${user.name} (@${user.username})`,
    description: user.bio || `Check out ${user.name}'s profile on Cricbook`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const session = await getServerSession(authOptions);

  const user = await db.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Check if current user is following this profile
  let isFollowing = false;
  if (session?.user?.id && session.user.id !== user.id) {
    const follow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: user.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  const isOwnProfile = session?.user?.id === user.id;

  return (
    <div>
      {/* Cover image */}
      <div className="h-48 bg-gradient-to-r from-green-600 to-green-700 relative">
        {user.coverImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${user.coverImage})` }}
          />
        )}
      </div>

      {/* Profile info */}
      <div className="relative px-4 pb-4">
        {/* Avatar */}
        <div className="absolute -top-16">
          <Avatar
            src={user.avatar}
            alt={user.name}
            fallback={user.username}
            size="xl"
            className="border-4 border-white"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4">
          {isOwnProfile ? (
            <Link href="/settings">
              <Button variant="outline">Edit profile</Button>
            </Link>
          ) : (
            <Button variant={isFollowing ? "outline" : "default"}>
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>

        {/* User info */}
        <div className="mt-10">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            {user.isVerified && (
              <BadgeCheck className="h-5 w-5 text-green-600" />
            )}
          </div>
          <p className="text-gray-500">@{user.username}</p>

          {user.bio && (
            <p className="mt-3 text-gray-900">{user.bio}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {user.location}
              </span>
            )}
            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-green-600 hover:underline"
              >
                <LinkIcon className="h-4 w-4" />
                {user.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            <span className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              Joined {formatDate(user.createdAt, "MMMM yyyy")}
            </span>
          </div>

          {(user.favoriteTeam || user.favoritePlayer) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {user.favoriteTeam && (
                <Badge variant="outline">🏏 {user.favoriteTeam}</Badge>
              )}
              {user.favoritePlayer && (
                <Badge variant="outline">⭐ {user.favoritePlayer}</Badge>
              )}
            </div>
          )}

          <div className="mt-3 flex gap-4 text-sm">
            <Link href={`/profile/${user.username}/following`} className="hover:underline">
              <span className="font-bold text-gray-900">
                {formatNumber(user._count.following)}
              </span>{" "}
              <span className="text-gray-500">Following</span>
            </Link>
            <Link href={`/profile/${user.username}/followers`} className="hover:underline">
              <span className="font-bold text-gray-900">
                {formatNumber(user._count.followers)}
              </span>{" "}
              <span className="text-gray-500">Followers</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="mt-4">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4">
          <TabsTrigger value="posts" className="flex-1">
            Posts
          </TabsTrigger>
          <TabsTrigger value="replies" className="flex-1">
            Replies
          </TabsTrigger>
          <TabsTrigger value="media" className="flex-1">
            Media
          </TabsTrigger>
          <TabsTrigger value="likes" className="flex-1">
            Likes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <FeedList authorId={user.id} />
        </TabsContent>

        <TabsContent value="replies">
          <div className="p-8 text-center text-gray-500">
            No replies yet
          </div>
        </TabsContent>

        <TabsContent value="media">
          <div className="p-8 text-center text-gray-500">
            No media posts yet
          </div>
        </TabsContent>

        <TabsContent value="likes">
          <div className="p-8 text-center text-gray-500">
            Likes are private
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share,
  MoreHorizontal,
  BadgeCheck,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import { likePost, bookmarkPost, repost } from "@/actions/posts";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [isReposted, setIsReposted] = useState(post.isReposted || false);
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);

  const handleLike = async () => {
    const prevLiked = isLiked;
    const prevCount = likesCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    const result = await likePost(post.id);
    if (!result.success) {
      // Rollback on error
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const handleBookmark = async () => {
    const prevBookmarked = isBookmarked;
    setIsBookmarked(!isBookmarked);

    const result = await bookmarkPost(post.id);
    if (!result.success) {
      setIsBookmarked(prevBookmarked);
    }
  };

  const handleRepost = async () => {
    const prevReposted = isReposted;
    setIsReposted(!isReposted);

    const result = await repost(post.id);
    if (!result.success) {
      setIsReposted(prevReposted);
    }
  };

  // Parse images if stored as JSON string
  const images = post.images ? JSON.parse(post.images) : [];

  return (
    <article className="border-b border-gray-200 p-4 hover:bg-gray-50/50 transition">
      {/* Repost indicator */}
      {post.isRepost && post.originalPost && (
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
          <Repeat2 className="h-4 w-4" />
          <span>{post.author.name} reposted</span>
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/profile/${post.author.username}`} className="shrink-0">
          <Avatar
            src={post.author.avatar}
            alt={post.author.name}
            fallback={post.author.username}
            size="md"
          />
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm">
              <Link
                href={`/profile/${post.author.username}`}
                className="font-bold text-gray-900 hover:underline"
              >
                {post.author.name}
              </Link>
              {post.author.isVerified && (
                <BadgeCheck className="h-4 w-4 text-green-600" />
              )}
              <span className="text-gray-500">@{post.author.username}</span>
              <span className="text-gray-500">·</span>
              <RelativeTime
                date={post.createdAt}
                className="text-gray-500"
              />
            </div>
            <button className="rounded-full p-1 hover:bg-gray-200">
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Post content */}
          <div className="mt-1">
            <p className="text-gray-900 whitespace-pre-wrap break-words">
              {renderPostContent(post.content)}
            </p>
          </div>

          {/* Match tag */}
          {post.match && (
            <Link href={`/matches/${post.match.id}`}>
              <Badge variant="outline" className="mt-2">
                🏏 {post.match.homeTeam.shortName} vs {post.match.awayTeam.shortName}
              </Badge>
            </Link>
          )}

          {/* Images */}
          {images.length > 0 && (
            <div
              className={`mt-3 grid gap-2 ${
                images.length === 1
                  ? "grid-cols-1"
                  : images.length === 2
                  ? "grid-cols-2"
                  : images.length === 3
                  ? "grid-cols-2"
                  : "grid-cols-2"
              }`}
            >
              {images.slice(0, 4).map((image: string, index: number) => (
                <div
                  key={index}
                  className={`relative overflow-hidden rounded-xl ${
                    images.length === 3 && index === 0 ? "row-span-2" : ""
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Post image ${index + 1}`}
                    width={400}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Poll */}
          {post.poll && <PollDisplay poll={post.poll} />}

          {/* Actions */}
          <div className="mt-3 flex items-center justify-between max-w-md">
            <ActionButton
              icon={MessageCircle}
              count={post._count?.comments || 0}
              onClick={() => {}}
              label="Reply"
            />
            <ActionButton
              icon={Repeat2}
              count={post._count?.reposts || 0}
              onClick={handleRepost}
              isActive={isReposted}
              activeColor="text-green-600"
              label="Repost"
            />
            <ActionButton
              icon={Heart}
              count={likesCount}
              onClick={handleLike}
              isActive={isLiked}
              activeColor="text-red-500"
              label="Like"
            />
            <ActionButton
              icon={Bookmark}
              onClick={handleBookmark}
              isActive={isBookmarked}
              activeColor="text-green-600"
              label="Bookmark"
            />
            <ActionButton icon={Share} onClick={() => {}} label="Share" />
          </div>
        </div>
      </div>
    </article>
  );
}

interface ActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  onClick: () => void;
  isActive?: boolean;
  activeColor?: string;
  label: string;
}

function ActionButton({
  icon: Icon,
  count,
  onClick,
  isActive,
  activeColor,
  label,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`group flex items-center gap-1 text-gray-500 hover:${activeColor || "text-green-600"} transition`}
    >
      <div className="rounded-full p-2 group-hover:bg-gray-100">
        <Icon
          className={`h-4 w-4 ${isActive ? activeColor : ""} ${
            isActive && (activeColor === "text-red-500" || activeColor === "text-green-600") ? "fill-current" : ""
          }`}
        />
      </div>
      {count !== undefined && count > 0 && (
        <span className={`text-xs ${isActive ? activeColor : ""}`}>
          {formatNumber(count)}
        </span>
      )}
    </button>
  );
}

function renderPostContent(content: string) {
  // Split content to handle hashtags and mentions
  const parts = content.split(/(\s)/);

  return parts.map((part, index) => {
    if (part.startsWith("#")) {
      const hashtag = part.slice(1);
      return (
        <Link
          key={index}
          href={`/explore?hashtag=${hashtag}`}
          className="text-green-600 hover:underline"
        >
          {part}
        </Link>
      );
    }
    if (part.startsWith("@")) {
      const username = part.slice(1);
      return (
        <Link
          key={index}
          href={`/profile/${username}`}
          className="text-green-600 hover:underline"
        >
          {part}
        </Link>
      );
    }
    return part;
  });
}

interface PollDisplayProps {
  poll: NonNullable<Post["poll"]>;
}

function PollDisplay({ poll }: PollDisplayProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const totalVotes = poll.options.reduce(
    (sum, option) => sum + (option._count?.votes || 0),
    0
  );

  const hasExpired = new Date() > new Date(poll.expiresAt);

  return (
    <div className="mt-3 space-y-2">
      {poll.options.map((option) => {
        const voteCount = option._count?.votes || 0;
        const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
        const isSelected = selectedOption === option.id;

        return (
          <button
            key={option.id}
            onClick={() => !hasExpired && setSelectedOption(option.id)}
            disabled={hasExpired}
            className={`relative w-full rounded-lg border p-3 text-left transition ${
              isSelected
                ? "border-green-600 bg-green-50"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div
              className="absolute inset-0 rounded-lg bg-green-100"
              style={{ width: `${percentage}%` }}
            />
            <div className="relative flex items-center justify-between">
              <span className="font-medium">{option.text}</span>
              <span className="text-sm text-gray-500">
                {percentage.toFixed(0)}%
              </span>
            </div>
          </button>
        );
      })}
      <p className="text-xs text-gray-500">
        {formatNumber(totalVotes)} votes •{" "}
        {hasExpired ? "Final results" : <span>Ends <RelativeTime date={poll.expiresAt} /></span>}
      </p>
    </div>
  );
}
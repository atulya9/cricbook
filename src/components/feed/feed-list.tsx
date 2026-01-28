"use client";

import { useState, useEffect } from "react";
import { PostCard } from "./post-card";
import type { Post } from "@/types";

interface FeedListProps {
  initialPosts?: Post[];
  authorId?: string;
  matchId?: string;
  hashtag?: string;
}

export function FeedList({ initialPosts = [], authorId, matchId, hashtag }: FeedListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(!initialPosts.length);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNum: number) => {
    try {
      const params = new URLSearchParams({ page: pageNum.toString(), limit: "20" });
      if (authorId) params.set("authorId", authorId);
      if (matchId) params.set("matchId", matchId);
      if (hashtag) params.set("hashtag", hashtag);

      const response = await fetch(`/api/posts?${params}`);
      const data = await response.json();

      if (data.success) {
        if (pageNum === 1) {
          setPosts(data.data);
        } else {
          setPosts((prev) => [...prev, ...data.data]);
        }
        setHasMore(data.pagination.hasNext);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialPosts.length) {
      fetchPosts(1);
    }
  }, [authorId, matchId, hashtag]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setIsLoading(true);
      setPage((prev) => prev + 1);
      fetchPosts(page + 1);
    }
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">No posts yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasMore && (
        <div className="p-4 text-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="text-green-600 hover:underline disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
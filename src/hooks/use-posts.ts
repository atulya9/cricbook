"use client";

import { useState, useEffect, useCallback } from "react";
import type { Post, PaginatedResponse } from "@/types";

interface UsePostsOptions {
  authorId?: string;
  matchId?: string;
  hashtag?: string;
  initialData?: Post[];
}

export function usePosts(options: UsePostsOptions = {}) {
  const { authorId, matchId, hashtag, initialData = [] } = options;
  const [posts, setPosts] = useState<Post[]>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData.length);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (pageNum: number, append = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "20",
      });

      if (authorId) params.set("authorId", authorId);
      if (matchId) params.set("matchId", matchId);
      if (hashtag) params.set("hashtag", hashtag);

      const response = await fetch(`/api/posts?${params}`);
      const data: { success: boolean; data: Post[]; pagination: PaginatedResponse<Post>["pagination"]; error?: string } = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch posts");
      }

      if (append) {
        setPosts((prev) => [...prev, ...data.data]);
      } else {
        setPosts(data.data);
      }

      setHasMore(data.pagination.hasNext);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
    } finally {
      setIsLoading(false);
    }
  }, [authorId, matchId, hashtag]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, true);
    }
  }, [isLoading, hasMore, page, fetchPosts]);

  const refresh = useCallback(() => {
    setPage(1);
    fetchPosts(1, false);
  }, [fetchPosts]);

  const addPost = useCallback((post: Post) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  const removePost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const updatePost = useCallback((postId: string, updates: Partial<Post>) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...updates } : p))
    );
  }, []);

  useEffect(() => {
    if (!initialData.length) {
      fetchPosts(1);
    }
  }, [fetchPosts, initialData.length]);

  return {
    posts,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
    addPost,
    removePost,
    updatePost,
  };
}
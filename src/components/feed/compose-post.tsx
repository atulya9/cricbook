"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Image as ImageIcon, BarChart3, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createPost } from "@/actions/posts";

interface ComposePostProps {
  onPostCreated?: () => void;
}

export function ComposePost({ onPostCreated }: ComposePostProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);

  const maxLength = 500;
  const remainingChars = maxLength - content.length;

  const handleSubmit = async () => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const postData: { content: string; poll?: { options: string[]; expiresIn: number } } = {
        content: content.trim(),
      };

      if (showPoll && pollOptions.filter((o) => o.trim()).length >= 2) {
        postData.poll = {
          options: pollOptions.filter((o) => o.trim()),
          expiresIn: 1, // 1 day
        };
      }

      const result = await createPost(postData);

      if (result.success) {
        setContent("");
        setShowPoll(false);
        setPollOptions(["", ""]);
        onPostCreated?.();
      }
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="border-b border-gray-200 p-4">
        <p className="text-center text-gray-500">
          Sign in to share your cricket thoughts!
        </p>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex gap-3">
        <Avatar
          src={session.user.image}
          alt={session.user.name || "User"}
          fallback={session.user.username}
          size="md"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening in cricket?"
            className="w-full resize-none border-0 bg-transparent text-lg placeholder:text-gray-500 focus:outline-none"
            rows={3}
            maxLength={maxLength}
          />

          {/* Poll options */}
          {showPoll && (
            <div className="mt-3 space-y-2 rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Poll</span>
                <button
                  onClick={() => {
                    setShowPoll(false);
                    setPollOptions(["", ""]);
                  }}
                  className="rounded-full p-1 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {pollOptions.map((option, index) => (
                <input
                  key={index}
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...pollOptions];
                    newOptions[index] = e.target.value;
                    setPollOptions(newOptions);
                  }}
                  placeholder={`Option ${index + 1}`}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                  maxLength={50}
                />
              ))}
              {pollOptions.length < 4 && (
                <button
                  onClick={() => setPollOptions([...pollOptions, ""])}
                  className="text-sm text-green-600 hover:underline"
                >
                  + Add option
                </button>
              )}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-full p-2 text-green-600 hover:bg-green-50"
                title="Add image"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setShowPoll(!showPoll)}
                className={`rounded-full p-2 hover:bg-green-50 ${
                  showPoll ? "bg-green-50 text-green-600" : "text-green-600"
                }`}
                title="Create poll"
              >
                <BarChart3 className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-sm ${
                  remainingChars < 20
                    ? remainingChars < 0
                      ? "text-red-500"
                      : "text-yellow-500"
                    : "text-gray-500"
                }`}
              >
                {remainingChars}
              </span>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || remainingChars < 0 || isLoading}
                isLoading={isLoading}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
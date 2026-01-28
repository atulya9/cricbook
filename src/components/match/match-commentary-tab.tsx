"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react";
import { getAvatarUrl } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import {
  toggleCommentaryReaction,
  addCommentaryComment,
  toggleCommentReaction,
} from "@/actions/match";
import { REACTION_TYPES, type ReactionType, type Commentary, type CommentaryComment, type CommentaryReaction, type CommentaryCommentReaction, type User } from "@/types";



interface MatchCommentaryTabProps {
  matchId: string;
  commentaries: Commentary[];
  inningsNumber: number;
  onInningsChange: (innings: number) => void;
  onCommentariesUpdate: (commentaries: Commentary[]) => void;
  onRefreshData?: () => void;
}

export function MatchCommentaryTab({
  matchId,
  commentaries,
  inningsNumber,
  onInningsChange,
  onCommentariesUpdate,
}: MatchCommentaryTabProps) {
  const { data: session } = useSession();

  return (
    <div className="p-4 space-y-4">
      {/* Innings Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Innings:</span>
        <div className="flex gap-1">
          {[1, 2].map((innings) => (
            <Button
              key={innings}
              variant={inningsNumber === innings ? "default" : "outline"}
              size="sm"
              onClick={() => onInningsChange(innings)}
            >
              {innings === 1 ? "1st" : "2nd"}
            </Button>
          ))}
        </div>
      </div>



      {/* Commentary List */}
      {commentaries.length > 0 ? (
        <div className="space-y-3">
          {commentaries.map((commentary) => (
            <CommentaryCard
              key={commentary.id}
              commentary={commentary}
              currentUserId={session?.user?.id}
              onUpdate={(updatedCommentary) => {
                onCommentariesUpdate(
                  commentaries.map((c) =>
                    c.id === updatedCommentary.id ? updatedCommentary : c
                  )
                );
              }}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No commentary available yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface CommentaryCardProps {
  commentary: Commentary;
  currentUserId?: string;
  onUpdate: (commentary: Commentary) => void;
}

function CommentaryCard({ commentary, currentUserId, onUpdate }: CommentaryCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isPending, startTransition] = useTransition();

  const getBallLabel = () => {
    return `${commentary.overNumber}.${commentary.ballNumber}`;
  };

  const getRunsDisplay = () => {
    if (commentary.isWicket) return "W";
    if (commentary.isSix) return "6";
    if (commentary.isBoundary) return "4";
    if (commentary.isExtra) {
      return `${commentary.runs}${commentary.extraType?.charAt(0).toUpperCase() || "E"}`;
    }
    return commentary.runs.toString();
  };

  const handleReaction = (reactionType: ReactionType) => {
    if (!currentUserId) return;

    // Optimistically update the reaction
    const reactions = commentary.reactions || [];
    const hasReacted = reactions.some(
      (r) => r.reactionType === reactionType && r.userId === currentUserId
    );

    const updatedReactions = hasReacted
      ? reactions.filter(
          (r) => !(r.reactionType === reactionType && r.userId === currentUserId)
        )
      : [
          ...reactions,
          {
            id: "temp", // temporary id
            userId: currentUserId,
            reactionType,
          },
        ];

    onUpdate({
      ...commentary,
      reactions: updatedReactions as CommentaryReaction[],
      _count: {
        reactions: updatedReactions.length,
        comments: commentary._count?.comments || 0,
      },
    });

    const formData = new FormData();
    formData.append("targetId", commentary.id);
    formData.append("reactionType", reactionType);

    startTransition(async () => {
      const result = await toggleCommentaryReaction(formData);
      if (!result.success) {
        // Rollback on error
        onUpdate(commentary);
      }
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !currentUserId) return;

    const formData = new FormData();
    formData.append("commentaryId", commentary.id);
    formData.append("content", newComment);

    startTransition(async () => {
      const result = await addCommentaryComment(formData);
      if (result.success && result.data) {
        const newComment = {
          ...result.data,
          reactions: [],
          _count: { reactions: 0 },
        } as unknown as CommentaryComment;
        onUpdate({
          ...commentary,
          comments: [newComment, ...(commentary.comments || [])],
          _count: {
            reactions: commentary._count?.reactions || 0,
            comments: (commentary._count?.comments || 0) + 1,
          },
        });
        setNewComment("");
      }
    });
  };

  // Group reactions by type
  const reactionCounts = REACTION_TYPES.map((rt) => ({
    ...rt,
    count: (commentary.reactions || []).filter((r) => r.reactionType === rt.type).length,
    hasReacted: (commentary.reactions || []).some(
      (r) => r.reactionType === rt.type && r.userId === currentUserId
    ),
  }));

  return (
    <Card
      className={`${
        commentary.isWicket
          ? "border-l-4 border-l-red-500"
          : commentary.isSix
          ? "border-l-4 border-l-purple-500"
          : commentary.isBoundary
          ? "border-l-4 border-l-blue-500"
          : ""
      }`}
    >
      <CardContent className="py-4">
        {/* Ball Info Header */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
              commentary.isWicket
                ? "bg-red-500"
                : commentary.isSix
                ? "bg-purple-500"
                : commentary.isBoundary
                ? "bg-blue-500"
                : "bg-gray-500"
            }`}
          >
            {getRunsDisplay()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{getBallLabel()}</span>
              {commentary.isWicket && (
                <Badge variant="destructive" className="text-xs">
                  WICKET
                </Badge>
              )}
              {commentary.isSix && (
                <Badge variant="default" className="bg-purple-500 text-xs">
                  SIX
                </Badge>
              )}
              {commentary.isBoundary && !commentary.isSix && (
                <Badge variant="default" className="bg-blue-500 text-xs">
                  FOUR
                </Badge>
              )}
              {commentary.isExtra && (
                <Badge variant="secondary" className="text-xs">
                  {commentary.extraType?.toUpperCase()}
                </Badge>
              )}
            </div>
            <p className="text-gray-700">{commentary.description}</p>
            {(commentary.batsmanName || commentary.bowlerName) && (
              <div className="flex gap-4 mt-1 text-sm text-gray-500">
                {commentary.bowlerName && <span>🎯 {commentary.bowlerName}</span>}
                {commentary.batsmanName && <span>🏏 {commentary.batsmanName}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Reactions */}
        <div className="flex flex-wrap gap-2 mb-3">
          {reactionCounts.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => handleReaction(reaction.type)}
              disabled={!currentUserId || isPending}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all ${
                reaction.hasReacted
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
              } ${!currentUserId ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span>{reaction.emoji}</span>
              {reaction.count > 0 && <span>{reaction.count}</span>}
            </button>
          ))}
        </div>

        {/* Comments Toggle */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <MessageSquare className="h-4 w-4" />
          <span>
            {(commentary.comments || []).length}{" "}
            {(commentary.comments || []).length === 1 ? "comment" : "comments"}
          </span>
          {showComments ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-3 pt-3 border-t space-y-3">
            {/* Add Comment Form */}
            {currentUserId && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1"
                  maxLength={500}
                />
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Comments List */}
            {(commentary.comments || []).map((comment) => (
              <CommentaryCommentCard
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                onUpdate={(updatedComment) => {
                  onUpdate({
                    ...commentary,
                    comments: (commentary.comments || []).map((c) =>
                      c.id === updatedComment.id ? updatedComment : c
                    ),
                  });
                }}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CommentaryCommentCardProps {
  comment: CommentaryComment;
  currentUserId?: string;
  onUpdate: (comment: CommentaryComment) => void;
}

function CommentaryCommentCard({ comment, currentUserId, onUpdate }: CommentaryCommentCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleReaction = (reactionType: ReactionType) => {
    if (!currentUserId) return;

    // Optimistically update the reaction
    const reactions = comment.reactions || [];
    const hasReacted = reactions.some(
      (r) => r.reactionType === reactionType && r.userId === currentUserId
    );

    const updatedReactions = hasReacted
      ? reactions.filter(
          (r) => !(r.reactionType === reactionType && r.userId === currentUserId)
        )
      : [
          ...reactions,
          {
            id: "temp", // temporary id
            userId: currentUserId,
            reactionType,
          },
        ];

    onUpdate({
      ...comment,
      reactions: updatedReactions as CommentaryCommentReaction[],
      _count: {
        reactions: updatedReactions.length,
      },
    });

    const formData = new FormData();
    formData.append("targetId", comment.id);
    formData.append("reactionType", reactionType);

    startTransition(async () => {
      const result = await toggleCommentReaction(formData);
      if (!result.success) {
        // Rollback on error
        onUpdate(comment);
      }
    });
  };

  // Group reactions by type
  const reactionCounts = REACTION_TYPES.map((rt) => ({
    ...rt,
    count: (comment.reactions || []).filter((r) => r.reactionType === rt.type).length,
    hasReacted: (comment.reactions || []).some(
      (r) => r.reactionType === rt.type && r.userId === currentUserId
    ),
  }));

  return (
    <div className="flex gap-2">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">
          {comment.user?.name?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.user?.name}</span>
            <span className="text-xs text-gray-400">
              @{comment.user?.username}
            </span>
            <RelativeTime
              date={comment.createdAt}
              className="text-xs text-gray-400"
            />
          </div>
          <p className="text-sm text-gray-700">{comment.content}</p>
        </div>

        {/* Comment Reactions */}
        <div className="flex flex-wrap gap-1 mt-1">
          {reactionCounts.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => handleReaction(reaction.type)}
              disabled={!currentUserId || isPending}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all ${
                reaction.hasReacted
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } ${!currentUserId ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span>{reaction.emoji}</span>
              {reaction.count > 0 && <span>{reaction.count}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
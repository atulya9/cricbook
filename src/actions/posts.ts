"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { createPostSchema, createCommentSchema } from "@/lib/validations";
import { extractHashtags } from "@/lib/utils";
import type { CreatePostInput, CreateCommentInput } from "@/lib/validations";

export async function createPost(data: CreatePostInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedData = createPostSchema.parse(data);

    // Extract hashtags from content
    const hashtagNames = extractHashtags(validatedData.content);

    // Create or find hashtags
    const hashtags = await Promise.all(
      hashtagNames.map(async (name) => {
        return db.hashtag.upsert({
          where: { name },
          update: {},
          create: { name },
        });
      })
    );

    // Create post
    const post = await db.post.create({
      data: {
        content: validatedData.content,
        images: validatedData.images ? JSON.stringify(validatedData.images) : null,
        matchId: validatedData.matchId,
        authorId: session.user.id,
        hashtags: {
          create: hashtags.map((hashtag) => ({
            hashtagId: hashtag.id,
          })),
        },
      },
      include: {
        author: true,
        hashtags: {
          include: {
            hashtag: true,
          },
        },
      },
    });

    // Create poll if provided
    if (validatedData.poll) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + validatedData.poll.expiresIn);

      await db.poll.create({
        data: {
          postId: post.id,
          expiresAt,
          options: {
            create: validatedData.poll.options.map((text) => ({ text })),
          },
        },
      });
    }

    revalidatePath("/feed");
    return { success: true, data: post };
  } catch (error) {
    console.error("Create post error:", error);
    return { success: false, error: "Failed to create post" };
  }
}

export async function deletePost(postId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    if (post.authorId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    await db.post.delete({
      where: { id: postId },
    });

    revalidatePath("/feed");
    return { success: true };
  } catch (error) {
    console.error("Delete post error:", error);
    return { success: false, error: "Failed to delete post" };
  }
}

export async function likePost(postId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const existingLike = await db.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await db.like.delete({
        where: { id: existingLike.id },
      });
      return { success: true, liked: false };
    }

    // Like
    await db.like.create({
      data: {
        userId: session.user.id,
        postId,
      },
    });

    // Create notification
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (post && post.authorId !== session.user.id) {
      await db.notification.create({
        data: {
          type: "like",
          recipientId: post.authorId,
          senderId: session.user.id,
          postId,
        },
      });
    }

    return { success: true, liked: true };
  } catch (error) {
    console.error("Like post error:", error);
    return { success: false, error: "Failed to like post" };
  }
}

export async function bookmarkPost(postId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const existingBookmark = await db.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (existingBookmark) {
      // Remove bookmark
      await db.bookmark.delete({
        where: { id: existingBookmark.id },
      });
      return { success: true, bookmarked: false };
    }

    // Add bookmark
    await db.bookmark.create({
      data: {
        userId: session.user.id,
        postId,
      },
    });

    return { success: true, bookmarked: true };
  } catch (error) {
    console.error("Bookmark post error:", error);
    return { success: false, error: "Failed to bookmark post" };
  }
}

export async function repost(postId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const originalPost = await db.post.findUnique({
      where: { id: postId },
    });

    if (!originalPost) {
      return { success: false, error: "Post not found" };
    }

    // Check if user has already reposted this post
    const existingRepost = await db.post.findFirst({
      where: {
        authorId: session.user.id,
        originalPostId: postId,
        isRepost: true,
      },
    });

    if (existingRepost) {
      // Unrepost: delete the existing repost
      await db.post.delete({
        where: { id: existingRepost.id },
      });

      revalidatePath("/feed");
      return { success: true, reposted: false };
    } else {
      // Create new repost
      const repost = await db.post.create({
        data: {
          content: originalPost.content,
          authorId: session.user.id,
          isRepost: true,
          originalPostId: postId,
        },
      });

      // Create notification
      if (originalPost.authorId !== session.user.id) {
        await db.notification.create({
          data: {
            type: "repost",
            recipientId: originalPost.authorId,
            senderId: session.user.id,
            postId: originalPost.id,
          },
        });
      }

      revalidatePath("/feed");
      return { success: true, reposted: true, data: repost };
    }
  } catch (error) {
    console.error("Repost error:", error);
    return { success: false, error: "Failed to repost" };
  }
}

export async function createComment(postId: string, data: CreateCommentInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedData = createCommentSchema.parse(data);

    const comment = await db.comment.create({
      data: {
        content: validatedData.content,
        postId,
        parentId: validatedData.parentId,
        authorId: session.user.id,
      },
      include: {
        author: true,
      },
    });

    // Create notification
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (post && post.authorId !== session.user.id) {
      await db.notification.create({
        data: {
          type: "comment",
          recipientId: post.authorId,
          senderId: session.user.id,
          postId,
        },
      });
    }

    revalidatePath(`/post/${postId}`);
    return { success: true, data: comment };
  } catch (error) {
    console.error("Create comment error:", error);
    return { success: false, error: "Failed to create comment" };
  }
}

export async function votePoll(optionId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if poll option exists and get poll info
    const option = await db.pollOption.findUnique({
      where: { id: optionId },
      include: {
        poll: true,
      },
    });

    if (!option) {
      return { success: false, error: "Poll option not found" };
    }

    // Check if poll has expired
    if (new Date() > option.poll.expiresAt) {
      return { success: false, error: "Poll has expired" };
    }

    // Check if user has already voted on this poll
    const existingVote = await db.pollVote.findFirst({
      where: {
        userId: session.user.id,
        option: {
          pollId: option.pollId,
        },
      },
    });

    if (existingVote) {
      return { success: false, error: "You have already voted on this poll" };
    }

    await db.pollVote.create({
      data: {
        userId: session.user.id,
        optionId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Vote poll error:", error);
    return { success: false, error: "Failed to vote" };
  }
}
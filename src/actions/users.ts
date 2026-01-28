"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validations";
import type { UpdateProfileInput } from "@/lib/validations";

export async function updateProfile(data: UpdateProfileInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedData = updateProfileSchema.parse(data);

    const user = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        bio: validatedData.bio,
        location: validatedData.location,
        website: validatedData.website || null,
        favoriteTeam: validatedData.favoriteTeam,
        favoritePlayer: validatedData.favoritePlayer,
      },
    });

    revalidatePath(`/profile/${user.username}`);
    return { success: true, data: user };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function followUser(userId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.id === userId) {
      return { success: false, error: "Cannot follow yourself" };
    }

    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await db.follow.delete({
        where: { id: existingFollow.id },
      });
      return { success: true, following: false };
    }

    // Follow
    await db.follow.create({
      data: {
        followerId: session.user.id,
        followingId: userId,
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        type: "follow",
        recipientId: userId,
        senderId: session.user.id,
      },
    });

    return { success: true, following: true };
  } catch (error) {
    console.error("Follow user error:", error);
    return { success: false, error: "Failed to follow user" };
  }
}

export async function getUserProfile(username: string) {
  try {
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
      return { success: false, error: "User not found" };
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

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      data: {
        ...userWithoutPassword,
        isFollowing,
      },
    };
  } catch (error) {
    console.error("Get user profile error:", error);
    return { success: false, error: "Failed to get user profile" };
  }
}

export async function getFollowers(userId: string, page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      db.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              bio: true,
              isVerified: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.follow.count({ where: { followingId: userId } }),
    ]);

    return {
      success: true,
      data: followers.map((f) => f.follower),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + followers.length < total,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error("Get followers error:", error);
    return { success: false, error: "Failed to get followers" };
  }
}

export async function getFollowing(userId: string, page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit;

    const [following, total] = await Promise.all([
      db.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              bio: true,
              isVerified: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.follow.count({ where: { followerId: userId } }),
    ]);

    return {
      success: true,
      data: following.map((f) => f.following),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + following.length < total,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error("Get following error:", error);
    return { success: false, error: "Failed to get following" };
  }
}

export async function markNotificationsAsRead(notificationIds?: string[]) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (notificationIds && notificationIds.length > 0) {
      await db.notification.updateMany({
        where: {
          id: { in: notificationIds },
          recipientId: session.user.id,
        },
        data: { isRead: true },
      });
    } else {
      // Mark all as read
      await db.notification.updateMany({
        where: { recipientId: session.user.id },
        data: { isRead: true },
      });
    }

    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("Mark notifications as read error:", error);
    return { success: false, error: "Failed to update notifications" };
  }
}
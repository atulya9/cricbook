import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Heart, MessageCircle, UserPlus, Repeat2, AtSign } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { RelativeTime } from "@/components/ui/relative-time";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Your notifications",
};

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const notifications = await db.notification.findMany({
    where: { recipientId: session.user.id },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const notificationIcons: Record<string, typeof Heart> = {
    like: Heart,
    comment: MessageCircle,
    follow: UserPlus,
    repost: Repeat2,
    mention: AtSign,
  };

  const notificationMessages: Record<string, string> = {
    like: "liked your post",
    comment: "commented on your post",
    follow: "started following you",
    repost: "reposted your post",
    mention: "mentioned you",
  };

  return (
    <div>
      {/* Header */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        </div>
      </div>

      {/* Notifications list */}
      <div>
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = notificationIcons[notification.type] || Heart;
            const message = notificationMessages[notification.type] || "interacted with you";

            return (
              <div
                key={notification.id}
                className={`flex gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition ${
                  !notification.isRead ? "bg-green-50/50" : ""
                }`}
              >
                <div className="relative">
                  <Avatar
                    src={notification.sender?.avatar}
                    alt={notification.sender?.name || "User"}
                    fallback={notification.sender?.username || "U"}
                    size="md"
                  />
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1">
                    <Icon className={`h-4 w-4 ${
                      notification.type === "like" ? "text-red-500" :
                      notification.type === "follow" ? "text-blue-500" :
                      "text-green-600"
                    }`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{notification.sender?.name}</span>{" "}
                    <span className="text-gray-600">{message}</span>
                  </p>
                  {notification.message && (
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {notification.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    <RelativeTime date={notification.createdAt} />
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
import { Metadata } from "next";
import { ComposePost } from "@/components/feed/compose-post";
import { FeedList } from "@/components/feed/feed-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Feed",
  description: "Your cricket feed - Latest posts from people you follow",
};

export default function FeedPage() {
  return (
    <div>
      {/* Header */}
      <div className="sticky top-16 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Home</h1>
        </div>
        <Tabs defaultValue="for-you">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4">
            <TabsTrigger value="for-you" className="flex-1">
              For you
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1">
              Following
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Compose */}
      <ComposePost />

      {/* Feed */}
      <FeedList />
    </div>
  );
}
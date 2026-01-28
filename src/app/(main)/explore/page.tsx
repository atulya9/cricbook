import { Metadata } from "next";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Explore",
  description: "Discover trending cricket topics and conversations",
};

export default function ExplorePage() {
  return (
    <div>
      {/* Search header */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Cricbook"
              className="w-full rounded-full border border-gray-300 bg-gray-50 py-3 pl-12 pr-4 text-sm focus:border-green-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-green-600"
            />
          </div>
        </div>
        <Tabs defaultValue="trending">
          <TabsList className="w-full justify-start rounded-none bg-transparent px-4">
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="cricket">Cricket</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Trending in Cricket</h2>
          
          <TrendingTopic
            category="Cricket · Trending"
            topic="#INDvAUS"
            posts="15.2K posts"
          />
          <TrendingTopic
            category="IPL · Trending"
            topic="Mumbai Indians"
            posts="8.7K posts"
          />
          <TrendingTopic
            category="Cricket · Trending"
            topic="Virat Kohli"
            posts="12.1K posts"
          />
          <TrendingTopic
            category="World Cup · Trending"
            topic="#CWC2024"
            posts="6.3K posts"
          />
          <TrendingTopic
            category="Cricket · Trending"
            topic="Test Cricket"
            posts="4.8K posts"
          />
        </div>
      </div>
    </div>
  );
}

function TrendingTopic({
  category,
  topic,
  posts,
}: {
  category: string;
  topic: string;
  posts: string;
}) {
  return (
    <div className="py-3 hover:bg-gray-50 cursor-pointer -mx-4 px-4 transition">
      <p className="text-xs text-gray-500">{category}</p>
      <p className="font-bold text-gray-900">{topic}</p>
      <p className="text-xs text-gray-500">{posts}</p>
    </div>
  );
}
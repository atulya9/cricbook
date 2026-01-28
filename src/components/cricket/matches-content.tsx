"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X, Calendar, MapPin, Trophy, Tv } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Match } from "@/types";

type TabType = "live" | "upcoming" | "past";

interface MatchesContentProps {
  searchParamsPromise: Promise<{ [key: string]: string | string[] | undefined }>;
}

export function MatchesContent({ searchParamsPromise }: MatchesContentProps) {
  const searchParams = use(searchParamsPromise);
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<TabType>(
    (searchParams.tab as TabType) || "live"
  );
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedTeam, setSelectedTeam] = useState<string>(
    (searchParams.team as string) || ""
  );
  const [selectedFormat, setSelectedFormat] = useState<string>(
    (searchParams.format as string) || ""
  );
  const [selectedLocation, setSelectedLocation] = useState<string>(
    (searchParams.location as string) || ""
  );
  const [selectedSeries, setSelectedSeries] = useState<string>(
    (searchParams.series as string) || ""
  );
  const [selectedMatchType, setSelectedMatchType] = useState<string>(
    (searchParams.matchType as string) || ""
  );

  // Available filter options (would come from API in production)
  const teams = ["India", "Australia", "England", "New Zealand", "South Africa", "Pakistan", "Sri Lanka", "West Indies", "Bangladesh", "Afghanistan"];
  const formats = ["international", "domestic", "league"];
  const matchTypes = ["test", "odi", "t20", "t10"];
  const locations = ["India", "Australia", "England", "UAE", "South Africa", "New Zealand"];

  useEffect(() => {
    fetchMatches();
  }, [activeTab, selectedTeam, selectedFormat, selectedLocation, selectedSeries, selectedMatchType]);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Map tab to status
      const statusMap: Record<TabType, string> = {
        live: "live",
        upcoming: "upcoming",
        past: "completed",
      };
      params.set("status", statusMap[activeTab]);

      if (selectedFormat) params.set("format", selectedFormat);
      if (selectedMatchType) params.set("matchType", selectedMatchType);

      const response = await fetch(`/api/matches?${params}`);
      const data = await response.json();

      if (data.success) {
        let filteredMatches = data.data;

        // Client-side filtering for team and location
        if (selectedTeam) {
          filteredMatches = filteredMatches.filter(
            (match: Match) =>
              match.homeTeam.name === selectedTeam ||
              match.awayTeam.name === selectedTeam
          );
        }

        if (selectedLocation) {
          filteredMatches = filteredMatches.filter(
            (match: Match) => match.country === selectedLocation
          );
        }

        setMatches(filteredMatches);
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    updateUrl({ tab });
  };

  const updateUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/matches?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setSelectedTeam("");
    setSelectedFormat("");
    setSelectedLocation("");
    setSelectedSeries("");
    setSelectedMatchType("");
    router.push(`/matches?tab=${activeTab}`, { scroll: false });
  };

  const hasActiveFilters = !!(selectedTeam || selectedFormat || selectedLocation || selectedSeries || selectedMatchType);

  return (
    <div>
      {/* Header */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Matches</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? "border-green-600 text-green-600" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 bg-green-600 text-white rounded-full px-2 py-0.5 text-xs">
                {[selectedTeam, selectedFormat, selectedLocation, selectedSeries, selectedMatchType].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <TabButton
            active={activeTab === "live"}
            onClick={() => handleTabChange("live")}
            hasIndicator
          >
            Live
          </TabButton>
          <TabButton
            active={activeTab === "upcoming"}
            onClick={() => handleTabChange("upcoming")}
          >
            Upcoming
          </TabButton>
          <TabButton
            active={activeTab === "past"}
            onClick={() => handleTabChange("past")}
          >
            Past
          </TabButton>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Filter Matches</span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:underline flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Team Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  <Trophy className="h-3 w-3 inline mr-1" />
                  Team
                </label>
                <select
                  value={selectedTeam}
                  onChange={(e) => {
                    setSelectedTeam(e.target.value);
                    updateUrl({ team: e.target.value });
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                >
                  <option value="">All Teams</option>
                  {teams.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>

              {/* Format Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  <Tv className="h-3 w-3 inline mr-1" />
                  Format
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => {
                    setSelectedFormat(e.target.value);
                    updateUrl({ format: e.target.value });
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                >
                  <option value="">All Formats</option>
                  {formats.map((format) => (
                    <option key={format} value={format}>
                      {format.charAt(0).toUpperCase() + format.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Match Type Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  Match Type
                </label>
                <select
                  value={selectedMatchType}
                  onChange={(e) => {
                    setSelectedMatchType(e.target.value);
                    updateUrl({ matchType: e.target.value });
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                >
                  <option value="">All Types</option>
                  {matchTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    updateUrl({ location: e.target.value });
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Series Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Series
                </label>
                <input
                  type="text"
                  value={selectedSeries}
                  onChange={(e) => {
                    setSelectedSeries(e.target.value);
                    updateUrl({ series: e.target.value });
                  }}
                  placeholder="Search series..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Match List */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
          </div>
        ) : matches.length === 0 ? (
          <EmptyState tab={activeTab} hasFilters={hasActiveFilters} />
        ) : (
          matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))
        )}
      </div>
    </div>
  );
}

function TabButton({
  children,
  active,
  onClick,
  hasIndicator,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  hasIndicator?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-medium transition relative ${
        active
          ? "text-green-600 border-b-2 border-green-600"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      <span className="flex items-center justify-center gap-2">
        {children}
        {hasIndicator && active && (
          <span className="flex h-2 w-2">
            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
          </span>
        )}
      </span>
    </button>
  );
}

function MatchCard({ match }: { match: Match }) {
  const statusColors = {
    live: "bg-red-500",
    upcoming: "bg-blue-500",
    completed: "bg-gray-500",
    abandoned: "bg-yellow-500",
  };

  return (
    <Link href={`/matches/${match.id}`}>
      <Card className="hover:shadow-md transition cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{match.matchType.toUpperCase()}</Badge>
              <Badge variant="secondary">{match.format}</Badge>
              {match.status === "live" && (
                <Badge className="bg-red-500 animate-pulse">LIVE</Badge>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {formatDate(match.startDate, "MMM d, yyyy")}
            </span>
          </div>

          {match.series && (
            <p className="text-sm text-gray-600 mb-3">{match.series.name}</p>
          )}

          <div className="space-y-3">
            {/* Home Team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                  {match.homeTeam.shortName.charAt(0)}
                </div>
                <div>
                  <p className={`font-semibold ${match.winnerId === match.homeTeam.id ? "text-green-600" : ""}`}>
                    {match.homeTeam.name}
                  </p>
                  <p className="text-xs text-gray-500">{match.homeTeam.shortName}</p>
                </div>
              </div>
              {match.homeScore && (
                <p className="text-lg font-bold text-gray-900">{match.homeScore}</p>
              )}
            </div>

            {/* Away Team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                  {match.awayTeam.shortName.charAt(0)}
                </div>
                <div>
                  <p className={`font-semibold ${match.winnerId === match.awayTeam.id ? "text-green-600" : ""}`}>
                    {match.awayTeam.name}
                  </p>
                  <p className="text-xs text-gray-500">{match.awayTeam.shortName}</p>
                </div>
              </div>
              {match.awayScore && (
                <p className="text-lg font-bold text-gray-900">{match.awayScore}</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{match.venue}</span>
              {match.city && <span>• {match.city}</span>}
            </div>
            {match.result && (
              <p className="text-sm font-medium text-green-600">{match.result}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyState({ tab, hasFilters }: { tab: TabType; hasFilters: boolean }) {
  const messages = {
    live: "No live matches at the moment",
    upcoming: "No upcoming matches scheduled",
    past: "No past matches found",
  };

  return (
    <div className="text-center py-12">
      <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {messages[tab]}
      </h3>
      <p className="text-gray-500">
        {hasFilters
          ? "Try adjusting your filters to see more matches."
          : "Check back later for updates."}
      </p>
    </div>
  );
}
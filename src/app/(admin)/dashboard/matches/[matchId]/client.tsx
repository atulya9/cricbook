"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Trophy,
  UserCog,
  LogOut,
  Settings,
  ArrowLeft,
  Save,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateMatch, addCommentary, getMatchCommentary, getMatchSummary, updateMatchSummary } from "@/actions/match";
import type { Match, Commentary } from "@/types";

// Score calculation is now done server-side with proper toss logic

export default function MatchEditClient({ matchId, initialMatch, initialCommentaries }: {
  matchId: string;
  initialMatch: any;
  initialCommentaries: any[];
}) {
  const { data: session } = useSession();
  const [match, setMatch] = useState<Match | null>(initialMatch);
  const [saving, setSaving] = useState(false);

  // Form states
  const [status, setStatus] = useState<"upcoming" | "live" | "completed" | "abandoned">(
    initialMatch?.status || "upcoming"
  );
  const [venue, setVenue] = useState(initialMatch?.venue || "");
  const [city, setCity] = useState(initialMatch?.city || "");
  const [country, setCountry] = useState(initialMatch?.country || "");
  const [weather, setWeather] = useState(initialMatch?.weather || "");
  const [pitch, setPitch] = useState(initialMatch?.pitch || "");
  const [tossWinnerId, setTossWinnerId] = useState(initialMatch?.tossWinnerId || "");
  const [tossDecision, setTossDecision] = useState<"bat" | "bowl" | "">(initialMatch?.tossDecision || "");
  const [homeScore, setHomeScore] = useState(initialMatch?.homeScore || "");
  const [awayScore, setAwayScore] = useState(initialMatch?.awayScore || "");
  const [result, setResult] = useState(initialMatch?.result || "");
  const [currentInnings, setCurrentInnings] = useState(initialMatch?.currentInnings?.toString() || "");

  // Load summary on mount
  useEffect(() => {
    const loadSummary = async () => {
      try {
        const summaryData = await getMatchSummary(matchId);
        if (summaryData) {
          setSummaryTitle(summaryData.title);
          setSummaryContent(summaryData.content);
        }
      } catch (error) {
        console.error("Failed to load summary:", error);
      }
    };
    loadSummary();
  }, [matchId]);

  // Summary states
  const [summaryTitle, setSummaryTitle] = useState("");
  const [summaryContent, setSummaryContent] = useState("");
  const [savingSummary, setSavingSummary] = useState(false);

  // Commentary states
  const [commentaries, setCommentaries] = useState<Commentary[]>(initialCommentaries);
  const [showAddCommentary, setShowAddCommentary] = useState(false);
  const [editingCommentary, setEditingCommentary] = useState<Commentary | null>(null);
  // Calculate next available over and ball
  const getNextAvailableOverAndBall = () => {
    if (commentaries.length === 0) {
      return { overNumber: 0, ballNumber: 1 };
    }

    // Find the current innings commentaries, sorted by over and ball
    const inningsCommentaries = commentaries
      .filter(c => c.inningsNumber === 1)
      .sort((a, b) => {
        if (a.overNumber !== b.overNumber) return a.overNumber - b.overNumber;
        return a.ballNumber - b.ballNumber;
      });

    if (inningsCommentaries.length === 0) {
      return { overNumber: 0, ballNumber: 1 };
    }

    // Find the last delivery (most recent by over/ball)
    const lastDelivery = inningsCommentaries[inningsCommentaries.length - 1];

    // Count valid balls in the current over (non-extras)
    const ballsInCurrentOver = inningsCommentaries.filter(c => c.overNumber === lastDelivery.overNumber);
    const validBallsCount = ballsInCurrentOver.filter(c => !c.isExtra).length;

    // If the over has 6 valid balls, move to next over
    if (validBallsCount >= 6) {
      return { overNumber: lastDelivery.overNumber + 1, ballNumber: 1 };
    }

    // If the last delivery was an extra, repeat the same ball number
    if (lastDelivery.isExtra) {
      return { overNumber: lastDelivery.overNumber, ballNumber: lastDelivery.ballNumber };
    }

    // Otherwise, advance to the next ball number
    return { overNumber: lastDelivery.overNumber, ballNumber: lastDelivery.ballNumber + 1 };
  };

  const [commentaryForm, setCommentaryForm] = useState({
    overNumber: 0,
    ballNumber: 1,
    runs: 0,
    isWicket: false,
    wicketType: "",
    isExtra: false,
    extraType: "",
    isBoundary: false,
    isSix: false,
    description: "",
    batsmanName: "",
    bowlerName: "",
  });

  const handleSaveMatch = async () => {
    if (!match) return;

    setSaving(true);
    try {
      await updateMatch(match.id, {
        status,
        venue: venue || undefined,
        city: city || null,
        country: country || null,
        weather: weather || null,
        pitch: pitch || null,
        tossWinnerId: tossWinnerId || null,
        tossDecision: tossDecision || null,
        currentInnings: currentInnings ? parseInt(currentInnings) : null,
      });

      alert("Match updated successfully!");
    } catch (error) {
      console.error("Failed to update match:", error);
      alert("Failed to update match");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSummary = async () => {
    if (!summaryTitle.trim() || !summaryContent.trim()) {
      alert("Please provide both title and content for the summary");
      return;
    }

    setSavingSummary(true);
    try {
      await updateMatchSummary({
        matchId,
        title: summaryTitle,
        content: summaryContent,
      });

      alert("Summary updated successfully!");
    } catch (error) {
      console.error("Failed to update summary:", error);
      alert("Failed to update summary");
    } finally {
      setSavingSummary(false);
    }
  };

  const handleEditCommentary = (commentary: Commentary) => {
    setEditingCommentary(commentary);
    setCommentaryForm({
      overNumber: commentary.overNumber,
      ballNumber: commentary.ballNumber,
      runs: commentary.runs,
      isWicket: commentary.isWicket,
      wicketType: commentary.wicketType || "",
      isExtra: commentary.isExtra,
      extraType: commentary.extraType || "",
      isBoundary: commentary.isBoundary,
      isSix: commentary.isSix,
      description: commentary.description,
      batsmanName: commentary.batsmanName || "",
      bowlerName: commentary.bowlerName || "",
    });
    setShowAddCommentary(true);
  };

  const handleDeleteCommentary = async (commentaryId: string) => {
    if (!confirm("Are you sure you want to delete this commentary?")) return;

    try {
      // For now, we'll need to add a delete API endpoint
      // Since we don't have one yet, let's implement it
      const response = await fetch(`/api/matches/${matchId}/commentary/${commentaryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh commentaries and scores
        const updatedCommentaries = await getMatchCommentary(matchId);
        setCommentaries(updatedCommentaries as Commentary[]);

        // Refresh match data to get updated scores
        const matchResponse = await fetch(`/api/matches/${matchId}`);
        if (matchResponse.ok) {
          const matchData = await matchResponse.json();
          setHomeScore(matchData.homeScore || "");
          setAwayScore(matchData.awayScore || "");
          setResult(matchData.result || "");
        }
      } else {
        alert("Failed to delete commentary");
      }
    } catch (error) {
      console.error("Failed to delete commentary:", error);
      alert("Failed to delete commentary");
    }
  };

  const handleUpdateCommentary = async () => {
    if (!editingCommentary || !commentaryForm.description) return;

    try {
      // We'll need to add an update API endpoint
      const response = await fetch(`/api/matches/${matchId}/commentary/${editingCommentary.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          overNumber: commentaryForm.overNumber,
          ballNumber: commentaryForm.ballNumber,
          runs: commentaryForm.runs,
          isWicket: commentaryForm.isWicket,
          wicketType: commentaryForm.isWicket ? commentaryForm.wicketType : undefined,
          isExtra: commentaryForm.isExtra,
          extraType: commentaryForm.isExtra ? commentaryForm.extraType : undefined,
          isBoundary: commentaryForm.isBoundary,
          isSix: commentaryForm.isSix,
          description: commentaryForm.description,
          batsmanName: commentaryForm.batsmanName || undefined,
          bowlerName: commentaryForm.bowlerName || undefined,
        }),
      });

      if (response.ok) {
        // Refresh commentaries and scores
        const updatedCommentaries = await getMatchCommentary(matchId);
        setCommentaries(updatedCommentaries as Commentary[]);

        // Refresh match data to get updated scores
        const matchResponse = await fetch(`/api/matches/${matchId}`);
        if (matchResponse.ok) {
          const matchData = await matchResponse.json();
          setHomeScore(matchData.homeScore || "");
          setAwayScore(matchData.awayScore || "");
          setResult(matchData.result || "");
        }

        setCommentaryForm({
          overNumber: 0,
          ballNumber: 1,
          runs: 0,
          isWicket: false,
          wicketType: "",
          isExtra: false,
          extraType: "",
          isBoundary: false,
          isSix: false,
          description: "",
          batsmanName: "",
          bowlerName: "",
        });
        setShowAddCommentary(false);
        setEditingCommentary(null);
      } else {
        alert("Failed to update commentary");
      }
    } catch (error) {
      console.error("Failed to update commentary:", error);
      alert("Failed to update commentary");
    }
  };

  const handleAddCommentary = async () => {
    if (!match || !commentaryForm.description) return;

    try {
      const result = await addCommentary({
        matchId: match.id,
        inningsNumber: 1, // Default to first innings for now
        overNumber: commentaryForm.overNumber,
        ballNumber: commentaryForm.ballNumber,
        runs: commentaryForm.runs,
        isWicket: commentaryForm.isWicket,
        wicketType: commentaryForm.isWicket ? commentaryForm.wicketType : undefined,
        isExtra: commentaryForm.isExtra,
        extraType: commentaryForm.isExtra ? commentaryForm.extraType : undefined,
        isBoundary: commentaryForm.isBoundary,
        isSix: commentaryForm.isSix,
        description: commentaryForm.description,
        batsmanName: commentaryForm.batsmanName || undefined,
        bowlerName: commentaryForm.bowlerName || undefined,
      });

      if (result.success && result.data) {
        // Get updated commentaries and refresh match data
        const updatedCommentaries = await getMatchCommentary(matchId);
        setCommentaries(updatedCommentaries as Commentary[]);

        // Refresh match data to get updated scores
        const matchResponse = await fetch(`/api/matches/${matchId}`);
        if (matchResponse.ok) {
          const matchData = await matchResponse.json();
          setHomeScore(matchData.homeScore || "");
          setAwayScore(matchData.awayScore || "");
          setResult(matchData.result || "");
        }

        // Calculate next available over and ball after successful addition
        const nextPosition = getNextAvailableOverAndBall();
        setCommentaryForm({
          overNumber: nextPosition.overNumber,
          ballNumber: nextPosition.ballNumber,
          runs: 0,
          isWicket: false,
          wicketType: "",
          isExtra: false,
          extraType: "",
          isBoundary: false,
          isSix: false,
          description: "",
          batsmanName: "",
          bowlerName: "",
        });
        setShowAddCommentary(false);
      }
    } catch (error) {
      console.error("Failed to add commentary:", error);
      alert("Failed to add commentary");
    }
  };

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Match not found</h1>
          <Link href="/dashboard/matches">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Matches
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "Matches", href: "/dashboard/matches", active: true },
    { icon: Trophy, label: "Teams", href: "/dashboard/teams" },
    { icon: Users, label: "Players", href: "/dashboard/players" },
    { icon: UserCog, label: "Users", href: "/dashboard/users" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-gray-900 text-white shadow-lg">
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500">
              <span className="text-xl">🏏</span>
            </div>
            <div>
              <span className="text-lg font-bold">Cricbook</span>
              <span className="ml-2 text-xs bg-amber-500 px-2 py-0.5 rounded">ADMIN</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">
              Welcome, {session?.user?.name || session?.user?.username}
            </span>
            <Link
              href="/api/auth/signout"
              className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm hover:bg-gray-700 transition"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 bg-gray-900 text-white">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                  item.active
                    ? "bg-amber-500 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <Link href="/dashboard/matches">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Matches
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Match: {match.homeTeam.shortName} vs {match.awayTeam.shortName}
            </h1>
            <p className="text-gray-600">{match.matchType.toUpperCase()} • {match.format}</p>
          </div>

          <Tabs defaultValue="details" className="space-y-6">
            <TabsList>
              <TabsTrigger value="details">Match Details</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="commentary">Commentary</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Match Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Match Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Match Status
                    </label>
                    <Select value={status} onChange={(e) => setStatus(e.target.value as "upcoming" | "live" | "completed" | "abandoned")}>
                      <option value="upcoming">Upcoming</option>
                      <option value="live">Live</option>
                      <option value="completed">Completed</option>
                      <option value="abandoned">Abandoned</option>
                    </Select>
                  </div>

                  {/* Venue Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Venue Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Venue
                        </label>
                        <Input
                          value={venue}
                          onChange={(e) => setVenue(e.target.value)}
                          placeholder="e.g., Lord's Cricket Ground"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <Input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g., London"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <Input
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="e.g., England"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Weather & Pitch */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Weather & Pitch</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Weather
                        </label>
                        <Input
                          value={weather}
                          onChange={(e) => setWeather(e.target.value)}
                          placeholder="e.g., Sunny, 28°C"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pitch Report
                        </label>
                        <Input
                          value={pitch}
                          onChange={(e) => setPitch(e.target.value)}
                          placeholder="e.g., Dry pitch, expected to favor spinners"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Toss Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Toss Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Toss Winner
                        </label>
                        <Select value={tossWinnerId} onChange={(e) => setTossWinnerId(e.target.value)}>
                          <option value="">Select team</option>
                          <option value={match.homeTeam.id}>{match.homeTeam.name}</option>
                          <option value={match.awayTeam.id}>{match.awayTeam.name}</option>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Toss Decision
                        </label>
                        <Select value={tossDecision} onChange={(e) => setTossDecision(e.target.value as "bat" | "bowl" | "")}>
                          <option value="">Select decision</option>
                          <option value="bat">Bat</option>
                          <option value="bowl">Bowl</option>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Live Match Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Live Match Information</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Innings
                        </label>
                        <Input
                          type="number"
                          value={currentInnings}
                          onChange={(e) => setCurrentInnings(e.target.value)}
                          placeholder="1 or 2"
                        />
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Current over is automatically calculated from ball-by-ball commentary.
                      </p>
                    </div>
                  </div>

                  {/* Scores & Results (Calculated from Commentary) */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Scores & Results</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">
                        Scores and results are automatically calculated from ball-by-ball commentary.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">{match.homeTeam.name} Score:</span>
                          <span className="ml-2">{homeScore || "Not available"}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">{match.awayTeam.name} Score:</span>
                          <span className="ml-2">{awayScore || "Not available"}</span>
                        </div>
                      </div>
                      {result && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium text-gray-700">Result:</span>
                          <span className="ml-2">{result}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button onClick={handleSaveMatch} disabled={saving} className="bg-amber-500 hover:bg-amber-600">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Match Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Summary Title
                    </label>
                    <Input
                      value={summaryTitle}
                      onChange={(e) => setSummaryTitle(e.target.value)}
                      placeholder="e.g., India dominate in thrilling Test victory"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Summary Content
                    </label>
                    <Textarea
                      value={summaryContent}
                      onChange={(e) => setSummaryContent(e.target.value)}
                      placeholder="Write a compelling match summary..."
                      rows={10}
                    />
                  </div>
                  <Button onClick={handleSaveSummary} disabled={savingSummary} className="bg-amber-500 hover:bg-amber-600">
                    <Save className="h-4 w-4 mr-2" />
                    {savingSummary ? "Saving..." : "Save Summary"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="commentary" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Match Commentary</CardTitle>
                  <Button
                    onClick={() => {
                      if (!showAddCommentary) {
                        // When opening the form, set it to the next available position
                        const nextPosition = getNextAvailableOverAndBall();
                        setCommentaryForm(prev => ({
                          ...prev,
                          overNumber: nextPosition.overNumber,
                          ballNumber: nextPosition.ballNumber,
                        }));
                      }
                      setShowAddCommentary(!showAddCommentary);
                    }}
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ball Commentary
                  </Button>
                </CardHeader>
                <CardContent>
                  {showAddCommentary && (
                    <div className="border rounded-lg p-4 mb-6 space-y-4">
                      <h3 className="font-medium">
                        {editingCommentary ? "Edit Ball Commentary" : "Add New Ball Commentary"}
                      </h3>

                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Over</label>
                          <Input
                            type="number"
                            min={0}
                            value={commentaryForm.overNumber}
                            onChange={(e) => setCommentaryForm(prev => ({
                              ...prev,
                              overNumber: parseInt(e.target.value) || 0
                            }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Ball</label>
                          <Input
                            type="number"
                            min={1}
                            max={6}
                            value={commentaryForm.ballNumber}
                            onChange={(e) => setCommentaryForm(prev => ({
                              ...prev,
                              ballNumber: parseInt(e.target.value) || 1
                            }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Runs</label>
                          <Input
                            type="number"
                            min={0}
                            value={commentaryForm.runs}
                            onChange={(e) => setCommentaryForm(prev => ({
                              ...prev,
                              runs: parseInt(e.target.value) || 0
                            }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Batsman</label>
                          <Input
                            placeholder="Batsman name"
                            value={commentaryForm.batsmanName}
                            onChange={(e) => setCommentaryForm(prev => ({
                              ...prev,
                              batsmanName: e.target.value
                            }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Bowler</label>
                          <Input
                            placeholder="Bowler name"
                            value={commentaryForm.bowlerName}
                            onChange={(e) => setCommentaryForm(prev => ({
                              ...prev,
                              bowlerName: e.target.value
                            }))}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant={commentaryForm.isWicket ? "destructive" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setCommentaryForm(prev => ({
                            ...prev,
                            isWicket: !prev.isWicket
                          }))}
                        >
                          Wicket
                        </Badge>
                        <Badge
                          variant={commentaryForm.isBoundary ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setCommentaryForm(prev => ({
                            ...prev,
                            isBoundary: !prev.isBoundary,
                            runs: !prev.isBoundary ? 4 : prev.runs
                          }))}
                        >
                          Four
                        </Badge>
                        <Badge
                          variant={commentaryForm.isSix ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setCommentaryForm(prev => ({
                            ...prev,
                            isSix: !prev.isSix,
                            runs: !prev.isSix ? 6 : prev.runs,
                            isBoundary: !prev.isSix ? true : prev.isBoundary
                          }))}
                        >
                          Six
                        </Badge>
                        <Badge
                          variant={commentaryForm.isExtra ? "secondary" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setCommentaryForm(prev => ({
                            ...prev,
                            isExtra: !prev.isExtra
                          }))}
                        >
                          Extra
                        </Badge>
                      </div>

                      {commentaryForm.isWicket && (
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Wicket Type</label>
                          <Select
                            value={commentaryForm.wicketType}
                            onChange={(e) => setCommentaryForm(prev => ({
                              ...prev,
                              wicketType: e.target.value
                            }))}
                          >
                            <option value="">Select type</option>
                            <option value="bowled">Bowled</option>
                            <option value="caught">Caught</option>
                            <option value="lbw">LBW</option>
                            <option value="run out">Run Out</option>
                            <option value="stumped">Stumped</option>
                            <option value="hit wicket">Hit Wicket</option>
                          </Select>
                        </div>
                      )}

                      {commentaryForm.isExtra && (
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Extra Type</label>
                          <Select
                            value={commentaryForm.extraType}
                            onChange={(e) => setCommentaryForm(prev => ({
                              ...prev,
                              extraType: e.target.value
                            }))}
                          >
                            <option value="">Select type</option>
                            <option value="wide">Wide</option>
                            <option value="no-ball">No Ball</option>
                            <option value="bye">Bye</option>
                            <option value="leg-bye">Leg Bye</option>
                          </Select>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Description *</label>
                        <Textarea
                          placeholder="Describe the ball... e.g., 'Short ball, pulled away to deep midwicket for a single'"
                          value={commentaryForm.description}
                          onChange={(e) => setCommentaryForm(prev => ({
                            ...prev,
                            description: e.target.value
                          }))}
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={editingCommentary ? handleUpdateCommentary : handleAddCommentary}>
                          {editingCommentary ? "Update Commentary" : "Add Commentary"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowAddCommentary(false);
                            setEditingCommentary(null);
                            const nextPosition = getNextAvailableOverAndBall();
                            setCommentaryForm({
                              overNumber: nextPosition.overNumber,
                              ballNumber: nextPosition.ballNumber,
                              runs: 0,
                              isWicket: false,
                              wicketType: "",
                              isExtra: false,
                              extraType: "",
                              isBoundary: false,
                              isSix: false,
                              description: "",
                              batsmanName: "",
                              bowlerName: "",
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {commentaries.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No commentary yet</p>
                    ) : (
                      commentaries.map((commentary) => (
                        <div key={commentary.id} className="border rounded-lg p-4">
                          <div className="flex items-start gap-3">
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
                              {commentary.isWicket ? "W" :
                               commentary.isSix ? "6" :
                               commentary.isBoundary ? "4" :
                               commentary.runs.toString()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">
                                  {commentary.overNumber}.{commentary.ballNumber}
                                </span>
                                {commentary.isWicket && (
                                  <Badge variant="destructive" className="text-xs">WICKET</Badge>
                                )}
                                {commentary.isSix && (
                                  <Badge variant="default" className="bg-purple-500 text-xs">SIX</Badge>
                                )}
                                {commentary.isBoundary && !commentary.isSix && (
                                  <Badge variant="default" className="bg-blue-500 text-xs">FOUR</Badge>
                                )}
                              </div>
                              <p className="text-gray-700">{commentary.description}</p>
                              {(commentary.batsmanName || commentary.bowlerName) && (
                                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                  {commentary.bowlerName && <span>🎯 {commentary.bowlerName}</span>}
                                  {commentary.batsmanName && <span>🏏 {commentary.batsmanName}</span>}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditCommentary(commentary)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteCommentary(commentary.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
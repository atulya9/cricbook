"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Cloud, Thermometer, Wind, Droplets, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Team {
  id: string;
  name: string;
  shortName: string;
  country?: string | null;
  teamType: string;
  logo?: string | null;
}

interface Series {
  id: string;
  name: string;
}

interface Match {
  id: string;
  matchType: string;
  format: string;
  venue: string;
  city?: string | null;
  country?: string | null;
  startDate: Date;
  endDate?: Date | null;
  status: string;
  tossWinnerId?: string | null;
  tossDecision?: string | null;
  weather?: string | null;
  pitch?: string | null;
  homeTeam: Team;
  awayTeam: Team;
  series?: Series | null;
}

interface MatchInfoTabProps {
  match: Match;
}

export function MatchInfoTab({ match }: MatchInfoTabProps) {
  // Parse weather info (format: "Sunny, 28°C, Humidity: 65%, Wind: 12 km/h")
  const weatherInfo = match.weather ? parseWeather(match.weather) : null;

  return (
    <div className="p-4 space-y-4">
      {/* Venue & Location Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            Venue Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow label="Stadium" value={match.venue} />
          {match.city && (
            <InfoRow label="Location" value={`${match.city}${match.country ? `, ${match.country}` : ""}`} />
          )}
          <InfoRow
            label="Match Type"
            value={`${match.matchType.toUpperCase()} - ${match.format.charAt(0).toUpperCase() + match.format.slice(1)}`}
          />
          <InfoRow label="Date" value={formatDate(match.startDate, "EEEE, MMMM d, yyyy")} />
          <InfoRow label="Time" value={formatDate(match.startDate, "h:mm a")} />
          {match.endDate && (
            <InfoRow label="End Date" value={formatDate(match.endDate, "MMMM d, yyyy")} />
          )}
          {match.series && <InfoRow label="Series" value={match.series.name} />}
          {match.tossWinnerId && (
            <InfoRow
              label="Toss"
              value={`${match.tossWinnerId === match.homeTeam.id ? match.homeTeam.name : match.awayTeam.name} won the toss and chose to ${match.tossDecision}`}
            />
          )}
        </CardContent>
      </Card>

      {/* Weather Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-500" />
            Weather Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weatherInfo ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <WeatherItem
                icon={<Cloud className="h-8 w-8 text-blue-400" />}
                label="Condition"
                value={weatherInfo.condition}
              />
              <WeatherItem
                icon={<Thermometer className="h-8 w-8 text-orange-500" />}
                label="Temperature"
                value={weatherInfo.temperature}
              />
              <WeatherItem
                icon={<Droplets className="h-8 w-8 text-blue-500" />}
                label="Humidity"
                value={weatherInfo.humidity}
              />
              <WeatherItem
                icon={<Wind className="h-8 w-8 text-gray-500" />}
                label="Wind"
                value={weatherInfo.wind}
              />
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Weather information not available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Pitch Report */}
      {match.pitch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏟️ Pitch Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{match.pitch}</p>
          </CardContent>
        </Card>
      )}

      {/* Teams Card */}
      <div className="grid md:grid-cols-2 gap-4">
        <TeamCard team={match.homeTeam} label="Home Team" />
        <TeamCard team={match.awayTeam} label="Away Team" />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

function WeatherItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function TeamCard({ team, label }: { team: Team; label: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
            {team.shortName.charAt(0)}
          </div>
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p>{team.name}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{team.shortName}</Badge>
          {team.country && <Badge variant="outline">{team.country}</Badge>}
          <Badge variant="outline" className="capitalize">
            {team.teamType}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function parseWeather(weather: string) {
  // Try to parse weather string like "Sunny, 28°C, Humidity: 65%, Wind: 12 km/h"
  const parts = weather.split(",").map((p) => p.trim());
  
  let condition = "Clear";
  let temperature = "N/A";
  let humidity = "N/A";
  let wind = "N/A";

  parts.forEach((part) => {
    if (part.includes("°")) {
      temperature = part;
    } else if (part.toLowerCase().includes("humidity")) {
      humidity = part.replace(/humidity:?\s*/i, "");
    } else if (part.toLowerCase().includes("wind")) {
      wind = part.replace(/wind:?\s*/i, "");
    } else if (
      part.match(/sunny|cloudy|rainy|overcast|clear|partly/i)
    ) {
      condition = part;
    }
  });

  return { condition, temperature, humidity, wind };
}
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Player } from "@/types";

interface PlayerCardProps {
  player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const roleColors = {
    batsman: "bg-blue-100 text-blue-800",
    bowler: "bg-red-100 text-red-800",
    "all-rounder": "bg-purple-100 text-purple-800",
    "wicket-keeper": "bg-yellow-100 text-yellow-800",
  };

  return (
    <Link href={`/players/${player.id}`}>
      <Card className="hover:shadow-md transition overflow-hidden">
        <div className="relative h-40 bg-gradient-to-b from-green-600 to-green-800">
          {player.image ? (
            <Image
              src={player.image}
              alt={player.name}
              fill
              className="object-cover object-top"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-6xl font-bold text-white/20">
                {player.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900">{player.name}</h3>
          <p className="text-sm text-gray-500">{player.country}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge className={roleColors[player.role as keyof typeof roleColors]}>
              {player.role}
            </Badge>
            {player.team && (
              <Badge variant="outline">{player.team.shortName}</Badge>
            )}
          </div>
          {(player.battingStyle || player.bowlingStyle) && (
            <div className="mt-2 text-xs text-gray-500">
              {player.battingStyle && <p>🏏 {player.battingStyle}</p>}
              {player.bowlingStyle && <p>🎯 {player.bowlingStyle}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
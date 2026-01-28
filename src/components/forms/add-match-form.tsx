"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createMatchSchema, type CreateMatchInput } from "@/lib/validations";
import { createMatch } from "@/actions/match";

interface Team {
  id: string;
  name: string;
  shortName: string;
}

interface Series {
  id: string;
  name: string;
}

export function AddMatchForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [series, setSeries] = useState<Series[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateMatchInput>({
    resolver: zodResolver(createMatchSchema),
  });

  const homeTeamId = watch("homeTeamId");

  useEffect(() => {
    // Fetch teams and series
    const fetchData = async () => {
      try {
        const [teamsRes, seriesRes] = await Promise.all([
          fetch("/api/teams"),
          fetch("/api/series"),
        ]);

        if (teamsRes.ok) {
          const teamsData = await teamsRes.json();
          setTeams(teamsData.data || []);
        }

        if (seriesRes.ok) {
          const seriesData = await seriesRes.json();
          setSeries(seriesData.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: CreateMatchInput) => {
    setIsLoading(true);
    setError(null);

    console.log("Submitting match data:", data);

    try {
      const result = await createMatch(data);

      console.log("Match creation result:", result);

      if (!result.success) {
        setError(result.error || "Failed to create match");
        return;
      }

      router.push("/dashboard/matches");
      router.refresh();
    } catch (err) {
      console.error("Error in form submission:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const awayTeams = teams.filter(team => team.id !== homeTeamId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="matchType" className="text-sm font-medium text-gray-700">
            Match Type *
          </label>
          <Select
            id="matchType"
            error={errors.matchType?.message}
            {...register("matchType")}
          >
            <option value="">Select match type</option>
            <option value="test">Test</option>
            <option value="odi">ODI</option>
            <option value="t20">T20</option>
            <option value="t10">T10</option>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="format" className="text-sm font-medium text-gray-700">
            Format *
          </label>
          <Select
            id="format"
            error={errors.format?.message}
            {...register("format")}
          >
            <option value="">Select format</option>
            <option value="international">International</option>
            <option value="domestic">Domestic</option>
            <option value="league">League</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="homeTeamId" className="text-sm font-medium text-gray-700">
            Home Team *
          </label>
          <Select
            id="homeTeamId"
            error={errors.homeTeamId?.message}
            {...register("homeTeamId")}
          >
            <option value="">Select home team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.shortName})
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="awayTeamId" className="text-sm font-medium text-gray-700">
            Away Team *
          </label>
          <Select
            id="awayTeamId"
            error={errors.awayTeamId?.message}
            {...register("awayTeamId")}
          >
            <option value="">Select away team</option>
            {awayTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.shortName})
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="seriesId" className="text-sm font-medium text-gray-700">
          Series (Optional)
        </label>
        <Select
          id="seriesId"
          error={errors.seriesId?.message}
          {...register("seriesId", {
            setValueAs: (value) => value === "" ? undefined : value,
          })}
        >
          <option value="">Select series</option>
          {series.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="venue" className="text-sm font-medium text-gray-700">
          Venue *
        </label>
        <Input
          id="venue"
          type="text"
          placeholder="e.g., Lord's Cricket Ground"
          error={errors.venue?.message}
          {...register("venue")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium text-gray-700">
            City
          </label>
          <Input
            id="city"
            type="text"
            placeholder="e.g., London"
            error={errors.city?.message}
            {...register("city", {
              setValueAs: (value) => value === "" ? undefined : value,
            })}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="country" className="text-sm font-medium text-gray-700">
            Country
          </label>
          <Input
            id="country"
            type="text"
            placeholder="e.g., England"
            error={errors.country?.message}
            {...register("country", {
              setValueAs: (value) => value === "" ? undefined : value,
            })}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
            Start Date & Time *
          </label>
          <Input
            id="startDate"
            type="datetime-local"
            error={errors.startDate?.message}
            {...register("startDate")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
          End Date & Time (Optional)
        </label>
        <Input
          id="endDate"
          type="datetime-local"
          error={errors.endDate?.message}
          {...register("endDate", {
            setValueAs: (value) => value === "" ? undefined : value,
          })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="weather" className="text-sm font-medium text-gray-700">
            Weather (Optional)
          </label>
          <Input
            id="weather"
            type="text"
            placeholder="e.g., Sunny, 28°C"
            error={errors.weather?.message}
            {...register("weather", {
              setValueAs: (value) => value === "" ? undefined : value,
            })}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="pitch" className="text-sm font-medium text-gray-700">
            Pitch Report (Optional)
          </label>
          <Textarea
            id="pitch"
            placeholder="e.g., Dry pitch, expected to favor spinners"
            error={errors.pitch?.message}
            {...register("pitch", {
              setValueAs: (value) => value === "" ? undefined : value,
            })}
            rows={2}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Create Match
      </Button>
    </form>
  );
}
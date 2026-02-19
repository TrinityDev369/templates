"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Play,
  Pause,
  Clock,
  Mic,
  Rss,
  Search,
  X,
  Volume2,
  SkipBack,
  SkipForward,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  date: string;
  season: number;
  episode: number;
}

type FilterTab = "all" | "season-1" | "season-2";

/* -------------------------------------------------------------------------- */
/*  Mock Data                                                                 */
/* -------------------------------------------------------------------------- */

const SHOW_TITLE = "The Dev Dispatch";
const SHOW_HOST = "Sarah Chen";
const SHOW_DESCRIPTION =
  "Weekly deep dives into the tools, techniques, and trends shaping modern software development. From architecture decisions to career growth, we cover what matters to engineers building the future.";

const EPISODES: Episode[] = [
  {
    id: "s2e8",
    title: "The Rise of Local-First Software",
    description:
      "We explore the growing movement toward local-first applications — why developers are pushing computation back to the edge, how CRDTs enable seamless sync, and what this means for the future of cloud infrastructure.",
    duration: 47,
    date: "2026-02-14",
    season: 2,
    episode: 8,
  },
  {
    id: "s2e7",
    title: "Interview: Building GitHub Copilot from Scratch",
    description:
      "An exclusive conversation with the engineering lead behind GitHub Copilot. We discuss the challenges of training code models, latency optimization for real-time suggestions, and the ethics of AI-assisted development.",
    duration: 62,
    date: "2026-02-07",
    season: 2,
    episode: 7,
  },
  {
    id: "s2e6",
    title: "TypeScript 6.0 Deep Dive",
    description:
      "Breaking down the major features in TypeScript 6.0 including pattern matching, pipe operators, and improved type inference. We walk through real-world migration strategies for large codebases.",
    duration: 38,
    date: "2026-01-31",
    season: 2,
    episode: 6,
  },
  {
    id: "s2e5",
    title: "Monorepos at Scale: Lessons from Vercel",
    description:
      "How Vercel manages a massive monorepo with Turborepo. We cover build caching strategies, dependency management, and the trade-offs between monorepo and polyrepo architectures in growing teams.",
    duration: 51,
    date: "2026-01-24",
    season: 2,
    episode: 5,
  },
  {
    id: "s1e4",
    title: "The State of WebAssembly in 2026",
    description:
      "A roundup of the latest WebAssembly developments — component model progress, server-side Wasm runtimes, and real production use cases from companies replacing microservices with Wasm modules.",
    duration: 44,
    date: "2025-12-20",
    season: 1,
    episode: 4,
  },
  {
    id: "s1e3",
    title: "Postgres is the New Everything",
    description:
      "Why PostgreSQL keeps eating the database world. We discuss pgvector for embeddings, logical replication patterns, and how teams are consolidating Redis, Elasticsearch, and message queues into a single Postgres instance.",
    duration: 55,
    date: "2025-12-13",
    season: 1,
    episode: 3,
  },
  {
    id: "s1e2",
    title: "Interview: From Bootcamp to Staff Engineer",
    description:
      "Maria Rodriguez shares her journey from a 12-week bootcamp to Staff Engineer at Stripe in six years. We talk about mentorship, technical depth vs breadth, and navigating imposter syndrome in senior roles.",
    duration: 58,
    date: "2025-12-06",
    season: 1,
    episode: 2,
  },
  {
    id: "s1e1",
    title: "Pilot: Why We Started The Dev Dispatch",
    description:
      "The very first episode. We lay out our vision for a podcast that cuts through the hype and focuses on what practicing engineers actually need. Plus a news roundup covering Bun 2.0, Deno KV, and the Rust Foundation drama.",
    duration: 34,
    date: "2025-11-29",
    season: 1,
    episode: 1,
  },
];

const TOTAL_EPISODES = EPISODES.length;
const TOTAL_MINUTES = EPISODES.reduce((sum, ep) => sum + ep.duration, 0);

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function seasonEpisodeCode(ep: Episode): string {
  return `S${ep.season} E${ep.episode}`;
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function ShowArtwork() {
  return (
    <div className="relative flex h-48 w-48 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-purple-800 shadow-2xl shadow-purple-900/40 sm:h-56 sm:w-56">
      <Mic className="h-20 w-20 text-white/90 sm:h-24 sm:w-24" strokeWidth={1.5} />
      <div
        className="absolute inset-0 rounded-2xl opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}

function SubscribeButtons() {
  const buttons = [
    { label: "Apple Podcasts", bg: "bg-purple-600 hover:bg-purple-500" },
    { label: "Spotify", bg: "bg-green-600 hover:bg-green-500" },
    { label: "RSS Feed", bg: "bg-orange-600 hover:bg-orange-500", icon: <Rss className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition-colors shadow-sm",
            btn.bg
          )}
        >
          {btn.icon}
          {btn.label}
        </button>
      ))}
    </div>
  );
}

function FilterTabs({
  active,
  onChange,
}: {
  active: FilterTab;
  onChange: (tab: FilterTab) => void;
}) {
  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All Episodes" },
    { key: "season-1", label: "Season 1" },
    { key: "season-2", label: "Season 2" },
  ];

  return (
    <div className="flex gap-1 rounded-xl bg-zinc-800/60 p-1" role="tablist" aria-label="Filter by season">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-all",
            active === tab.key
              ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function EpisodeRow({
  episode,
  isPlaying,
  isActive,
  onPlay,
}: {
  episode: Episode;
  isPlaying: boolean;
  isActive: boolean;
  onPlay: () => void;
}) {
  return (
    <article
      className={cn(
        "group flex items-start gap-4 rounded-xl border p-4 transition-all duration-200 sm:items-center",
        isActive
          ? "border-purple-500/60 bg-purple-950/30 shadow-sm shadow-purple-900/20"
          : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70"
      )}
    >
      {/* Play button */}
      <button
        onClick={onPlay}
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-200",
          isActive
            ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
            : "bg-zinc-800 text-zinc-400 group-hover:bg-purple-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-purple-900/30"
        )}
        aria-label={isPlaying && isActive ? `Pause ${episode.title}` : `Play ${episode.title}`}
      >
        {isPlaying && isActive ? (
          <Pause className="h-5 w-5" fill="currentColor" />
        ) : (
          <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
        )}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span className="font-semibold text-purple-400">
            {seasonEpisodeCode(episode)}
          </span>
          <span aria-hidden="true">·</span>
          <span>{formatDate(episode.date)}</span>
        </div>
        <h3
          className={cn(
            "mb-1 text-sm font-semibold leading-snug sm:text-base",
            isActive ? "text-purple-200" : "text-zinc-100"
          )}
        >
          {episode.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-zinc-500">
          {episode.description}
        </p>
      </div>

      {/* Duration badge */}
      <div className="hidden shrink-0 sm:flex items-center gap-1.5 rounded-full bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-400">
        <Clock className="h-3.5 w-3.5" />
        {formatDuration(episode.duration)}
      </div>
    </article>
  );
}

function NowPlayingBar({
  episode,
  isPlaying,
  onTogglePlay,
  onClose,
}: {
  episode: Episode;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose: () => void;
}) {
  const fakeCurrent = isPlaying ? "12:34" : "0:00";
  const totalMinutes = Math.floor(episode.duration);
  const totalFormatted = `${totalMinutes}:00`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-700/60 bg-zinc-900/95 backdrop-blur-xl animate-in slide-in-from-bottom-full duration-300">
      {/* Progress bar at top */}
      <div className="relative h-1 w-full bg-zinc-800">
        <div
          className={cn(
            "absolute left-0 top-0 h-full rounded-r-full bg-gradient-to-r from-purple-600 to-fuchsia-500",
            isPlaying && "animate-progress"
          )}
          style={{ width: isPlaying ? "26%" : "0%" }}
          role="progressbar"
          aria-label="Playback progress"
          aria-valuenow={isPlaying ? 26 : 0}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:gap-4">
        {/* Episode info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-100">
            {episode.title}
          </p>
          <p className="truncate text-xs text-zinc-500">
            {SHOW_TITLE} · {seasonEpisodeCode(episode)}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            className="hidden text-zinc-500 transition-colors hover:text-zinc-200 sm:block"
            aria-label="Previous episode"
          >
            <SkipBack className="h-5 w-5" />
          </button>

          <button
            onClick={onTogglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/40"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" fill="currentColor" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
            )}
          </button>

          <button
            className="hidden text-zinc-500 transition-colors hover:text-zinc-200 sm:block"
            aria-label="Next episode"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Time display */}
        <div className="hidden items-center gap-2 text-xs tabular-nums text-zinc-500 md:flex">
          <span>{fakeCurrent}</span>
          <span>/</span>
          <span>{totalFormatted}</span>
        </div>

        {/* Volume */}
        <button
          className="hidden text-zinc-500 transition-colors hover:text-zinc-200 lg:block"
          aria-label="Volume"
        >
          <Volume2 className="h-5 w-5" />
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          className="text-zinc-500 transition-colors hover:text-zinc-200"
          aria-label="Close player"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page Component                                                            */
/* -------------------------------------------------------------------------- */

export default function PodcastShowPage() {
  const [nowPlayingId, setNowPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const nowPlayingEpisode = useMemo(
    () => EPISODES.find((ep) => ep.id === nowPlayingId) ?? null,
    [nowPlayingId]
  );

  const handlePlay = useCallback(
    (episodeId: string) => {
      if (nowPlayingId === episodeId) {
        setIsPlaying((prev) => !prev);
      } else {
        setNowPlayingId(episodeId);
        setIsPlaying(true);
      }
    },
    [nowPlayingId]
  );

  const handleClosePlayer = useCallback(() => {
    setNowPlayingId(null);
    setIsPlaying(false);
  }, []);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const filteredEpisodes = useMemo(() => {
    let result = EPISODES;

    // Filter by season
    if (filterTab === "season-1") {
      result = result.filter((ep) => ep.season === 1);
    } else if (filterTab === "season-2") {
      result = result.filter((ep) => ep.season === 2);
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (ep) =>
          ep.title.toLowerCase().includes(q) ||
          ep.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [filterTab, search]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* Background texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(168 85 247) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />

      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-purple-900/15 blur-[140px]"
        aria-hidden="true"
      />

      {/* Show Header */}
      <header className="relative border-b border-zinc-800/60 pb-10 pt-12 sm:pt-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
            <ShowArtwork />

            <div className="flex-1 text-center sm:text-left">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">
                Podcast
              </p>
              <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
                {SHOW_TITLE}
              </h1>
              <p className="mb-4 text-sm font-medium text-zinc-400">
                Hosted by{" "}
                <span className="text-zinc-200">{SHOW_HOST}</span>
              </p>
              <p className="mb-6 max-w-xl text-sm leading-relaxed text-zinc-500">
                {SHOW_DESCRIPTION}
              </p>

              <SubscribeButtons />

              <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500 sm:justify-start">
                <span className="flex items-center gap-1.5">
                  <Mic className="h-3.5 w-3.5 text-purple-400" />
                  {TOTAL_EPISODES} episodes
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-purple-400" />
                  {formatDuration(TOTAL_MINUTES)} total
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Episode List */}
      <main
        className={cn(
          "relative mx-auto max-w-4xl px-4 py-8 sm:px-6",
          nowPlayingEpisode && "pb-32"
        )}
      >
        {/* Toolbar: Filters + Search */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <FilterTabs active={filterTab} onChange={setFilterTab} />

          <div className="relative sm:max-w-xs sm:flex-1">
            <label htmlFor="episode-search" className="sr-only">
              Search episodes
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              id="episode-search"
              type="text"
              placeholder="Search episodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 pl-9 pr-3 text-sm text-zinc-200 transition-colors placeholder:text-zinc-600 hover:border-zinc-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        {/* Episode count */}
        <p className="mb-4 text-xs font-medium text-zinc-500">
          {filteredEpisodes.length} episode{filteredEpisodes.length !== 1 ? "s" : ""}
        </p>

        {/* Episodes */}
        {filteredEpisodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 py-16 text-center">
            <Search className="mb-3 h-8 w-8 text-zinc-600" />
            <p className="text-sm font-medium text-zinc-500">
              No episodes match your search.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setFilterTab("all");
              }}
              className="mt-2 text-sm font-medium text-purple-400 hover:text-purple-300"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEpisodes.map((episode) => (
              <EpisodeRow
                key={episode.id}
                episode={episode}
                isPlaying={isPlaying}
                isActive={nowPlayingId === episode.id}
                onPlay={() => handlePlay(episode.id)}
              />
            ))}
          </div>
        )}

        {/* Browse prompt */}
        {filteredEpisodes.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-xs text-zinc-600">
              Showing all episodes for{" "}
              {filterTab === "all"
                ? "both seasons"
                : filterTab === "season-1"
                  ? "Season 1"
                  : "Season 2"}
              .
            </p>
          </div>
        )}
      </main>

      {/* Now Playing Bar */}
      {nowPlayingEpisode && (
        <NowPlayingBar
          episode={nowPlayingEpisode}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onClose={handleClosePlayer}
        />
      )}

      {/* Inline styles for animations */}
      <style jsx global>{`
        @keyframes progress-grow {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress-grow 120s linear forwards;
        }
        @keyframes slide-in-from-bottom-full {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-in.slide-in-from-bottom-full {
          animation: slide-in-from-bottom-full 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

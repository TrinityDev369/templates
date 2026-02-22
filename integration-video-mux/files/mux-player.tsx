"use client";

import MuxPlayerComponent from "@mux/mux-player-react";
import type { MuxPlayerProps } from "./types";

/**
 * Responsive Mux video player component.
 *
 * Wraps `@mux/mux-player-react` with a clean API surface and
 * sensible defaults for web playback.
 */
export function MuxPlayer({
  playbackId,
  title,
  accentColor,
  autoPlay = false,
  muted = false,
  loop = false,
  className,
  style,
  onPlay,
  onPause,
  onEnded,
}: MuxPlayerProps) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        ...style,
      }}
    >
      <MuxPlayerComponent
        playbackId={playbackId}
        metadata={{ video_title: title }}
        accentColor={accentColor}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        streamType="on-demand"
        style={{ width: "100%", display: "block" }}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
      />
    </div>
  );
}

export interface MuxConfig {
  tokenId: string;
  tokenSecret: string;
}

export interface UploadResult {
  uploadId: string;
  uploadUrl: string;
}

export interface Asset {
  id: string;
  playbackId: string;
  status: "preparing" | "ready" | "errored";
  duration?: number;
  aspectRatio?: string;
  createdAt: string;
}

export interface MuxPlayerProps {
  playbackId: string;
  title?: string;
  accentColor?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

'use client';

import { useMemo } from 'react';
import {
  generateIvmOverlaySvg,
  type IvmOverlayConfig,
  type TypographyConfig,
  type BadgeConfig,
} from '@/lib/thumbnail/overlay/ivm-svg';

interface IvmOverlayPreviewProps {
  config: IvmOverlayConfig;
  typography?: TypographyConfig;
  badges?: BadgeConfig[];
}

export function IvmOverlayPreview({ config, typography, badges }: IvmOverlayPreviewProps) {
  const svgHtml = useMemo(
    () => generateIvmOverlaySvg(config, typography, badges),
    [config, typography, badges],
  );

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
}

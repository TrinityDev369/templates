'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wand2, Dice5, Loader2 } from 'lucide-react';
import type { IvmOverlayConfig } from '@/lib/thumbnail/overlay/ivm-svg';

interface IvmOverlayControlsProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  config: IvmOverlayConfig;
  onConfigChange: (config: IvmOverlayConfig) => void;
  title: string;
  onTitleChange: (title: string) => void;
  categoryText: string;
  onCategoryChange: (text: string) => void;
  onApply: () => void;
  isApplying: boolean;
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <span className="text-xs font-mono tabular-nums">{value}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}

export function IvmOverlayControls({
  enabled,
  onToggle,
  config,
  onConfigChange,
  title,
  onTitleChange,
  categoryText,
  onCategoryChange,
  onApply,
  isApplying,
}: IvmOverlayControlsProps) {
  const update = (partial: Partial<IvmOverlayConfig>) => {
    onConfigChange({ ...config, ...partial });
  };

  const randomize = () => {
    update({
      rotationDeg: Math.round(Math.random() * 360),
      seed: Math.round(Math.random() * 999999),
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            IVM Branding
          </CardTitle>
          <Switch checked={enabled} onCheckedChange={onToggle} />
        </div>
      </CardHeader>
      {enabled && (
        <CardContent className="space-y-4">
          <SliderRow label="Triangle Size" value={config.sideLength} min={30} max={100} step={5} onChange={(v) => update({ sideLength: v })} />
          <SliderRow label="Rotation" value={config.rotationDeg} min={0} max={360} step={1} onChange={(v) => update({ rotationDeg: v })} />
          <SliderRow label="Corner Reach" value={Math.round(config.cornerMargin * 100)} min={10} max={45} step={1} onChange={(v) => update({ cornerMargin: v / 100 })} />
          <SliderRow label="Blur" value={config.blurAmount} min={0} max={8} step={0.5} onChange={(v) => update({ blurAmount: v })} />
          <SliderRow label="Opacity" value={Math.round(config.opacity * 100)} min={20} max={100} step={5} onChange={(v) => update({ opacity: v / 100 })} />
          <SliderRow label="Line Width" value={config.lineWidth} min={1} max={5} step={0.5} onChange={(v) => update({ lineWidth: v })} />

          <Button variant="outline" size="sm" className="w-full" onClick={randomize}>
            <Dice5 className="h-4 w-4 mr-2" />
            Randomize Angle
          </Button>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Title Text</Label>
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Optional overlay title..."
              className="text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Category Badge</Label>
            <Input
              value={categoryText}
              onChange={(e) => onCategoryChange(e.target.value)}
              placeholder="e.g. Engineering, Design..."
              className="text-sm"
            />
          </div>

          <Button className="w-full" onClick={onApply} disabled={isApplying}>
            {isApplying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Compositing...
              </>
            ) : (
              'Apply & Export'
            )}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

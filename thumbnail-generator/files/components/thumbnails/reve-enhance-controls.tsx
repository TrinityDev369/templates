'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Sparkles, Loader2 } from 'lucide-react';

interface ReveEnhanceControlsProps {
  thumbnailId: string;
  onEnhanceComplete: () => void;
}

export function ReveEnhanceControls({
  thumbnailId,
  onEnhanceComplete,
}: ReveEnhanceControlsProps) {
  const [editInstruction, setEditInstruction] = useState('');
  const [version, setVersion] = useState<'latest' | 'latest-fast'>('latest');
  const [testTimeScaling, setTestTimeScaling] = useState(1);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnhance = async () => {
    if (!editInstruction.trim()) return;

    setIsEnhancing(true);
    setError(null);

    try {
      const response = await fetch(`/api/thumbnails/${thumbnailId}/enhance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          editInstruction: editInstruction.trim(),
          version,
          testTimeScaling,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || data.error || 'Enhancement failed');
      }

      setEditInstruction('');
      onEnhanceComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enhancement failed');
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI Enhancement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Edit Instruction</Label>
          <Textarea
            value={editInstruction}
            onChange={(e) => setEditInstruction(e.target.value)}
            placeholder="e.g. Add geometric vector patterns, enhance colors with warm tones, apply artistic oil painting style..."
            rows={3}
            className="text-sm"
            maxLength={2560}
          />
          <p className="text-[10px] text-muted-foreground text-right">
            {editInstruction.length}/2560
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Model</Label>
          </div>
          <div className="flex gap-2">
            <Button
              variant={version === 'latest' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setVersion('latest')}
            >
              Quality
            </Button>
            <Button
              variant={version === 'latest-fast' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setVersion('latest-fast')}
            >
              Fast
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Test-Time Scaling</Label>
            <span className="text-xs font-mono tabular-nums">{testTimeScaling}</span>
          </div>
          <Slider
            min={1}
            max={5}
            step={1}
            value={[testTimeScaling]}
            onValueChange={([v]) => setTestTimeScaling(v)}
          />
          <p className="text-[10px] text-muted-foreground">
            Higher = better quality, slower generation
          </p>
        </div>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        <Button
          className="w-full"
          onClick={handleEnhance}
          disabled={!editInstruction.trim() || isEnhancing}
        >
          {isEnhancing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enhancing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Enhance with AI
            </>
          )}
        </Button>

        <p className="text-[10px] text-muted-foreground text-center">
          ~30 credits per enhancement
        </p>
      </CardContent>
    </Card>
  );
}

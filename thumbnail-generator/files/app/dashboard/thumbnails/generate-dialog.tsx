'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader2 } from 'lucide-react';
import { presetConfigs, type PresetId } from '@/lib/thumbnail/types';

const presets = Object.entries(presetConfigs) as [PresetId, (typeof presetConfigs)[PresetId]][];

const backends = [
  { id: 'reve', name: 'Reve AI (Default)', description: 'High quality, synchronous' },
  { id: 'flux', name: 'Flux', description: 'Multiple models, async polling' },
];

const fluxModels = [
  { id: 'flux-dev', name: 'Flux Dev (Testing)', cost: '$0.01' },
  { id: 'flux-2-pro', name: 'Flux 2 Pro', cost: '$0.05' },
  { id: 'flux-2-max', name: 'Flux 2 Max (Best)', cost: '$0.08' },
];

export function GenerateDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prompt, setPrompt] = useState('');
  const [preset, setPreset] = useState<PresetId>('og-image');
  const [backend, setBackend] = useState('reve');
  const [model, setModel] = useState('flux-dev');
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');

  const selectedPreset = presetConfigs[preset];
  const isCustom = preset === 'custom';

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/thumbnails/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          preset: preset !== 'custom' ? preset : undefined,
          backend,
          model: backend === 'flux' ? model : undefined,
          width: isCustom && customWidth ? parseInt(customWidth, 10) : undefined,
          height: isCustom && customHeight ? parseInt(customHeight, 10) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setOpen(false);
      router.push(`/dashboard/thumbnails/${data.thumbnail.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Thumbnail
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Thumbnail</DialogTitle>
          <DialogDescription>
            Create an AI-generated thumbnail image for social sharing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the thumbnail you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Be specific about style, colors, and composition.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preset">Preset</Label>
            <Select value={preset} onValueChange={(v) => setPreset(v as PresetId)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a preset" />
              </SelectTrigger>
              <SelectContent>
                {presets.map(([id, config]) => (
                  <SelectItem key={id} value={id}>
                    <div className="flex flex-col">
                      <span>{config.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {config.width} x {config.height} — {config.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isCustom && (
              <p className="text-xs text-muted-foreground">
                {selectedPreset.width} x {selectedPreset.height} pixels
              </p>
            )}
          </div>

          {isCustom && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  placeholder="1024"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  min={256}
                  max={2048}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="1024"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                  min={256}
                  max={2048}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Backend</Label>
            <div className="flex gap-2">
              {backends.map((b) => (
                <Button
                  key={b.id}
                  variant={backend === b.id ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setBackend(b.id)}
                >
                  {b.name}
                </Button>
              ))}
            </div>
          </div>

          {backend === 'flux' && (
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {fluxModels.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center justify-between gap-4">
                        <span>{m.name}</span>
                        <span className="text-xs text-muted-foreground">{m.cost}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isGenerating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

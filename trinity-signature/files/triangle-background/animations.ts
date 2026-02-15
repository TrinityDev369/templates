/**
 * Triangle Background Animations
 * Per-triangle transforms driven by simplex noise + time.
 */

import { animatedNoise } from './noise';

export interface AnimationState {
  scale: number;
  opacity: number;
  rotationOffset: number;
}

export interface AnimationContext {
  time: number;
  mouseX: number;
  mouseY: number;
  mouseActive: boolean;
}

export interface TrianglePosition {
  x: number;
  y: number;
  index: number;
}

export interface AnimationConfig {
  speed: number;
  intensity: number;
  noiseScale: number;
  mouseRadius: number;
  mouseStrength: number;
}

export type AnimationFunction = (
  pos: TrianglePosition,
  ctx: AnimationContext,
  config: AnimationConfig,
) => AnimationState;

export function swarmAnimation(pos: TrianglePosition, ctx: AnimationContext, config: AnimationConfig): AnimationState {
  const { time, mouseX, mouseY, mouseActive } = ctx;
  const { speed, intensity, noiseScale } = config;
  const nx = pos.x * noiseScale, ny = pos.y * noiseScale, nt = time * speed * 0.3;
  const noiseVal = animatedNoise(nx, ny, nt);
  const opacityNoise = animatedNoise(nx * 1.5 + 100, ny * 1.5, nt * 0.7);
  let scale = 0.6 + (noiseVal * 0.5 + 0.5) * intensity * 0.8;
  let opacity = 0.4 + (opacityNoise * 0.5 + 0.5) * 0.6;
  if (mouseActive) {
    const dx = pos.x - mouseX, dy = pos.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < config.mouseRadius) {
      const falloff = 1 - dist / config.mouseRadius;
      const repulsion = falloff * falloff * config.mouseStrength;
      scale *= 1 - repulsion * 0.7;
      opacity *= 1 - repulsion * 0.3;
    }
  }
  return { scale, opacity, rotationOffset: noiseVal * intensity * 5 };
}

export function waveAnimation(pos: TrianglePosition, ctx: AnimationContext, config: AnimationConfig): AnimationState {
  const { time, mouseX, mouseY, mouseActive } = ctx;
  const { speed, intensity } = config;
  const waveFreq = 4, waveSpeed = time * speed;
  const wave1 = Math.sin((pos.x + pos.y) * waveFreq - waveSpeed);
  const wave2 = Math.sin(pos.x * waveFreq * 1.5 - waveSpeed * 1.3);
  const combined = (wave1 + wave2 * 0.5) / 1.5;
  let scale = 0.5 + (combined * 0.5 + 0.5) * intensity;
  let opacity = 0.3 + (combined * 0.5 + 0.5) * 0.7;
  if (mouseActive) {
    const dx = pos.x - mouseX, dy = pos.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < config.mouseRadius * 1.5) {
      const falloff = 1 - dist / (config.mouseRadius * 1.5);
      const attraction = falloff * falloff * config.mouseStrength * 0.5;
      scale *= 1 + attraction * 0.5;
      opacity = Math.min(1, opacity + attraction * 0.3);
    }
  }
  return { scale, opacity, rotationOffset: 0 };
}

export function pulseAnimation(pos: TrianglePosition, ctx: AnimationContext, config: AnimationConfig): AnimationState {
  const { time, mouseX, mouseY, mouseActive } = ctx;
  const { speed, intensity } = config;
  const centerX = mouseActive ? mouseX : 0.5, centerY = mouseActive ? mouseY : 0.5;
  const dist = Math.sqrt((pos.x - centerX) ** 2 + (pos.y - centerY) ** 2);
  const ringSpeed = time * speed * 2;
  const ring = Math.sin(dist * 6 - ringSpeed);
  const ring2 = Math.sin(dist * 4.2 - ringSpeed * 0.8) * 0.5;
  const combined = (ring + ring2) / 1.5;
  return {
    scale: 0.4 + (combined * 0.5 + 0.5) * intensity * 0.8,
    opacity: 0.3 + (combined * 0.5 + 0.5) * 0.7,
    rotationOffset: 0,
  };
}

export function vortexAnimation(pos: TrianglePosition, ctx: AnimationContext, config: AnimationConfig): AnimationState {
  const { time, mouseX, mouseY, mouseActive } = ctx;
  const { speed, intensity } = config;
  const cx = mouseActive ? mouseX : 0.5, cy = mouseActive ? mouseY : 0.5;
  const dx = pos.x - cx, dy = pos.y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  const spiral = Math.sin(angle * 3 + dist * 8 - time * speed * 2);
  const distFalloff = 1 - Math.min(dist * 1.5, 1);
  return {
    scale: 0.4 + spiral * 0.3 * intensity + distFalloff * 0.3,
    opacity: 0.3 + (spiral * 0.5 + 0.5) * 0.5 + distFalloff * 0.2,
    rotationOffset: (angle + time * speed) * 10 * intensity,
  };
}

export function breatheAnimation(pos: TrianglePosition, ctx: AnimationContext, config: AnimationConfig): AnimationState {
  const { time } = ctx;
  const { speed, intensity } = config;
  const breathe = Math.sin(time * speed * 0.5) * 0.5 + 0.5;
  const offset = (pos.x + pos.y) * 0.2;
  const localBreathe = Math.sin(time * speed * 0.5 + offset) * 0.5 + 0.5;
  const combined = breathe * 0.7 + localBreathe * 0.3;
  return { scale: 0.5 + combined * intensity * 0.5, opacity: 0.4 + combined * 0.5, rotationOffset: 0 };
}

export function flowAnimation(pos: TrianglePosition, ctx: AnimationContext, config: AnimationConfig): AnimationState {
  const { time } = ctx;
  const { speed, intensity, noiseScale } = config;
  const nx = pos.x * noiseScale, ny = pos.y * noiseScale, nt = time * speed * 0.2;
  const flowAngle = animatedNoise(nx, ny, nt) * Math.PI * 2;
  const flowIntensity = (animatedNoise(nx + 50, ny + 50, nt) + 1) * 0.5;
  const dirEffect = Math.sin(pos.x * 10 + flowAngle + time * speed);
  return {
    scale: 0.5 + flowIntensity * intensity * 0.5,
    opacity: 0.3 + flowIntensity * 0.5 + dirEffect * 0.2,
    rotationOffset: flowAngle * 30 * intensity,
  };
}

export type AnimationType = 'swarm' | 'wave' | 'pulse' | 'vortex' | 'breathe' | 'flow';

export const animations: Record<AnimationType, AnimationFunction> = {
  swarm: swarmAnimation,
  wave: waveAnimation,
  pulse: pulseAnimation,
  vortex: vortexAnimation,
  breathe: breatheAnimation,
  flow: flowAnimation,
};

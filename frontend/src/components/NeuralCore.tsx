import { useEffect, useRef } from 'react';

export type RegionId =
  | 'prefrontal'
  | 'motor'
  | 'association'
  | 'sensory'
  | 'concept'
  | 'feature'
  | 'language'
  | 'hippocampus';

export type ActivityMap = Partial<Record<RegionId, number>>;

interface NeuralCoreProps {
  /** Activity level per region, 0..1 — drives firing rate and the label percentage. */
  activity?: ActivityMap;
  className?: string;
}

interface RegionConfig {
  id: RegionId;
  name: string;
  color: string;
  center: [number, number, number];
  count: number;
  spread: number;
  labelOffset: [number, number];
}

const REGIONS: RegionConfig[] = [
  { id: 'prefrontal', name: 'PREFRONTAL', color: '#b388ff', center: [0.15, 0.72, 0.0], count: 140, spread: 0.26, labelOffset: [90, -30] },
  { id: 'motor', name: 'MOTOR CORTEX', color: '#ff3860', center: [0.45, 0.42, 0.18], count: 190, spread: 0.24, labelOffset: [110, 0] },
  { id: 'association', name: 'ASSOCIATION', color: '#ff9100', center: [0.55, 0.05, -0.12], count: 260, spread: 0.27, labelOffset: [110, -10] },
  { id: 'sensory', name: 'SENSORY CORTEX', color: '#8a9bb0', center: [0.32, -0.08, 0.3], count: 200, spread: 0.22, labelOffset: [120, 30] },
  { id: 'concept', name: 'CONCEPT LAYER', color: '#ffd166', center: [-0.72, 0.12, 0.02], count: 160, spread: 0.3, labelOffset: [-120, -10] },
  { id: 'feature', name: 'FEATURE LAYER', color: '#00f0ff', center: [-0.18, -0.32, 0.12], count: 180, spread: 0.26, labelOffset: [-130, 20] },
  { id: 'language', name: 'LANGUAGE', color: '#ff4d9e', center: [0.22, -0.42, -0.2], count: 170, spread: 0.23, labelOffset: [110, 40] },
  { id: 'hippocampus', name: 'HIPPOCAMPUS', color: '#00e676', center: [0.02, -0.82, 0.08], count: 160, spread: 0.24, labelOffset: [90, 45] },
];

interface Neuron {
  x: number;
  y: number;
  z: number;
  size: number;
  phase: number;
  glow: number;
  region: number;
}

interface Edge {
  a: number;
  b: number;
  region: number;
  inter: boolean;
}

interface Pulse {
  edge: number;
  t: number;
  speed: number;
  forward: boolean;
}

interface RegionState {
  firing: number;
  firingTimer: number;
}

function gauss(rng: () => number): number {
  return (rng() + rng() + rng() - 1.5) / 1.5;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class BrainEngine {
  neurons: Neuron[] = [];
  edges: Edge[] = [];
  edgesByRegion: number[][] = [];
  pulses: Pulse[] = [];
  regionStates: RegionState[] = [];
  stars: { x: number; y: number; phase: number; size: number }[] = [];
  activity: Record<RegionId, number>;
  angle = 0;

  constructor() {
    this.activity = Object.fromEntries(REGIONS.map((r) => [r.id, 0.3])) as Record<RegionId, number>;
    const rng = mulberry32(1337);

    REGIONS.forEach((region, ri) => {
      this.regionStates.push({ firing: 0.3, firingTimer: rng() });
      this.edgesByRegion.push([]);
      const start = this.neurons.length;
      // Visual density is a fraction of the advertised neuron count.
      const visual = Math.round(region.count * 0.45);
      for (let i = 0; i < visual; i++) {
        this.neurons.push({
          x: region.center[0] + gauss(rng) * region.spread,
          y: region.center[1] + gauss(rng) * region.spread,
          z: region.center[2] + gauss(rng) * region.spread * 0.8,
          size: 0.8 + rng() * 1.4,
          phase: rng() * Math.PI * 2,
          glow: 0,
          region: ri,
        });
      }
      // Intra-region edges: each neuron links to its 2 nearest siblings.
      const end = this.neurons.length;
      const seen = new Set<string>();
      for (let i = start; i < end; i++) {
        const dists: { j: number; d: number }[] = [];
        for (let j = start; j < end; j++) {
          if (i === j) continue;
          const dx = this.neurons[i].x - this.neurons[j].x;
          const dy = this.neurons[i].y - this.neurons[j].y;
          const dz = this.neurons[i].z - this.neurons[j].z;
          dists.push({ j, d: dx * dx + dy * dy + dz * dz });
        }
        dists.sort((a, b) => a.d - b.d);
        for (const { j } of dists.slice(0, 2)) {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (seen.has(key)) continue;
          seen.add(key);
          this.edgesByRegion[ri].push(this.edges.length);
          this.edges.push({ a: i, b: j, region: ri, inter: false });
        }
      }
    });

    // A few long-range links between neighbouring regions.
    const pairs: [number, number][] = [
      [0, 1], [1, 2], [2, 3], [3, 6], [6, 7], [5, 7], [4, 5], [0, 4], [2, 5], [0, 2],
    ];
    for (const [ra, rb] of pairs) {
      for (let k = 0; k < 3; k++) {
        const a = this.pickNeuron(ra, rng);
        const b = this.pickNeuron(rb, rng);
        this.edgesByRegion[ra].push(this.edges.length);
        this.edges.push({ a, b, region: ra, inter: true });
      }
    }

    for (let i = 0; i < 110; i++) {
      this.stars.push({ x: rng(), y: rng(), phase: rng() * Math.PI * 2, size: 0.5 + rng() * 1.2 });
    }
  }

  private pickNeuron(region: number, rng: () => number): number {
    const indices = this.neurons.map((n, i) => (n.region === region ? i : -1)).filter((i) => i >= 0);
    return indices[Math.floor(rng() * indices.length)];
  }

  setActivity(activity: ActivityMap) {
    for (const region of REGIONS) {
      const v = activity[region.id];
      if (typeof v === 'number' && Number.isFinite(v)) {
        this.activity[region.id] = Math.min(1, Math.max(0, v));
      }
    }
  }

  step(dt: number, animate: boolean) {
    if (!animate) return;
    this.angle += dt * 0.1;

    REGIONS.forEach((region, ri) => {
      const state = this.regionStates[ri];
      const act = this.activity[region.id];
      // Refresh the displayed firing rate periodically.
      state.firingTimer -= dt;
      if (state.firingTimer <= 0) {
        state.firingTimer = 0.9 + Math.random() * 0.6;
        state.firing = Math.max(0.1, act * 2.2 + (Math.random() - 0.5) * 0.4);
      }
      // Spawn pulses proportionally to activity.
      const rate = 0.5 + act * 3.0;
      if (Math.random() < rate * dt) {
        const regionEdges = this.edgesByRegion[ri];
        if (regionEdges.length > 0) {
          this.pulses.push({
            edge: regionEdges[Math.floor(Math.random() * regionEdges.length)],
            t: 0,
            speed: 0.6 + Math.random() * 0.9,
            forward: Math.random() < 0.5,
          });
          const edge = this.edges[this.pulses[this.pulses.length - 1].edge];
          this.neurons[edge.a].glow = 1;
        }
      }
    });

    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const pulse = this.pulses[i];
      pulse.t += pulse.speed * dt;
      if (pulse.t >= 1) {
        const edge = this.edges[pulse.edge];
        this.neurons[pulse.forward ? edge.b : edge.a].glow = 1;
        this.pulses.splice(i, 1);
      }
    }

    for (const neuron of this.neurons) {
      if (neuron.glow > 0) neuron.glow = Math.max(0, neuron.glow - dt * 2.2);
    }
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function render(ctx: CanvasRenderingContext2D, engine: BrainEngine, w: number, h: number, time: number) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(4, 7, 14, 0.55)';
  ctx.fillRect(0, 0, w, h);

  // Background starfield
  for (const star of engine.stars) {
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(time * 0.6 + star.phase));
    ctx.fillStyle = `rgba(220, 235, 255, ${0.25 * tw})`;
    ctx.fillRect(star.x * w, star.y * h, star.size, star.size);
  }

  const cx = w / 2;
  const cy = h / 2;
  const scale = Math.min(w, h) * 0.42;
  const cos = Math.cos(engine.angle);
  const sin = Math.sin(engine.angle);
  const tilt = 0.25 + 0.08 * Math.sin(time * 0.15);
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);
  const f = 2.6;

  const px = new Float32Array(engine.neurons.length);
  const py = new Float32Array(engine.neurons.length);
  const depth = new Float32Array(engine.neurons.length);
  engine.neurons.forEach((n, i) => {
    const x = n.x * cos + n.z * sin;
    let z = -n.x * sin + n.z * cos;
    const y = n.y * cosT - z * sinT;
    z = n.y * sinT + z * cosT;
    const persp = f / (f - z);
    px[i] = cx + x * scale * persp;
    py[i] = cy - y * scale * persp;
    depth[i] = persp;
  });

  // Edges
  ctx.lineWidth = 0.6;
  for (const edge of engine.edges) {
    const color = REGIONS[edge.region].color;
    const d = (depth[edge.a] + depth[edge.b]) / 2;
    const alpha = (edge.inter ? 0.07 : 0.16) * Math.min(1.4, d);
    ctx.strokeStyle = rgba(color, alpha);
    ctx.beginPath();
    if (edge.inter) {
      const mx = (px[edge.a] + px[edge.b]) / 2 + (py[edge.a] - py[edge.b]) * 0.2;
      const my = (py[edge.a] + py[edge.b]) / 2 + (px[edge.b] - px[edge.a]) * 0.2;
      ctx.moveTo(px[edge.a], py[edge.a]);
      ctx.quadraticCurveTo(mx, my, px[edge.b], py[edge.b]);
    } else {
      ctx.moveTo(px[edge.a], py[edge.a]);
      ctx.lineTo(px[edge.b], py[edge.b]);
    }
    ctx.stroke();
  }

  // Glowing passes
  ctx.globalCompositeOperation = 'lighter';

  // Neurons
  for (let i = 0; i < engine.neurons.length; i++) {
    const n = engine.neurons[i];
    const color = REGIONS[n.region].color;
    const tw = 0.45 + 0.55 * Math.abs(Math.sin(time * 1.1 + n.phase));
    const alpha = Math.min(1, (0.35 + 0.65 * n.glow) * tw * depth[i]);
    const size = n.size * depth[i] * (1 + n.glow * 1.6);
    ctx.fillStyle = rgba(color, alpha);
    ctx.beginPath();
    ctx.arc(px[i], py[i], size, 0, Math.PI * 2);
    ctx.fill();
    if (n.glow > 0.4) {
      ctx.fillStyle = rgba(color, n.glow * 0.25);
      ctx.beginPath();
      ctx.arc(px[i], py[i], size * 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Travelling pulses
  for (const pulse of engine.pulses) {
    const edge = engine.edges[pulse.edge];
    const t = pulse.forward ? pulse.t : 1 - pulse.t;
    const x = px[edge.a] + (px[edge.b] - px[edge.a]) * t;
    const y = py[edge.a] + (py[edge.b] - py[edge.a]) * t;
    const color = REGIONS[edge.region].color;
    ctx.fillStyle = rgba(color, 0.9);
    ctx.beginPath();
    ctx.arc(x, y, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgba(color, 0.2);
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = 'source-over';

  // Region HUD labels
  REGIONS.forEach((region, ri) => {
    const [rx, ry, rz] = region.center;
    const x3 = rx * cos + rz * sin;
    let z3 = -rx * sin + rz * cos;
    const y3 = ry * cosT - z3 * sinT;
    z3 = ry * sinT + z3 * cosT;
    const persp = f / (f - z3);
    const sx = cx + x3 * scale * persp;
    const sy = cy - y3 * scale * persp;

    const boxW = 148;
    const boxH = 30;
    let bx = sx + region.labelOffset[0] * (scale / 220) - boxW / 2;
    let by = sy + region.labelOffset[1] * (scale / 220) - boxH / 2;
    bx = Math.max(4, Math.min(w - boxW - 4, bx));
    by = Math.max(4, Math.min(h - boxH - 4, by));

    ctx.strokeStyle = rgba(region.color, 0.35);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(bx + boxW / 2, by + boxH / 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(10, 14, 23, 0.82)';
    ctx.strokeStyle = rgba(region.color, 0.7);
    ctx.lineWidth = 1;
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeRect(bx, by, boxW, boxH);

    const firing = engine.regionStates[ri].firing;
    ctx.fillStyle = region.color;
    ctx.font = "700 9px Orbitron, monospace";
    ctx.fillText(region.name, bx + 7, by + 12);
    ctx.fillStyle = 'rgba(224, 230, 237, 0.75)';
    ctx.font = "500 9px Rajdhani, sans-serif";
    ctx.fillText(`${region.count} neurons · firing ${firing.toFixed(1)}%`, bx + 7, by + 24);
  });
}

export default function NeuralCore({ activity, className }: NeuralCoreProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BrainEngine | null>(null);
  const activityRef = useRef<ActivityMap | undefined>(activity);
  activityRef.current = activity;

  useEffect(() => {
    engineRef.current?.setActivity(activity ?? {});
  }, [activity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const engine = new BrainEngine();
    engine.setActivity(activityRef.current ?? {});
    engineRef.current = engine;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = performance.now();
    let hidden = document.hidden;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(() => {
      resize();
      if (reducedMotion) render(ctx, engine, width, height, performance.now() / 1000);
    });
    observer.observe(canvas);
    resize();

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!hidden && width > 0) {
        engine.step(dt, !reducedMotion);
        render(ctx, engine, width, height, now / 1000);
      }
      if (!reducedMotion) raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      hidden = document.hidden;
      last = performance.now();
    };
    document.addEventListener('visibilitychange', onVisibility);

    if (reducedMotion) {
      // Static render: full network, no motion.
      render(ctx, engine, width, height, 0);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      engineRef.current = null;
    };
  }, []);

  return <canvas ref={canvasRef} className={className ?? 'w-full h-full'} style={{ display: 'block' }} />;
}

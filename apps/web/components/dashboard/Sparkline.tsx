interface SparklineProps {
  values: number[];
  w?: number;
  h?: number;
  color?: string;
}

export default function Sparkline({ values, w = 84, h = 24, color = '#00ff88' }: SparklineProps) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = (max - min) || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return [x, y] as [number, number];
  });
  const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const dArea = d + ` L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <path d={dArea} fill={color} fillOpacity="0.12" />
      <path d={d} stroke={color} strokeWidth="1.5" fill="none" />
    </svg>
  );
}

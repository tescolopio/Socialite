interface ProgressClockProps {
  segments: number;
  filled: number;
  onToggle: (index: number) => void;
  size?: number;
}

export default function ProgressClock({
  segments,
  filled,
  onToggle,
  size = 120,
}: ProgressClockProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;
  const gapDeg = segments <= 4 ? 3 : 2;

  const slices = Array.from({ length: segments }, (_, i) => {
    const sliceDeg = 360 / segments;
    const startDeg = i * sliceDeg - 90 + gapDeg / 2;
    const endDeg = startDeg + sliceDeg - gapDeg;

    const toRad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const largeArc = sliceDeg - gapDeg > 180 ? 1 : 0;

    const d = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    return { d, filled: i < filled };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="progress-clock"
      aria-label={`Progress clock: ${filled} of ${segments} segments filled`}
      role="group"
    >
      <title>{`Progress clock: ${filled} of ${segments} segments filled`}</title>
      {/* Background circle */}
      <circle cx={cx} cy={cy} r={r + 4} fill="#1a1a2e" />
      {slices.map((slice, i) => (
        <path
          key={i}
          d={slice.d}
          fill={slice.filled ? '#c8a951' : '#2d2d4e'}
          stroke="#0f0f1e"
          strokeWidth="1"
          className="clock-slice"
          style={{ cursor: 'pointer' }}
          onClick={() => onToggle(i)}
          role="button"
          aria-label={`Segment ${i + 1}: ${slice.filled ? 'filled' : 'empty'}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggle(i);
            }
          }}
        />
      ))}
      {/* Center label */}
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#e0e0e0"
        fontSize={size * 0.16}
        fontFamily="sans-serif"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {filled}/{segments}
      </text>
    </svg>
  );
}

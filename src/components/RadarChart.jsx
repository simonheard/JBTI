import { Box, Stack, Typography } from '@mui/material';

const SIZE = 340;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 118;
const LEVELS = 5;

function polarToCartesian(angle, radius) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(radians),
    y: CENTER + radius * Math.sin(radians),
  };
}

function buildPolygon(points) {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

export default function RadarChart({ data, mode }) {
  const axes = data.map((item, index) => {
    const angle = (360 / data.length) * index;
    const point = polarToCartesian(angle, OUTER_RADIUS);
    const valuePoint = polarToCartesian(angle, (item.percent / 100) * OUTER_RADIUS);
    const labelPoint = polarToCartesian(angle, OUTER_RADIUS + 30);

    return { ...item, angle, point, valuePoint, labelPoint };
  });

  const surface = buildPolygon(axes.map((axis) => axis.valuePoint));
  const accent = mode === 'direct' ? '#df5b2e' : '#7c946f';
  const fill = mode === 'direct' ? 'rgba(223, 91, 46, 0.22)' : 'rgba(124, 148, 111, 0.22)';

  return (
    <Stack spacing={2} alignItems="center">
      <Box sx={{ width: '100%', maxWidth: SIZE }}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" role="img" aria-label="JBTI 雷达图">
          {Array.from({ length: LEVELS }).map((_, levelIndex) => {
            const radius = (OUTER_RADIUS / LEVELS) * (levelIndex + 1);
            const ring = buildPolygon(
              axes.map((axis) => polarToCartesian(axis.angle, radius))
            );

            return (
              <polygon
                key={`ring-${radius}`}
                points={ring}
                fill="none"
                stroke="rgba(60, 60, 60, 0.12)"
                strokeWidth="1"
              />
            );
          })}

          {axes.map((axis) => (
            <line
              key={axis.id}
              x1={CENTER}
              y1={CENTER}
              x2={axis.point.x}
              y2={axis.point.y}
              stroke="rgba(60, 60, 60, 0.16)"
              strokeWidth="1"
            />
          ))}

          <polygon points={surface} fill={fill} stroke={accent} strokeWidth="3" />

          {axes.map((axis) => (
            <g key={`${axis.id}-point`}>
              <circle
                cx={axis.valuePoint.x}
                cy={axis.valuePoint.y}
                r="5"
                fill={accent}
              />
              <text
                x={axis.labelPoint.x}
                y={axis.labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#222"
                fontSize="13"
                fontWeight="700"
              >
                {axis.label}
              </text>
            </g>
          ))}
        </svg>
      </Box>

      <Stack
        direction="row"
        flexWrap="wrap"
        justifyContent="center"
        gap={1}
      >
        {data.map((item) => (
          <Typography
            key={item.id}
            variant="body2"
            sx={{
              px: 1.5,
              py: 0.75,
              borderRadius: 999,
              bgcolor: 'rgba(255,255,255,0.72)',
            }}
          >
            {item.label} {item.percent}%
          </Typography>
        ))}
      </Stack>
    </Stack>
  );
}

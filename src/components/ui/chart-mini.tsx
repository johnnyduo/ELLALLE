import React from 'react';

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  width = 60,
  height = 20,
  color = '#8b5cf6',
  strokeWidth = 1.5,
  className = '',
}) => {
  if (!data || data.length < 2) {
    return <div className={`w-[${width}px] h-[${height}px] ${className}`} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const isPositive = data[data.length - 1] >= data[0];

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline
        fill="none"
        stroke={isPositive ? '#10b981' : '#ef4444'}
        strokeWidth={strokeWidth}
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

interface MiniChartProps {
  data: Array<{ timestamp: number; price: number }>;
  width?: number;
  height?: number;
  className?: string;
}

export const MiniChart: React.FC<MiniChartProps> = ({
  data,
  width = 300,
  height = 200,
  className = '',
}) => {
  if (!data || data.length < 2) {
    return (
      <div className={`w-full h-[${height}px] flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground">No data available</span>
      </div>
    );
  }

  const prices = data.map(d => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((item.price - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const isPositive = data[data.length - 1].price >= data[0].price;
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full h-[${height}px] ${className}`}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="rounded-lg"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              stopColor={isPositive ? '#10b981' : '#ef4444'}
              stopOpacity="0.3"
            />
            <stop
              offset="100%"
              stopColor={isPositive ? '#10b981' : '#ef4444'}
              stopOpacity="0.05"
            />
          </linearGradient>
        </defs>
        
        {/* Fill area */}
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill={`url(#${gradientId})`}
        />
        
        {/* Price line */}
        <polyline
          fill="none"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth="2"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Glow effect */}
        <polyline
          fill="none"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth="4"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.3"
          filter="blur(2px)"
        />
      </svg>
    </div>
  );
};

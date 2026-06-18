import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

interface CustomLineChartProps {
  data: number[];
  width?: number;
  height?: number;
}

export const CustomLineChart: React.FC<CustomLineChartProps> = ({
  data = [60, 68, 62, 75, 87, 82, 90], // default weekly productivity percent
  width = 310,
  height = 90,
}) => {
  const paddingX = 15;
  const paddingY = 15;
  
  // Calculate points
  const points = data.map((value, index) => {
    const x = paddingX + (index * (width - 2 * paddingX)) / (data.length - 1);
    // Invert y because SVG coordinates start from top left
    const y = height - paddingY - (value / 100) * (height - 2 * paddingY);
    return { x, y, value };
  });

  // Construct line path string
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    pathD += ` L ${points[i].x} ${points[i].y}`;
  }

  // Construct fill path string (closes the shape at the bottom)
  const fillD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Defs>
          {/* Glowing stroke gradient */}
          <LinearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="1.0" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.6" />
          </LinearGradient>
          
          {/* Semi-transparent area fill gradient */}
          <LinearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Shaded Area Fill */}
        <Path d={fillD} fill="url(#fillGrad)" />

        {/* Glow Line */}
        <Path
          d={pathD}
          fill="transparent"
          stroke="url(#strokeGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Vertex Markers */}
        {points.map((pt, idx) => (
          <React.Fragment key={idx}>
            {/* Outline Glow Ring */}
            <Circle
              cx={pt.x}
              cy={pt.y}
              r="6"
              fill="transparent"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              opacity="0.5"
            />
            {/* Solid Center Dot */}
            <Circle
              cx={pt.x}
              cy={pt.y}
              r="3.5"
              fill="#FFFFFF"
            />
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginVertical: 10,
  },
});

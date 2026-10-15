import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import { colors, iconSize } from '../theme';
import { ICON_SHAPES, IconName } from './iconShapes';

const VIEW_BOX = '0 0 24 24';
const STROKE_WIDTH = 2;

export interface PIconProps extends Omit<SvgProps, 'color'> {
  name: IconName;
  size?: number;
  color?: string;
  /** Fills the shape with the color; meant for shapes like `star`. */
  filled?: boolean;
}

export function PIcon({
  name,
  size = iconSize.lg,
  color = colors.textPrimary,
  filled = false,
  ...rest
}: PIconProps) {
  return (
    <Svg
      {...rest}
      width={size}
      height={size}
      viewBox={VIEW_BOX}
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICON_SHAPES[name].map((shape) => (
        <Path key={shape} d={shape} />
      ))}
    </Svg>
  );
}

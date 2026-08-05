import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  GestureResponderEvent,
  TouchableOpacity,
} from 'react-native';

import { colors, spacing, textPresets, typography } from '../theme';

export interface PLinkProps {
  text?: string;
  link: string;
  variant?: 'primary' | 'secondary';
  align?: 'left' | 'center' | 'right';
  onPress: (event: GestureResponderEvent) => void;
}

export const PLink = ({
  text = '',
  link,
  variant = 'primary',
  align = 'left',
  onPress,
}: PLinkProps) => {
  const isPrimary = variant === 'primary';
  const alignStyle = alignMap[align];
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      hitSlop={{
        top: spacing.sm,
        bottom: spacing.sm,
        left: spacing.lg,
        right: spacing.lg,
      }}
    >
      <View style={[styles.container, { alignItems: alignStyle }]}>
        <Text style={[styles.baseText, { textAlign: align }]}>
          {text && <Text style={{ color: colors.textPrimary }}>{text} </Text>}
          <Text
            style={{ color: isPrimary ? colors.primary : colors.textSecondary }}
          >
            {link}
          </Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const alignMap = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
} as const;

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    ...textPresets.caption,
  },
});

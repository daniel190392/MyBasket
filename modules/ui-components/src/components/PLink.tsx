import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  GestureResponderEvent,
} from 'react-native';

import { colors, spacing, textPresets, opacity } from '../theme';

type LinkAlign = 'left' | 'center' | 'right';

const ALIGN_ITEMS = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
} as const;

const HIT_SLOP = {
  top: spacing.sm,
  bottom: spacing.sm,
  left: spacing.lg,
  right: spacing.lg,
} as const;

export interface PLinkProps extends Omit<TouchableOpacityProps, 'children'> {
  text?: string;
  link: string;
  variant?: 'primary' | 'secondary';
  align?: LinkAlign;
  onPress: (event: GestureResponderEvent) => void;
}

export function PLink({
  text,
  link,
  variant = 'primary',
  align = 'left',
  onPress,
  ...rest
}: PLinkProps) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      activeOpacity={opacity.pressed}
      hitSlop={HIT_SLOP}
      {...rest}
      onPress={onPress}
    >
      <View style={[styles.container, { alignItems: ALIGN_ITEMS[align] }]}>
        <Text style={[styles.baseText, { textAlign: align }]}>
          {Boolean(text) && <Text style={styles.text}>{text} </Text>}
          <Text style={isPrimary ? styles.primaryLink : styles.secondaryLink}>
            {link}
          </Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
    justifyContent: 'center',
  },
  baseText: {
    ...textPresets.caption,
  },
  text: {
    color: colors.textPrimary,
  },
  primaryLink: {
    color: colors.primary,
  },
  secondaryLink: {
    color: colors.textSecondary,
  },
});

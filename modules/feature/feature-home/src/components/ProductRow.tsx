import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  PBadge,
  PCard,
  PIcon,
  borderRadius,
  colors,
  iconSize,
  spacing,
  textPresets,
  typography,
} from 'ui-components';

import type { BadgeVariant } from 'ui-components';

const INITIAL_TILE_SIZE = 56;

type ProductRowProps = {
  name: string;
  quantityLabel: string;
  expirationLabel: string;
  expirationVariant: BadgeVariant;
  isFavorite: boolean;
  favoriteAccessibilityLabel: string;
  onFavoritePress: () => void;
};

export function ProductRow({
  name,
  quantityLabel,
  expirationLabel,
  expirationVariant,
  isFavorite,
  favoriteAccessibilityLabel,
  onFavoritePress,
}: ProductRowProps) {
  return (
    <PCard>
      <View style={styles.row}>
        <View style={styles.initialTile}>
          <Text style={styles.initial}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.quantity}>{quantityLabel}</Text>
          <PBadge title={expirationLabel} variant={expirationVariant} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={favoriteAccessibilityLabel}
          accessibilityState={{ selected: isFavorite }}
          hitSlop={spacing.md}
          onPress={onFavoritePress}
        >
          <PIcon
            name="star"
            size={iconSize.lg}
            color={isFavorite ? colors.primary : colors.textMuted}
            filled={isFavorite}
          />
        </Pressable>
      </View>
    </PCard>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  initialTile: {
    width: INITIAL_TILE_SIZE,
    height: INITIAL_TILE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.softHighlight,
  },
  initial: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  details: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    ...textPresets.title,
  },
  quantity: {
    ...textPresets.caption,
  },
});

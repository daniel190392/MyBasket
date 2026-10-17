import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  PBadge,
  PCard,
  PIconButton,
  PLink,
  borderRadius,
  colors,
  opacity,
  spacing,
  textPresets,
  typography,
} from 'ui-components';

import type { BadgeVariant } from 'ui-components';

const INITIAL_TILE_SIZE = 56;
const COUNT_MIN_WIDTH = 32;

type EditableProductRowProps = {
  name: string;
  count: number;
  // What the count counts, for example "botellas · 1 l".
  unitLabel: string;
  isCountChanged: boolean;
  isRemoved: boolean;
  // Shown instead of the stepper while the product is marked for removal.
  removedQuantityLabel: string;
  expirationLabel: string;
  expirationVariant: BadgeVariant;
  removedBadgeLabel: string;
  undoRemovalLabel: string;
  decreaseAccessibilityLabel: string;
  increaseAccessibilityLabel: string;
  removeAccessibilityLabel: string;
  onDecreasePress: () => void;
  onIncreasePress: () => void;
  onRemovalTogglePress: () => void;
};

export function EditableProductRow({
  name,
  count,
  unitLabel,
  isCountChanged,
  isRemoved,
  removedQuantityLabel,
  expirationLabel,
  expirationVariant,
  removedBadgeLabel,
  undoRemovalLabel,
  decreaseAccessibilityLabel,
  increaseAccessibilityLabel,
  removeAccessibilityLabel,
  onDecreasePress,
  onIncreasePress,
  onRemovalTogglePress,
}: EditableProductRowProps) {
  return (
    <PCard>
      <View style={styles.row}>
        <View style={[styles.content, isRemoved && styles.removedContent]}>
          <View style={styles.initialTile}>
            <Text style={styles.initial}>{name.charAt(0).toUpperCase()}</Text>
          </View>

          <View style={styles.details}>
            <Text style={[styles.name, isRemoved && styles.removedName]}>
              {name}
            </Text>
            {isRemoved ? (
              <>
                <Text style={styles.unit}>{removedQuantityLabel}</Text>
                <PBadge title={removedBadgeLabel} variant="informative" />
              </>
            ) : (
              <>
                <View style={styles.stepper}>
                  <PIconButton
                    icon="minus"
                    accessibilityLabel={decreaseAccessibilityLabel}
                    onPress={onDecreasePress}
                  />
                  <Text
                    style={[styles.count, isCountChanged && styles.changed]}
                  >
                    {count}
                  </Text>
                  <PIconButton
                    icon="plus"
                    accessibilityLabel={increaseAccessibilityLabel}
                    onPress={onIncreasePress}
                  />
                </View>
                <Text style={styles.unit}>{unitLabel}</Text>
                <PBadge title={expirationLabel} variant={expirationVariant} />
              </>
            )}
          </View>
        </View>

        {isRemoved ? (
          <PLink link={undoRemovalLabel} onPress={onRemovalTogglePress} />
        ) : (
          <PIconButton
            icon="trash"
            accessibilityLabel={removeAccessibilityLabel}
            onPress={onRemovalTogglePress}
          />
        )}
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
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  // Only the product dims; the undo link must stay easy to see.
  removedContent: {
    opacity: opacity.muted,
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
  removedName: {
    textDecorationLine: 'line-through',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  count: {
    minWidth: COUNT_MIN_WIDTH,
    textAlign: 'center',
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  // A count that differs from the saved one is pending until saved.
  changed: {
    color: colors.primary,
  },
  unit: {
    ...textPresets.caption,
  },
});

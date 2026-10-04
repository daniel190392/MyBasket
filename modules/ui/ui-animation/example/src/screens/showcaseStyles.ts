import { StyleSheet } from 'react-native';

import { borderRadius, colors, spacing, typography } from 'ui-components';

export const showcaseStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xxl,
  },
  group: {
    gap: spacing.xxl,
  },
  fill: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  box: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  boxText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});

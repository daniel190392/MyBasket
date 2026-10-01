import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from 'ui-components';

interface ShowcaseSectionProps {
  title: string;
  children: React.ReactNode;
}

export const ShowcaseSection = ({ title, children }: ShowcaseSectionProps) => (
  <View style={styles.section}>
    <Text style={styles.title}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, textPresets } from 'ui-components';

type SectionHeaderProps = {
  title: string;
  countLabel: string;
};

export function SectionHeader({ title, countLabel }: SectionHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.count}>{countLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    ...textPresets.title,
  },
  count: {
    ...textPresets.caption,
  },
});

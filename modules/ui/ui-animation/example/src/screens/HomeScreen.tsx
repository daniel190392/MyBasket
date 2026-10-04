import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import {
  borderRadius,
  colors,
  shadows,
  spacing,
  typography,
} from 'ui-components';

import { MFadeIn, MPressableScale } from '../../../src';

import { CATALOG_ITEMS } from '../navigation/catalogConfig';
import { HomeScreenProps } from '../navigation/types';

const STAGGER_DELAY = 80;

export const HomeScreen = ({ navigation }: HomeScreenProps) => (
  <FlatList
    style={styles.list}
    data={CATALOG_ITEMS}
    keyExtractor={(item) => item.id}
    contentContainerStyle={styles.content}
    renderItem={({ item, index }) => (
      <MFadeIn delay={index * STAGGER_DELAY}>
        <MPressableScale
          style={styles.card}
          onPress={() => navigation.navigate(item.screenName)}
        >
          <View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </MPressableScale>
      </MFadeIn>
    )}
  />
);

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  description: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});

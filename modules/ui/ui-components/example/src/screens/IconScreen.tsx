import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  PIcon,
  IconName,
  colors,
  iconSize,
  spacing,
  textPresets,
} from '../../../src';

import { ShowcaseSection } from './ShowcaseSection';
import { showcaseStyles as styles } from './showcaseStyles';

const ICON_NAMES: IconName[] = [
  'search',
  'filter',
  'plus',
  'menu',
  'logout',
  'minus',
  'more',
  'edit',
  'trash',
  'star',
  'store',
];

export const IconScreen = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <ShowcaseSection title="Catalog">
      <View style={local.row}>
        {ICON_NAMES.map((name) => (
          <View key={name} style={local.item}>
            <PIcon name={name} />
            <Text style={local.label}>{name}</Text>
          </View>
        ))}
      </View>
    </ShowcaseSection>
    <ShowcaseSection title="Sizes">
      <View style={local.row}>
        <PIcon name="star" size={iconSize.sm} />
        <PIcon name="star" size={iconSize.md} />
        <PIcon name="star" size={iconSize.lg} />
      </View>
    </ShowcaseSection>
    <ShowcaseSection title="Colors">
      <View style={local.row}>
        <PIcon name="store" color={colors.primary} />
        <PIcon name="store" color={colors.secondary} />
        <PIcon name="store" color={colors.textMuted} />
      </View>
    </ShowcaseSection>
    <ShowcaseSection title="Filled">
      <View style={local.row}>
        <PIcon name="star" color={colors.primary} />
        <PIcon name="star" color={colors.primary} filled />
      </View>
    </ShowcaseSection>
  </ScrollView>
);

const local = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  item: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: textPresets.caption,
});

import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PChip, spacing } from '../../../src';

import { ShowcaseSection } from './ShowcaseSection';
import { showcaseStyles as styles } from './showcaseStyles';

const FILTERS = ['Todos', 'Alimentos', 'Bebidas', 'Lácteos'];

const noop = () => undefined;

export const ChipScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ShowcaseSection title="Single selection">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={local.row}>
            {FILTERS.map((filter) => (
              <PChip
                key={filter}
                label={filter}
                isSelected={filter === selectedFilter}
                onPress={() => setSelectedFilter(filter)}
              />
            ))}
          </View>
        </ScrollView>
      </ShowcaseSection>
      <ShowcaseSection title="Selected">
        <PChip label="Selected" isSelected onPress={noop} />
      </ShowcaseSection>
      <ShowcaseSection title="Unselected">
        <PChip label="Unselected" onPress={noop} />
      </ShowcaseSection>
      <ShowcaseSection title="Disabled">
        <PChip label="Disabled" isDisabled onPress={noop} />
      </ShowcaseSection>
    </ScrollView>
  );
};

const local = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});

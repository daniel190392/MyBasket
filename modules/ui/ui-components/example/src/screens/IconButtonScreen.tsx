import React from 'react';
import { ScrollView } from 'react-native';

import { PIconButton } from '../../../src';

import { ShowcaseSection } from './ShowcaseSection';
import { showcaseStyles as styles } from './showcaseStyles';

const noop = () => undefined;

export const IconButtonScreen = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <ShowcaseSection title="Default">
      <PIconButton icon="filter" accessibilityLabel="Filter" onPress={noop} />
    </ShowcaseSection>
    <ShowcaseSection title="Disabled">
      <PIconButton
        icon="filter"
        accessibilityLabel="Filter"
        isDisabled
        onPress={noop}
      />
    </ShowcaseSection>
  </ScrollView>
);

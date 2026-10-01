import React from 'react';
import { ScrollView } from 'react-native';

import { PButton } from '../../../src';

import { ShowcaseSection } from './ShowcaseSection';
import { showcaseStyles as styles } from './showcaseStyles';

const ignorePress = () => {};

export const ButtonScreen = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <ShowcaseSection title="Primary Button">
      <PButton title="Ok" onPress={ignorePress} />
    </ShowcaseSection>
    <ShowcaseSection title="Secondary Button">
      <PButton title="Cancel" variant="secondary" onPress={ignorePress} />
    </ShowcaseSection>
    <ShowcaseSection title="Loading Button">
      <PButton title="Ok" onPress={ignorePress} isLoading />
    </ShowcaseSection>
    <ShowcaseSection title="Disabled Button">
      <PButton title="Ok" onPress={ignorePress} isDisabled />
    </ShowcaseSection>
  </ScrollView>
);

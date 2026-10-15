import React from 'react';
import { ScrollView } from 'react-native';

import { PFab } from '../../../src';

import { ShowcaseSection } from './ShowcaseSection';
import { showcaseStyles as styles } from './showcaseStyles';

const noop = () => undefined;

export const FabScreen = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <ShowcaseSection title="With icon">
      <PFab label="Añadir" icon="plus" onPress={noop} />
    </ShowcaseSection>
    <ShowcaseSection title="Label only">
      <PFab label="Añadir" onPress={noop} />
    </ShowcaseSection>
    <ShowcaseSection title="Disabled">
      <PFab label="Añadir" icon="plus" isDisabled onPress={noop} />
    </ShowcaseSection>
  </ScrollView>
);

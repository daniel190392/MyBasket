import React from 'react';
import { ScrollView } from 'react-native';

import { PBadge } from '../../../src';

import { ShowcaseSection } from './ShowcaseSection';
import { showcaseStyles as styles } from './showcaseStyles';

export const BadgeScreen = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <ShowcaseSection title="Important">
      <PBadge title="Important" />
    </ShowcaseSection>
    <ShowcaseSection title="Warning">
      <PBadge title="Warning" variant="warning" />
    </ShowcaseSection>
    <ShowcaseSection title="Informative">
      <PBadge title="Informative" variant="informative" />
    </ShowcaseSection>
  </ScrollView>
);

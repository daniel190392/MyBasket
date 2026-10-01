import React from 'react';
import { ScrollView, View } from 'react-native';

import { MSkeleton, borderRadius } from '../../../src';

import { ShowcaseSection } from './ShowcaseSection';
import { showcaseStyles as styles } from './showcaseStyles';

const AVATAR_SIZE = 56;
const TITLE_WIDTH = '60%';

export const SkeletonScreen = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <ShowcaseSection title="Line">
      <MSkeleton />
    </ShowcaseSection>

    <ShowcaseSection title="Custom size">
      <MSkeleton width={TITLE_WIDTH} />
    </ShowcaseSection>

    <ShowcaseSection title="List item">
      <View style={styles.row}>
        <MSkeleton
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          radius={borderRadius.full}
        />
        <View style={styles.fill}>
          <MSkeleton />
        </View>
      </View>
    </ShowcaseSection>
  </ScrollView>
);

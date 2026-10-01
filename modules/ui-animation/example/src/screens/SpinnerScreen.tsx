import React from 'react';
import { ScrollView, View } from 'react-native';

import { MSpinner, colors, palette } from '../../../src';

import { ShowcaseSection } from './ShowcaseSection';
import { showcaseStyles as styles } from './showcaseStyles';

const LARGE_SIZE = 48;

export const SpinnerScreen = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <ShowcaseSection title="Default">
      <MSpinner />
    </ShowcaseSection>

    <ShowcaseSection title="Sizes and colors">
      <View style={styles.row}>
        <MSpinner size={LARGE_SIZE} />
        <MSpinner size={LARGE_SIZE} color={palette.primary800} />
        <MSpinner size={LARGE_SIZE} color={colors.textPrimary} />
      </View>
    </ShowcaseSection>
  </ScrollView>
);

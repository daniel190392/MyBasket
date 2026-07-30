import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

import { PButton } from '../../../src';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from '../../../src';

import { SHOWCASE_DATA, ComponentSection } from '../data/showcaseItems';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface ComponentItem {
  id: string;
  title: string;
  description: string;
  targetScreen: keyof RootStackParamList;
  status: 'Ready' | 'In Progress' | 'Planned';
}

export const ButtonScreen = () => {
  const renderItem = ({ item }: { item: ComponentSection }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.itemTitle}>{item.title}</Text>

        {item.id === '1' && (
          <PButton
            title="Guardar alimento"
            onPress={() => console.log('Primary')}
          />
        )}
        {item.id === '2' && (
          <PButton
            title="Cancelar"
            variant="secondary"
            onPress={() => console.log('Secondary')}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>PantryHub Component System</Text>
      <FlatList
        data={SHOWCASE_DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    fontWeight: typography.weights.bold,
    padding: spacing.lg,
    color: colors.textPrimary,
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  itemTitle: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  separator: {
    height: spacing.md,
  },
});

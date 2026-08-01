import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PBadge, BadgeVariant, PCard } from '../../../src';
import { textPresets, colors, spacing, typography } from '../../../src';

import { CATALOG_ITEMS } from '../navigation/catalogConfig';
import { HomeScreenProps } from '../navigation/types';

type CatalogItem = (typeof CATALOG_ITEMS)[number];

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    return CATALOG_ITEMS.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const getBadgetVariant = (status: CatalogItem['status']): BadgeVariant => {
    switch (status) {
      case 'Ready':
        return 'important';
      case 'In Progress':
        return 'warning';
      case 'Planned':
        return 'informative';
    }
  };

  const renderItem = ({ item }: { item: CatalogItem }) => {
    const badgeVariant = getBadgetVariant(item.status);
    const isClickable = item.status !== 'Planned';

    return (
      <PCard
        isClickable={isClickable}
        onPress={() => navigation.navigate(item.screenName as any)}
      >
        <View style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Text style={textPresets.title}>{item.title}</Text>
            <PBadge title={item.status} variant={badgeVariant} />
          </View>
          <Text style={textPresets.caption}>{item.description}</Text>
        </View>
      </PCard>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar componente..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron componentes</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  searchInput: {
    height: 40,
    backgroundColor: colors.background,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  listContainer: {
    padding: spacing.lg,
  },
  cardContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  separator: {
    height: spacing.md,
  },
  emptyContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...textPresets.caption,
  },
});

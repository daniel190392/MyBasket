import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';

import {
  PBadge,
  BadgeVariant,
  PCard,
  PInput,
  borderWidth,
  textPresets,
  colors,
  spacing,
} from '../../../src';

import { CATALOG_ITEMS } from '../navigation/catalogConfig';
import { HomeScreenProps } from '../navigation/types';

import { SearchIcon } from './SearchIcon';

type CatalogItem = (typeof CATALOG_ITEMS)[number];

const STATUS_VARIANTS: Record<CatalogItem['status'], BadgeVariant> = {
  Ready: 'important',
};

const ItemSeparator = () => <View style={styles.separator} />;

const EmptyList = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>No components found</Text>
  </View>
);

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = CATALOG_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: CatalogItem }) => (
    <PCard onPress={() => navigation.navigate(item.screenName)}>
      <View style={styles.cardContent}>
        <View style={styles.titleRow}>
          <Text style={textPresets.title}>{item.title}</Text>
          <PBadge title={item.status} variant={STATUS_VARIANTS[item.status]} />
        </View>
        <Text style={textPresets.caption}>{item.description}</Text>
      </View>
    </PCard>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <PInput
          containerStyle={styles.searchInput}
          placeholder="Search component..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          leftIcon={<SearchIcon />}
        />
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={EmptyList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: borderWidth.thin,
    borderBottomColor: colors.surface,
  },
  searchInput: {
    marginBottom: 0,
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

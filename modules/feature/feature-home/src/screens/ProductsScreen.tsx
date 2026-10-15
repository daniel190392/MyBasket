import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  PButton,
  PChip,
  PFab,
  PIcon,
  PIconButton,
  PInput,
  controlHeight,
  colors,
  iconSize,
  spacing,
  textPresets,
  typography,
} from 'ui-components';

import { ProductRow } from '../components/ProductRow';
import { filterProducts, groupByExpiration } from '../domain/productList';
import { useProducts } from '../state/ProductsProvider';
import {
  expirationBadgeVariant,
  expirationLabel,
  quantityLabel,
} from './productLabels';
import { categoryLabels, homeStrings, productCountLabel } from './strings';

import type { Product, ProductCategory } from '../domain/product';

type ProductsScreenProps = {
  onAddProductPress: () => void;
};

type ProductSection = {
  title: string;
  data: Product[];
};

const CATEGORIES = Object.keys(categoryLabels) as ProductCategory[];
// Keeps the last row above the floating button.
const FAB_CLEARANCE = controlHeight.md + spacing.lg * 2;

export function ProductsScreen({ onAddProductPress }: ProductsScreenProps) {
  const { status, products, reload, toggleFavorite } = useProducts();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ProductCategory | null>(null);

  // The date is read once per data change, not inside the rules, so the
  // domain functions stay pure and the list does not shift while scrolling.
  const now = useMemo(() => new Date(), [products]);

  const sections = useMemo<ProductSection[]>(() => {
    const { expiringSoon, rest } = groupByExpiration(
      filterProducts(products, { query, category }),
      now
    );
    return [
      { title: homeStrings.expiringSoonSection, data: expiringSoon },
      { title: homeStrings.restSection, data: rest },
    ].filter((section) => section.data.length > 0);
  }, [products, query, category, now]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{homeStrings.productsTitle}</Text>
        {/* What the filter does is still undecided, so it stays disabled. */}
        <PIconButton
          icon="filter"
          accessibilityLabel={homeStrings.filterButtonLabel}
          isDisabled
          onPress={() => undefined}
        />
      </View>

      <View style={styles.search}>
        <PInput
          placeholder={homeStrings.searchPlaceholder}
          value={query}
          onChangeText={setQuery}
          leftIcon={
            <PIcon name="search" size={iconSize.md} color={colors.textMuted} />
          }
          containerStyle={styles.searchInput}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chips}
      >
        <PChip
          label={homeStrings.allCategories}
          isSelected={category === null}
          onPress={() => setCategory(null)}
        />
        {CATEGORIES.map((candidate) => (
          <PChip
            key={candidate}
            label={categoryLabels[candidate]}
            isSelected={category === candidate}
            onPress={() => setCategory(candidate)}
          />
        ))}
      </ScrollView>

      {status === 'loading' && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {status === 'error' && (
        <View style={styles.centered}>
          <Text style={styles.message}>{homeStrings.loadError}</Text>
          <PButton
            title={homeStrings.retry}
            variant="secondary"
            onPress={reload}
          />
        </View>
      )}

      {status === 'ready' && (
        <SectionList
          sections={sections}
          keyExtractor={(product) => product.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={ItemSeparator}
          ListEmptyComponent={
            <Text style={styles.message}>{homeStrings.noResults}</Text>
          }
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionCount}>
                {productCountLabel(section.data.length)}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <ProductRow
              name={item.name}
              quantityLabel={quantityLabel(item.quantity)}
              expirationLabel={expirationLabel(item, now)}
              expirationVariant={expirationBadgeVariant(item, now)}
              isFavorite={item.isFavorite}
              favoriteAccessibilityLabel={
                item.isFavorite
                  ? homeStrings.removeFavoriteLabel
                  : homeStrings.addFavoriteLabel
              }
              onFavoritePress={() => toggleFavorite(item.id)}
            />
          )}
        />
      )}

      <View style={styles.fab}>
        <PFab
          label={homeStrings.addProductButton}
          icon="plus"
          onPress={onAddProductPress}
        />
      </View>
    </SafeAreaView>
  );
}

function ItemSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  search: {
    paddingHorizontal: spacing.lg,
  },
  searchInput: {
    marginBottom: spacing.sm,
  },
  chipsScroll: {
    flexGrow: 0,
  },
  chips: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: FAB_CLEARANCE,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    ...textPresets.title,
  },
  sectionCount: {
    ...textPresets.caption,
  },
  separator: {
    height: spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  message: {
    ...textPresets.caption,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
  },
});

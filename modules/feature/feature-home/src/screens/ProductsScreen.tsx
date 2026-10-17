import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
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
  PMenu,
  PInput,
  controlHeight,
  colors,
  iconSize,
  spacing,
  textPresets,
  typography,
} from 'ui-components';

import { ProductRow } from '../components/ProductRow';
import { SectionHeader } from '../components/SectionHeader';
import { filterProducts, groupByExpiration } from '../domain/productList';
import { useProducts } from '../state/ProductsProvider';
import {
  expirationBadgeVariant,
  expirationLabel,
  quantityLabel,
} from './productLabels';
import {
  categoryLabels,
  editProductsStrings,
  homeStrings,
  loadErrorMessage,
  productCountLabel,
} from './strings';

import type { Product, ProductCategory } from '../domain/product';

type ProductsScreenProps = {
  onAddProductPress: () => void;
  onEditProductsPress: () => void;
  // The menu belongs to the host: without this event there is no menu button.
  onMenuPress?: () => void;
};

type ProductSection = {
  title: string;
  data: Product[];
};

const CATEGORIES = Object.keys(categoryLabels) as ProductCategory[];
// Keeps the last row above the floating button.
const FAB_CLEARANCE = controlHeight.md + spacing.lg * 2;

export function ProductsScreen({
  onAddProductPress,
  onEditProductsPress,
  onMenuPress,
}: ProductsScreenProps) {
  const {
    status,
    errorCode,
    products,
    reload,
    refresh,
    isRefreshing,
    hasRefreshFailed,
    toggleFavorite,
  } = useProducts();
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
        {onMenuPress && (
          <PIconButton
            icon="menu"
            accessibilityLabel={homeStrings.menuButtonLabel}
            onPress={onMenuPress}
          />
        )}
        <Text style={styles.title}>{homeStrings.productsTitle}</Text>
        <View style={styles.headerSpacer} />
        <PMenu
          items={[
            {
              label: editProductsStrings.editMenuItem,
              icon: 'edit',
              onPress: onEditProductsPress,
              isDisabled: products.length === 0,
            },
          ]}
          renderTrigger={(open) => (
            <PIconButton
              icon="more"
              accessibilityLabel={editProductsStrings.moreOptionsLabel}
              style={styles.moreButton}
              onPress={open}
            />
          )}
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
          <Text style={styles.message}>{loadErrorMessage(errorCode)}</Text>
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
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            hasRefreshFailed ? (
              <Text style={styles.refreshError}>
                {homeStrings.refreshError}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            products.length === 0 ? (
              <View style={styles.emptyPantry}>
                <Text style={styles.emptyTitle}>
                  {homeStrings.emptyPantryTitle}
                </Text>
                <Text style={styles.message}>
                  {homeStrings.emptyPantryCaption}
                </Text>
                <PButton
                  title={homeStrings.addFirstProductButton}
                  icon="plus"
                  onPress={onAddProductPress}
                />
              </View>
            ) : (
              <Text style={styles.message}>{homeStrings.noResults}</Text>
            )
          }
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <SectionHeader
              title={section.title}
              countLabel={productCountLabel(section.data.length)}
            />
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
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerSpacer: {
    flex: 1,
  },
  // The menu trigger is quiet: the action it opens is not frequent.
  moreButton: {
    backgroundColor: 'transparent',
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
  refreshError: {
    ...textPresets.caption,
    color: colors.error,
    textAlign: 'center',
    paddingBottom: spacing.sm,
  },
  emptyPantry: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
  emptyTitle: {
    ...textPresets.title,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
  },
});

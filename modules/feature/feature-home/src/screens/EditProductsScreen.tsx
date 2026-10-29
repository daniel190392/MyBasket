import React, { useEffect, useMemo, useRef } from 'react';
import { Alert, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import { PButton, colors, spacing, textPresets } from 'ui-components';

import { LoadMoreFooter } from '../components/LoadMoreFooter';
import { EditableProductRow } from '../components/EditableProductRow';
import { SectionHeader } from '../components/SectionHeader';
import { currentCount, isCountChanged, isRemoved } from '../domain/editChanges';
import { groupByExpiration } from '../domain/productList';
import { useProducts } from '../state/ProductsProvider';
import {
  expirationBadgeVariant,
  expirationLabel,
  quantityLabel,
  quantityUnitLabel,
} from './productLabels';
import {
  editProductsStrings,
  homeStrings,
  productCountLabel,
  saveErrorMessage,
} from './strings';
import { useEditProducts } from './useEditProducts';

import type { Product } from '../domain/product';

// The next page is requested when the end is this many screens away.
const END_REACHED_THRESHOLD = 0.5;

type EditProductsScreenProps = {
  onSaved: () => void;
};

type ProductSection = {
  title: string;
  data: Product[];
};

export function EditProductsScreen({ onSaved }: EditProductsScreenProps) {
  const navigation = useNavigation();
  const { products, isLoadingMore, hasLoadMoreFailed, loadMore } =
    useProducts();
  const edit = useEditProducts();

  // Read once per data change, like the list, so the rules stay pure.
  const now = useMemo(() => new Date(), [products]);
  const sections = useMemo<ProductSection[]>(() => {
    const { expiringSoon, rest } = groupByExpiration(products, now);
    return [
      { title: homeStrings.expiringSoonSection, data: expiringSoon },
      { title: homeStrings.restSection, data: rest },
    ].filter((section) => section.data.length > 0);
  }, [products, now]);

  // Leaving with edits that were not saved asks first.
  usePreventRemove(edit.changeCount > 0 && !edit.isSaved, ({ data }) => {
    Alert.alert(
      editProductsStrings.discardTitle,
      editProductsStrings.discardMessage,
      [
        { text: editProductsStrings.keepEditing, style: 'cancel' },
        {
          text: editProductsStrings.discard,
          style: 'destructive',
          onPress: () => navigation.dispatch(data.action),
        },
      ]
    );
  });

  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;
  useEffect(() => {
    if (edit.isSaved) onSavedRef.current();
  }, [edit.isSaved]);

  return (
    <View style={styles.screen}>
      <SectionList
        sections={sections}
        keyExtractor={(product) => product.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={ItemSeparator}
        stickySectionHeadersEnabled={false}
        onEndReached={hasLoadMoreFailed ? undefined : loadMore}
        onEndReachedThreshold={END_REACHED_THRESHOLD}
        ListFooterComponent={
          <LoadMoreFooter
            isLoading={isLoadingMore}
            hasFailed={hasLoadMoreFailed}
            onRetryPress={loadMore}
          />
        }
        renderSectionHeader={({ section }) => (
          <SectionHeader
            title={section.title}
            countLabel={productCountLabel(section.data.length)}
          />
        )}
        renderItem={({ item }) => {
          const count = currentCount(edit.changes, item);
          return (
            <EditableProductRow
              name={item.name}
              count={count}
              unitLabel={quantityUnitLabel(item.quantity, count)}
              isCountChanged={isCountChanged(edit.changes, item.id)}
              isRemoved={isRemoved(edit.changes, item.id)}
              removedQuantityLabel={quantityLabel(item.quantity)}
              expirationLabel={expirationLabel(item, now)}
              expirationVariant={expirationBadgeVariant(item, now)}
              removedBadgeLabel={editProductsStrings.willBeRemoved}
              undoRemovalLabel={editProductsStrings.undoRemoval}
              decreaseAccessibilityLabel={editProductsStrings.decreaseLabel(
                item.name
              )}
              increaseAccessibilityLabel={editProductsStrings.increaseLabel(
                item.name
              )}
              removeAccessibilityLabel={editProductsStrings.removeLabel(
                item.name
              )}
              onDecreasePress={() => edit.changeProductCount(item, count - 1)}
              onIncreasePress={() => edit.changeProductCount(item, count + 1)}
              onRemovalTogglePress={() => edit.toggleProductRemoval(item.id)}
            />
          );
        }}
      />

      <SafeAreaView edges={['bottom']} style={styles.saveBar}>
        {edit.saveErrorCode && (
          <Text style={styles.saveError}>
            {saveErrorMessage(edit.saveErrorCode)}
          </Text>
        )}
        <PButton
          title={editProductsStrings.save(edit.changeCount)}
          isDisabled={edit.changeCount === 0}
          isLoading={edit.isSaving}
          onPress={edit.save}
        />
      </SafeAreaView>
    </View>
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
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  separator: {
    height: spacing.sm,
  },
  saveBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  saveError: {
    ...textPresets.caption,
    color: colors.error,
    textAlign: 'center',
  },
});

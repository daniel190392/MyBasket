import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  PButton,
  PChip,
  PInput,
  colors,
  spacing,
  textPresets,
} from 'ui-components';

import {
  addProductStrings,
  categoryLabels,
  quantityUnitLabels,
} from './strings';
import { useAddProductForm } from './useAddProductForm';

import type { ProductCategory } from '../domain/product';
import type { QuantityUnitOption } from '../domain/productForm';

type AddProductScreenProps = {
  onProductAdded: () => void;
};

const CATEGORIES = Object.keys(categoryLabels) as ProductCategory[];
const QUANTITY_UNITS = Object.keys(quantityUnitLabels) as QuantityUnitOption[];

export function AddProductScreen({ onProductAdded }: AddProductScreenProps) {
  const { values, errors, isSubmitting, hasSubmitFailed, setValue, submit } =
    useAddProductForm(onProductAdded);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.sectionLabel}>{addProductStrings.categoryLabel}</Text>
      <View style={styles.chips}>
        {CATEGORIES.map((category) => (
          <PChip
            key={category}
            label={categoryLabels[category]}
            isSelected={values.category === category}
            onPress={() => setValue('category', category)}
          />
        ))}
      </View>

      <PInput
        label={addProductStrings.nameLabel}
        placeholder={addProductStrings.namePlaceholder}
        value={values.name}
        onChangeText={(text) => setValue('name', text)}
        error={errors.name ? addProductStrings.nameError : undefined}
      />

      <PInput
        label={addProductStrings.quantityLabel}
        placeholder={addProductStrings.quantityPlaceholder}
        keyboardType="decimal-pad"
        value={values.quantityText}
        onChangeText={(text) => setValue('quantityText', text)}
        error={errors.quantity ? addProductStrings.quantityError : undefined}
      />

      <Text style={styles.sectionLabel}>{addProductStrings.unitLabel}</Text>
      <View style={styles.chips}>
        {QUANTITY_UNITS.map((unit) => (
          <PChip
            key={unit}
            label={quantityUnitLabels[unit]}
            isSelected={values.quantityUnit === unit}
            onPress={() => setValue('quantityUnit', unit)}
          />
        ))}
      </View>

      <PInput
        label={addProductStrings.expirationLabel}
        placeholder={addProductStrings.expirationPlaceholder}
        keyboardType="numbers-and-punctuation"
        value={values.expirationText}
        onChangeText={(text) => setValue('expirationText', text)}
        error={
          errors.expirationDate ? addProductStrings.expirationError : undefined
        }
      />

      {hasSubmitFailed && (
        <Text style={styles.submitError}>{addProductStrings.submitError}</Text>
      )}

      <PButton
        title={addProductStrings.submit}
        isLoading={isSubmitting}
        onPress={submit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  sectionLabel: {
    ...textPresets.subtitle,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  submitError: {
    ...textPresets.caption,
    color: colors.error,
  },
});

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
  contentUnitLabels,
  packagingLabels,
} from './strings';
import { useAddProductForm } from './useAddProductForm';

import type {
  MeasureUnit,
  Packaging,
  ProductCategory,
} from '../domain/product';

type AddProductScreenProps = {
  onProductAdded: () => void;
};

const CATEGORIES = Object.keys(categoryLabels) as ProductCategory[];
const PACKAGINGS = Object.keys(packagingLabels) as Packaging[];
const CONTENT_UNITS = Object.keys(contentUnitLabels) as MeasureUnit[];
// Keeps the submit button clear of the screen edge when the form scrolls.
const BOTTOM_CLEARANCE = spacing.xxl * 2;

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
        label={addProductStrings.countLabel}
        placeholder={addProductStrings.countPlaceholder}
        keyboardType="number-pad"
        value={values.countText}
        onChangeText={(text) => setValue('countText', text)}
        error={errors.count ? addProductStrings.countError : undefined}
      />

      <Text style={styles.sectionLabel}>
        {addProductStrings.packagingLabel}
      </Text>
      <View style={styles.chips}>
        {PACKAGINGS.map((packaging) => (
          <PChip
            key={packaging}
            label={packagingLabels[packaging].chip}
            isSelected={values.packaging === packaging}
            onPress={() =>
              setValue(
                'packaging',
                values.packaging === packaging ? null : packaging
              )
            }
          />
        ))}
      </View>

      <PInput
        label={addProductStrings.contentLabel}
        placeholder={addProductStrings.contentPlaceholder}
        keyboardType="decimal-pad"
        value={values.contentSizeText}
        onChangeText={(text) => setValue('contentSizeText', text)}
        error={errors.content ? addProductStrings.contentError : undefined}
      />
      <View style={styles.chips}>
        {CONTENT_UNITS.map((unit) => (
          <PChip
            key={unit}
            label={contentUnitLabels[unit]}
            isSelected={values.contentUnit === unit}
            onPress={() =>
              setValue('contentUnit', values.contentUnit === unit ? null : unit)
            }
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
      <Text style={styles.requiredFieldsNote}>
        {addProductStrings.requiredFieldsNote}
      </Text>
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
    paddingBottom: BOTTOM_CLEARANCE,
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
  requiredFieldsNote: {
    ...textPresets.caption,
    textAlign: 'center',
  },
  submitError: {
    ...textPresets.caption,
    color: colors.error,
  },
});

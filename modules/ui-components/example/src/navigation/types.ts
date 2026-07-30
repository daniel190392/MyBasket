import { StackScreenProps } from '@react-navigation/stack';

import { CATALOG_ITEMS } from './catalogConfig';

export type CatalogScreenNames = (typeof CATALOG_ITEMS)[number]['screenName'];

export type RootStackParamList = {
  Home: undefined;
} & {
  [K in CatalogScreenNames]: undefined;
};

export type ScreenProps<T extends keyof RootStackParamList> = StackScreenProps<
  RootStackParamList,
  T
>;

export type HomeScreenProps = ScreenProps<'Home'>;
export type ButtonScreenProps = ScreenProps<'ButtonScreen'>;

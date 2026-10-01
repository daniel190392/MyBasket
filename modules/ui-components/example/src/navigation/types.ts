import { StackScreenProps } from '@react-navigation/stack';

import { CATALOG_ITEMS } from './catalogConfig';

export type CatalogScreenName = (typeof CATALOG_ITEMS)[number]['screenName'];

export type RootStackParamList = {
  Home: undefined;
} & {
  [K in CatalogScreenName]: undefined;
};

export type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;

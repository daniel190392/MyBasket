import type { NavigatorScreenParams } from '@react-navigation/native';

export type HomeTabParamList = {
  Products: undefined;
  Favorites: undefined;
};

export type HomeStackParamList = {
  Tabs: NavigatorScreenParams<HomeTabParamList>;
  AddProduct: undefined;
};

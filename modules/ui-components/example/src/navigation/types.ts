import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  ButtonScreen: undefined;
};

export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Home'
>;
export type ButtonScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ButtonScreen'
>;

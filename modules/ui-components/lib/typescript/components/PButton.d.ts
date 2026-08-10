import React from 'react';
import { GestureResponderEvent } from 'react-native';
export interface PButtonProps {
    title: string;
    onPress: (event: GestureResponderEvent) => void;
    variant?: 'primary' | 'secondary';
    isLoading?: boolean;
    isDisabled?: boolean;
}
export default function PButton({ title, onPress, variant, isLoading, isDisabled, }: PButtonProps): React.JSX.Element;

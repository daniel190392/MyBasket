import React from 'react';
import { GestureResponderEvent } from 'react-native';
export interface PCardProps {
    children: React.ReactNode;
    onPress?: (event: GestureResponderEvent) => void;
    isClickable?: boolean;
}
export declare function PCard({ children, onPress, isClickable }: PCardProps): React.JSX.Element;

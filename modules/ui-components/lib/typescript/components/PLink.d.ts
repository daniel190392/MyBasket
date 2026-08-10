import React from 'react';
import { GestureResponderEvent } from 'react-native';
export interface PLinkProps {
    text?: string;
    link: string;
    variant?: 'primary' | 'secondary';
    align?: 'left' | 'center' | 'right';
    onPress: (event: GestureResponderEvent) => void;
}
export declare const PLink: ({ text, link, variant, align, onPress, }: PLinkProps) => React.JSX.Element;

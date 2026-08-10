import React from 'react';
import { TextInputProps, ViewStyle, TextStyle } from 'react-native';
import type { ReactNode } from 'react';
export interface PInputProps extends Omit<TextInputProps, 'style'> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    disabled?: boolean;
}
export declare const PInput: ({ label, error, helperText, leftIcon, rightIcon, containerStyle, inputStyle, onFocus, onBlur, disabled, placeholderTextColor, ...rest }: PInputProps) => React.JSX.Element;

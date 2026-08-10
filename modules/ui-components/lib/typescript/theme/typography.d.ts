export declare const typography: {
    readonly sizes: {
        readonly xs: 12;
        readonly sm: 14;
        readonly md: 16;
        readonly lg: 18;
        readonly xl: 20;
        readonly xxl: 24;
        readonly '3xl': 28;
        readonly '4xl': 32;
        readonly '5xl': 36;
        readonly '6xl': 40;
        readonly '7xl': 44;
        readonly '8xl': 48;
    };
    readonly weights: {
        readonly regular: "400";
        readonly medium: "500";
        readonly bold: "700";
    };
};
export type FontSize = keyof typeof typography.sizes;
export declare const spacing: {
    readonly xs: 4;
    readonly sm: 8;
    readonly md: 12;
    readonly lg: 16;
    readonly xl: 20;
    readonly xxl: 24;
};

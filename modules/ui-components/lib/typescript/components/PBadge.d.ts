import React from 'react';
export type BadgeVariant = 'important' | 'warning' | 'informative';
export interface PBadgeProps {
    title: string;
    variant?: BadgeVariant;
}
export default function PBadge({ title, variant }: PBadgeProps): React.JSX.Element;

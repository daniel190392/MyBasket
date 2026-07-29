export interface ComponentSection {
  id: string;
  title: string;
  category: 'Buttons' | 'Inputs' | 'Cards';
}

export const SHOWCASE_DATA: ComponentSection[] = [
  { id: '1', title: 'Primary Button', category: 'Buttons' },
  { id: '2', title: 'Secondary Button', category: 'Buttons' },
  { id: '3', title: 'Disabled Button', category: 'Buttons' },
];

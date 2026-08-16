/**
 * StreetCraft Design-Token Theme Engine
 * Enforces the StreetCraft Modernity Constitution & Brand Theme Boundary
 */

export type ThemeId = 'paper' | 'paper-dark' | 'high-contrast';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  description: string;
  colorPreview: {
    page: string;
    surface: string;
    ink: string;
    primary: string;
  };
}

export interface BusinessBrandTheme {
  primaryColor?: string;
  accentColor?: string;
  displayFont?: string;
  businessName?: string;
  logoUrl?: string;
}

export const AVAILABLE_THEMES: ThemeOption[] = [
  {
    id: 'paper',
    name: 'StreetCraft Paper (Default)',
    description: 'Warm paper, dark ink, evergreen, and subtle terracotta.',
    colorPreview: {
      page: '#F7F5EF',
      surface: '#FBFAF6',
      ink: '#171714',
      primary: '#176B4D',
    },
  },
  {
    id: 'paper-dark',
    name: 'Paper Dark',
    description: 'Warm charcoal paper and light ink for nighttime reading.',
    colorPreview: {
      page: '#191814',
      surface: '#232119',
      ink: '#F3EFE5',
      primary: '#4E9B76',
    },
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Maximum contrast conforming to WCAG AAA accessibility standard.',
    colorPreview: {
      page: '#FFFFFF',
      surface: '#FFFFFF',
      ink: '#000000',
      primary: '#0A5C36',
    },
  },
];

/**
 * Validates that a theme ID is supported by the contract
 */
export function isValidTheme(theme: string): theme is ThemeId {
  return AVAILABLE_THEMES.some((t) => t.id === theme);
}

/**
 * Safely applies business brand token overrides to CSS custom properties
 * without breaking structural spacing, accessibility, or interaction boundaries.
 */
export function applyBrandTheme(brand: BusinessBrandTheme | null) {
  const root = document.documentElement;
  if (!brand) {
    root.style.removeProperty('--brand-primary');
    root.style.removeProperty('--brand-accent');
    root.style.removeProperty('--brand-font-display');
    return;
  }

  if (brand.primaryColor && /^#[0-9A-F]{6}$/i.test(brand.primaryColor)) {
    root.style.setProperty('--color-primary', brand.primaryColor);
  }
  if (brand.accentColor && /^#[0-9A-F]{6}$/i.test(brand.accentColor)) {
    root.style.setProperty('--color-accent', brand.accentColor);
  }
  if (brand.displayFont) {
    root.style.setProperty('--font-display', brand.displayFont);
  }
}

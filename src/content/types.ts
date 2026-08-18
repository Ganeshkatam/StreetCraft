export interface EditorialMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
}

export interface EditorialMetric {
  value: string;
  label: string;
  sublabel: string;
}

export interface EditorialCta {
  primary: {
    label: string;
    href: string;
  };
  secondary: {
    label: string;
    href: string;
  };
}

export interface CopyAnatomyItem {
  badge: string;
  label: string;
  text: string;
  note: string;
}

export interface CopyAnatomyContent {
  eyebrow: string;
  title: string;
  description: string;
  previewTitle: string;
  previewType: 'google' | 'instagram' | 'whatsapp' | 'print' | 'recipe';
  items: CopyAnatomyItem[];
}

export interface CapabilityContent {
  tag: string;
  title: string;
  description: string;
  bulletPoints: string[];
}

export interface TouchpointChannelCoordination {
  channel: 'Google Business' | 'Instagram' | 'WhatsApp' | 'In-Store Print';
  role: string;
  outputDescription: string;
}

export interface TouchpointSynergyContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  channels: TouchpointChannelCoordination[];
}

export interface PlaybookStep {
  step: number;
  trigger: string;
  action: string;
  outcome: string;
}

export interface ConversionContent {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
}

export interface TouchpointEditorialContent {
  category: 'CUSTOMER TOUCHPOINT';
  metadata: EditorialMetadata;
  eyebrow: string;
  title: string;
  tagline: string;
  description: string;
  metrics: EditorialMetric[];
  heroCta: EditorialCta;
  anatomy: CopyAnatomyContent;
  capabilities: CapabilityContent[];
  synergy: TouchpointSynergyContent;
  playbook: PlaybookStep[];
  closingCta: ConversionContent;
}

export interface SolutionEditorialContent {
  category: 'BUSINESS SOLUTION';
  metadata: EditorialMetadata;
  eyebrow: string;
  title: string;
  tagline: string;
  description: string;
  metrics: EditorialMetric[];
  heroCta: EditorialCta;
  anatomy: CopyAnatomyContent;
  capabilities: CapabilityContent[];
  synergy?: TouchpointSynergyContent;
  playbook: PlaybookStep[];
  closingCta: ConversionContent;
}

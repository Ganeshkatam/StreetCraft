import React from 'react';
import { PublicPageShell } from '../../../components/public/PublicPageShell';
import { EditorialHero } from '../../../components/public/EditorialHero';
import { MetricStrip } from '../../../components/public/MetricStrip';
import { CopyAnatomy } from '../../../components/public/CopyAnatomy';
import { FeatureGrid } from '../../../components/public/FeatureGrid';
import { StorePlaybook } from '../../../components/public/StorePlaybook';
import { ConversionLaunchpad } from '../../../components/public/ConversionLaunchpad';
import type { SolutionEditorialContent } from '../../../content/types';

interface RetailBoutiquesViewProps {
  content: SolutionEditorialContent;
}

export function RetailBoutiquesView({ content }: RetailBoutiquesViewProps) {
  return (
    <PublicPageShell>
      <EditorialHero
        category={content.category}
        eyebrow={content.eyebrow}
        title={content.title}
        tagline={content.tagline}
        description={content.description}
        heroCta={content.heroCta}
      />
      <MetricStrip metrics={content.metrics} />
      <CopyAnatomy content={content.anatomy} />
      <FeatureGrid
        eyebrow="RETAIL BOUTIQUE SPECIALIZATION"
        title="Engineered for Inventory Drops & Footfall Blitzes"
        capabilities={content.capabilities}
      />
      <StorePlaybook
        eyebrow="RETAIL OPERATING WORKFLOW"
        title="From Unboxing Fresh Stock to Busy Checkout Counters"
        subtitle="Step-by-step execution to accelerate inventory turnover."
        steps={content.playbook}
      />
      <ConversionLaunchpad content={content.closingCta} />
    </PublicPageShell>
  );
}

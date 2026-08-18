import React from 'react';
import { PublicPageShell } from '../../../components/public/PublicPageShell';
import { EditorialHero } from '../../../components/public/EditorialHero';
import { MetricStrip } from '../../../components/public/MetricStrip';
import { CopyAnatomy } from '../../../components/public/CopyAnatomy';
import { FeatureGrid } from '../../../components/public/FeatureGrid';
import { TouchpointSystem } from '../../../components/public/TouchpointSystem';
import { StorePlaybook } from '../../../components/public/StorePlaybook';
import { ConversionLaunchpad } from '../../../components/public/ConversionLaunchpad';
import type { TouchpointEditorialContent } from '../../../content/types';

interface InStorePrintViewProps {
  content: TouchpointEditorialContent;
}

export function InStorePrintView({ content }: InStorePrintViewProps) {
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
        eyebrow="COUNTERTOP ARCHITECTURE"
        title="Engineered for Point-of-Sale Conversion"
        capabilities={content.capabilities}
      />
      <TouchpointSystem content={content.synergy} />
      <StorePlaybook
        eyebrow="IN-STORE WORKFLOW"
        title="From Print Export to Counter Upsell"
        subtitle="How printed touchpoints eliminate cashier confusion and lift table spend."
        steps={content.playbook}
      />
      <ConversionLaunchpad content={content.closingCta} />
    </PublicPageShell>
  );
}

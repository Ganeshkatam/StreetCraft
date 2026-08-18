import React from 'react';
import { PublicPageShell } from '../../../components/public/PublicPageShell';
import { EditorialHero } from '../../../components/public/EditorialHero';
import { MetricStrip } from '../../../components/public/MetricStrip';
import { CopyAnatomy } from '../../../components/public/CopyAnatomy';
import { FeatureGrid } from '../../../components/public/FeatureGrid';
import { StorePlaybook } from '../../../components/public/StorePlaybook';
import { ConversionLaunchpad } from '../../../components/public/ConversionLaunchpad';
import type { SolutionEditorialContent } from '../../../content/types';

interface CafesBakeriesViewProps {
  content: SolutionEditorialContent;
}

export function CafesBakeriesView({ content }: CafesBakeriesViewProps) {
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
        eyebrow="CAFE & BAKERY SPECIALIZATION"
        title="Engineered for Daily Baking & Brew Rhythms"
        capabilities={content.capabilities}
      />
      <StorePlaybook
        eyebrow="CAFE OPERATING WORKFLOW"
        title="How an Afternoon Slowdown Becomes a Coffee Rush"
        subtitle="Step-by-step execution from oven timer to register payment."
        steps={content.playbook}
      />
      <ConversionLaunchpad content={content.closingCta} />
    </PublicPageShell>
  );
}

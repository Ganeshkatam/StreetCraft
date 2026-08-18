import React from 'react';
import { PublicPageShell } from '../../../components/public/PublicPageShell';
import { EditorialHero } from '../../../components/public/EditorialHero';
import { MetricStrip } from '../../../components/public/MetricStrip';
import { CopyAnatomy } from '../../../components/public/CopyAnatomy';
import { FeatureGrid } from '../../../components/public/FeatureGrid';
import { StorePlaybook } from '../../../components/public/StorePlaybook';
import { ConversionLaunchpad } from '../../../components/public/ConversionLaunchpad';
import type { SolutionEditorialContent } from '../../../content/types';

interface RestaurantsFoodViewProps {
  content: SolutionEditorialContent;
}

export function RestaurantsFoodView({ content }: RestaurantsFoodViewProps) {
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
        eyebrow="DINING SPECIALIZATION"
        title="Engineered for Restaurant & Bistro Floor Operations"
        capabilities={content.capabilities}
      />
      <StorePlaybook
        eyebrow="RESTAURANT OPERATING WORKFLOW"
        title="From Slow Tuesday to Packed Dining Service"
        subtitle="Step-by-step execution to boost direct dine-in reservations."
        steps={content.playbook}
      />
      <ConversionLaunchpad content={content.closingCta} />
    </PublicPageShell>
  );
}

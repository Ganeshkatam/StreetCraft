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

interface GoogleBusinessViewProps {
  content: TouchpointEditorialContent;
}

export function GoogleBusinessView({ content }: GoogleBusinessViewProps) {
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
        eyebrow="SEARCH ARCHITECTURE"
        title="Engineered for High-Intent Local Searches"
        capabilities={content.capabilities}
      />
      <TouchpointSystem content={content.synergy} />
      <StorePlaybook
        eyebrow="LOCAL SEARCH WORKFLOW"
        title="From Search Query to Counter Check-In"
        subtitle="How Google Business updates convert high-intent neighbors in four simple steps."
        steps={content.playbook}
      />
      <ConversionLaunchpad content={content.closingCta} />
    </PublicPageShell>
  );
}

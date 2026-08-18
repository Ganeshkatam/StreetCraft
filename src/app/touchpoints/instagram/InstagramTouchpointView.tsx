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

interface InstagramTouchpointViewProps {
  content: TouchpointEditorialContent;
}

export function InstagramTouchpointView({ content }: InstagramTouchpointViewProps) {
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
        eyebrow="STORY & REEL FRAMEWORKS"
        title="Engineered for Neighborhood Social Feeds"
        capabilities={content.capabilities}
      />
      <TouchpointSystem content={content.synergy} />
      <StorePlaybook
        eyebrow="SOCIAL DISCOVERY WORKFLOW"
        title="From Video Reel Hook to Store Walk-In"
        subtitle="How Instagram frameworks guide staff to post in 60 seconds."
        steps={content.playbook}
      />
      <ConversionLaunchpad content={content.closingCta} />
    </PublicPageShell>
  );
}

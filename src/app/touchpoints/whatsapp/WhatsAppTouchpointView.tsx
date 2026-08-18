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

interface WhatsAppTouchpointViewProps {
  content: TouchpointEditorialContent;
}

export function WhatsAppTouchpointView({ content }: WhatsAppTouchpointViewProps) {
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
        eyebrow="DIRECT MESSAGING"
        title="Engineered for VIP Customer Conversion"
        capabilities={content.capabilities}
      />
      <TouchpointSystem content={content.synergy} />
      <StorePlaybook
        eyebrow="VIP ENGAGEMENT WORKFLOW"
        title="From WhatsApp Drop to Register Redemption"
        subtitle="How formatted broadcasts mobilize regular customers in minutes."
        steps={content.playbook}
      />
      <ConversionLaunchpad content={content.closingCta} />
    </PublicPageShell>
  );
}

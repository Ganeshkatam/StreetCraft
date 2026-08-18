import React from 'react';
import { PublicPageShell } from '../../../components/public/PublicPageShell';
import { EditorialHero } from '../../../components/public/EditorialHero';
import { MetricStrip } from '../../../components/public/MetricStrip';
import { CopyAnatomy } from '../../../components/public/CopyAnatomy';
import { FeatureGrid } from '../../../components/public/FeatureGrid';
import { StorePlaybook } from '../../../components/public/StorePlaybook';
import { ConversionLaunchpad } from '../../../components/public/ConversionLaunchpad';
import type { SolutionEditorialContent } from '../../../content/types';

interface SalonsStudiosViewProps {
  content: SolutionEditorialContent;
}

export function SalonsStudiosView({ content }: SalonsStudiosViewProps) {
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
        eyebrow="SALON & SPA SPECIALIZATION"
        title="Engineered for Appointment Books & Stylist Schedules"
        capabilities={content.capabilities}
      />
      <StorePlaybook
        eyebrow="SALON OPERATING WORKFLOW"
        title="From Midweek Gaps to Confirmed Appointments"
        subtitle="Step-by-step execution to maintain steady chair utilization all week."
        steps={content.playbook}
      />
      <ConversionLaunchpad content={content.closingCta} />
    </PublicPageShell>
  );
}

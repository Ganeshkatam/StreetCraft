/**
 * StreetCraft Campaign Generation Engine
 * Coordinates Deterministic Enrichment, Context Adaptation, Output Phrasing, and Zod Schema Validation.
 */

import {
  Campaign,
  CampaignType,
  CampaignObjective,
  GoogleBusinessOutput,
  InstagramOutput,
  WhatsAppOutput,
  PosterOutput,
  StructuredOffer,
  StructuredSchedule,
  CampaignGenerationInput,
} from '../types/campaign';
import { BusinessProfile } from '../types/business';
import { ValidationStatus } from '../types/common';
import { generateLocalTags } from './rules';
import { validateAllOutputs, sanitizeGoogleBusiness, sanitizeInstagram, sanitizeWhatsApp, sanitizePoster } from './validator';

export type { CampaignGenerationInput };

export interface GeneratedCampaignPack {
  campaignData: Omit<Campaign, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>;
  outputs: {
    googleBusiness: GoogleBusinessOutput;
    instagram: InstagramOutput;
    whatsapp: WhatsAppOutput;
    poster: PosterOutput;
  };
  validationStatus: ValidationStatus;
}

export function generateCampaignPack(
  profile: Partial<BusinessProfile> | BusinessProfile,
  input: CampaignGenerationInput
): GeneratedCampaignPack {
  const bizName = profile?.name || 'Our Store';
  const neighborhood = profile?.neighborhood?.trim() || '';
  const city = profile?.city?.trim() || '';
  const landmarks = profile?.landmarks?.trim() || '';
  const signatureItems = profile?.signatureItems?.trim() || '';
  const category = profile?.category?.trim() || 'Store';

  const {
    type,
    objective,
    audience = 'Customers and visitors',
    offer,
    schedule,
    customNotes = '',
  } = input;

  const locationParts = [neighborhood, landmarks ? `near ${landmarks}` : '', city].filter(Boolean);
  const locationText = locationParts.length > 0 ? locationParts.join(', ') : 'our store';
  const hoodHeader = neighborhood ? ` in ${neighborhood}` : '';
  const hoodCues = neighborhood ? `, ${neighborhood}` : '';
  const localTags = generateLocalTags(neighborhood, city, category);
  const timing = schedule?.timingLabel || 'Limited time';
  const offerText = offer.title || offer.description || 'Special promotion';
  const offerValue = offer.value || offerText;
  const offerSummary = offer.title && offer.value && offer.value !== offer.title ? `${offer.title} - ${offer.value}` : offerText;
  const sigText = signatureItems ? ` Featuring our signature ${signatureItems}.` : '';
  const termsText = offer.terms ? ` Terms: ${offer.terms}` : '';

  let googleRaw: Partial<GoogleBusinessOutput> = {};
  let instagramRaw: Partial<InstagramOutput> = {};
  let whatsappRaw: Partial<WhatsAppOutput> = {};
  let posterRaw: Partial<PosterOutput> = {};

  switch (type) {
    case 'WEEKDAY_BOOST':
      googleRaw = {
        headline: `Afternoon special at ${bizName}${hoodHeader}`,
        body: `${bizName} is offering ${offerText} during ${timing}.${sigText} Visit us at ${locationText}.${termsText}`,
        ctaType: 'Visit Us',
        ctaValue: 'https://streetcraft.local/visit',
        offerSummary: offerSummary.slice(0, 95),
      };
      instagramRaw = {
        hook: `Afternoon special now running at ${bizName}${hoodCues}.`,
        caption: `Take advantage of ${offerText} valid ${timing} at ${bizName}.\n\nDrop by our store at ${locationText}.${sigText}\n\n${offer.terms ? `Terms: ${offer.terms}` : 'Valid during specified hours.'}`,
        storyFrames: [
          `AFTERNOON SPECIAL / ${timing.toUpperCase()}`,
          `${offerValue.toUpperCase()}`,
          `At ${bizName}${hoodCues}`,
        ],
        reelHook: `Our afternoon promotion is live at ${bizName}${hoodCues}.`,
        localTags,
      };
      whatsappRaw = {
        broadcastMessage: `Hi from ${bizName}${hoodCues}! We are running a special: ${offerText} during ${timing}. Simply show this message at our counter to redeem.${termsText}`,
        cta: 'Show message at counter to redeem',
        quickReplyPreview: 'Claim Offer',
      };
      posterRaw = {
        headline: `AFTERNOON SPECIAL / ${timing.toUpperCase()}`,
        subheading: offerText,
        body: `${signatureItems ? `Featuring our signature ${signatureItems}. ` : ''}Available ${timing} at ${bizName}${hoodCues}.`,
        cta: 'Ask our counter team to redeem.',
      };
      break;

    case 'WEEKEND_MAGNET':
      googleRaw = {
        headline: `Weekend specials at ${bizName}${hoodHeader}`,
        body: `Join us at ${bizName}${hoodHeader} for ${offerText} during ${timing}.${sigText} Located at ${locationText}.${termsText}`,
        ctaType: 'Visit Us',
        ctaValue: 'https://streetcraft.local/book',
        offerSummary: offerSummary.slice(0, 95),
      };
      instagramRaw = {
        hook: `Weekend specials are live at ${bizName}${hoodCues}.`,
        caption: `Join us this weekend at ${bizName}.\n\nWe are offering ${offerText} during ${timing}${hoodHeader}.${sigText}\n\nVisit us at ${locationText}.${termsText}`,
        storyFrames: [
          `WEEKEND SPECIAL`,
          `${offerValue.toUpperCase()}`,
          `At ${bizName}${hoodCues}`,
        ],
        reelHook: `Plan your weekend visit to ${bizName}${hoodCues}.`,
        localTags,
      };
      whatsappRaw = {
        broadcastMessage: `Happy weekend from ${bizName}! Make the most of your weekend with our special offer: ${offerText}. Valid ${timing} at our store${hoodHeader}. Show this message at the counter to redeem!`,
        cta: 'Show message at counter to redeem',
        quickReplyPreview: 'Weekend Special',
      };
      posterRaw = {
        headline: 'WEEKEND SPECIAL',
        subheading: offerText,
        body: `${signatureItems ? `Featuring our signature ${signatureItems} at ` : 'Available at '}${bizName}${hoodCues}.`,
        cta: 'Available this weekend. Inquire at counter.',
      };
      break;

    case 'MENU_LAUNCH':
      googleRaw = {
        headline: `New arrival at ${bizName}${hoodHeader}`,
        body: `We are introducing a new addition at ${bizName}${hoodHeader}: ${customNotes || signatureItems || 'our latest specialty'}.\n\nEnjoy our launch offer: ${offerText}. Visit us at ${locationText}.${termsText}`,
        ctaType: 'Visit Us',
        ctaValue: 'https://streetcraft.local/menu',
        offerSummary: `New: ${offerSummary}`.slice(0, 95),
      };
      instagramRaw = {
        hook: `New addition just arrived at ${bizName}${hoodCues}.`,
        caption: `Introducing ${customNotes || signatureItems || 'our latest specialty'} at ${bizName}.\n\nTo celebrate, enjoy our launch offer: ${offerText} when you visit our store.\n\n${termsText}`,
        storyFrames: [
          `NEW ARRIVAL`,
          `${(customNotes || signatureItems || 'NEW SPECIAL').toUpperCase()}`,
          `${offerValue.toUpperCase()}`,
        ],
        reelHook: `Now serving our new ${customNotes || signatureItems || 'specialty'} at ${bizName}.`,
        localTags,
      };
      whatsappRaw = {
        broadcastMessage: `Exciting update from ${bizName}${hoodCues}! We just introduced: ${customNotes || signatureItems || 'our latest specialty'}. Enjoy our launch offer: ${offerText}. Show this message at our counter to redeem!`,
        cta: 'Show this message at counter',
        quickReplyPreview: 'New Special',
      };
      posterRaw = {
        headline: 'NEW ARRIVAL',
        subheading: `${customNotes || signatureItems || 'New Item'} — ${offerText}`,
        body: `Available now at ${bizName}${hoodCues}.`,
        cta: 'Ask our team at the counter.',
      };
      break;

    case 'FESTIVAL_SPECIAL':
      googleRaw = {
        headline: `Festive celebration at ${bizName}${hoodHeader}`,
        body: `Celebrate the festive season with ${bizName}${hoodHeader}.\n\nEnjoy our festive offer: ${offerText} valid ${timing}.${sigText} Visit us at ${locationText}.${termsText}`,
        ctaType: 'Visit Us',
        ctaValue: 'https://streetcraft.local/festive',
        offerSummary: `Festive: ${offerSummary}`.slice(0, 95),
      };
      instagramRaw = {
        hook: `Festive season specials at ${bizName}${hoodCues}.`,
        caption: `Celebrate the season with ${bizName}${hoodHeader}!\n\nWe are offering our festive special: ${offerText} valid ${timing}.\n\nVisit our store at ${locationText} to celebrate with us.`,
        storyFrames: [
          `FESTIVE SPECIAL`,
          `${offerValue.toUpperCase()}`,
          `At ${bizName}${hoodCues}`,
        ],
        reelHook: `Festive specials are now available at ${bizName}${hoodCues}.`,
        localTags,
      };
      whatsappRaw = {
        broadcastMessage: `Festive greetings from ${bizName}${hoodCues}! Celebrate the season with our special offer: ${offerText}. Valid ${timing}. Show this message at the counter to redeem!`,
        cta: 'Show message at counter',
        quickReplyPreview: 'Festive Offer',
      };
      posterRaw = {
        headline: 'FESTIVE SPECIAL',
        subheading: offerText,
        body: `${signatureItems ? `Featuring our signature ${signatureItems} at ` : 'Celebrating at '}${bizName}${hoodCues}.`,
        cta: 'Ask our counter team to redeem.',
      };
      break;

    case 'REVIEW_SPOTLIGHT':
      googleRaw = {
        headline: `Thank you from ${bizName}${hoodHeader}`,
        body: `To our customers and community${hoodHeader} — thank you for your continuous support.\n\nTo show our appreciation, enjoy ${offerText} on your next visit to ${bizName} at ${locationText}.${sigText}${termsText}`,
        ctaType: 'Visit Us',
        ctaValue: 'https://streetcraft.local/community',
        offerSummary: `Appreciation: ${offerSummary}`.slice(0, 95),
      };
      instagramRaw = {
        hook: `A note of appreciation to our customers from ${bizName}${hoodCues}.`,
        caption: `Thank you for making ${bizName} part of your routine${hoodHeader}.\n\nTo show our appreciation, enjoy our special treat: ${offerText} on your next visit.\n\nVisit our counter at ${locationText}!`,
        storyFrames: [
          `COMMUNITY APPRECIATION`,
          `${offerValue.toUpperCase()}`,
          `At ${bizName}${hoodCues}`,
        ],
        reelHook: `Thank you to our amazing customers at ${bizName}${hoodCues}.`,
        localTags,
      };
      whatsappRaw = {
        broadcastMessage: `Thank you for being part of the ${bizName} family${hoodHeader}! To show our appreciation, we are offering ${offerText} on your next visit. Mention this message at our counter to redeem.`,
        cta: 'Mention this message at counter',
        quickReplyPreview: 'Thank You Offer',
      };
      posterRaw = {
        headline: 'COMMUNITY APPRECIATION',
        subheading: offerText,
        body: `Thank you for supporting ${bizName}${hoodHeader}.${sigText}`,
        cta: 'Mention this offer at the counter to redeem.',
      };
      break;

    case 'WIN_BACK_REGULARS':
    default:
      googleRaw = {
        headline: `Welcome back to ${bizName}${hoodHeader}`,
        body: `We would love to welcome you back to ${bizName}${hoodHeader}. Enjoy our welcoming special: ${offerText}.${sigText} Visit us at ${locationText}.${timing ? ` Valid ${timing}.` : ''}${termsText}`,
        ctaType: 'Visit Us',
        ctaValue: 'https://streetcraft.local/welcome-back',
        offerSummary: `Welcome Back: ${offerSummary}`.slice(0, 95),
      };
      instagramRaw = {
        hook: `A special invitation to revisit ${bizName}${hoodCues}.`,
        caption: `Haven't stopped by ${bizName} in a while? We would love to see you again.\n\nEnjoy our welcoming special: ${offerText} on your next visit${hoodHeader}.\n\nVisit us at ${locationText}!`,
        storyFrames: [
          `WELCOME BACK`,
          `${offerValue.toUpperCase()}`,
          `At ${bizName}${hoodCues}`,
        ],
        reelHook: `We would love to welcome you back to ${bizName}${hoodCues}.`,
        localTags,
      };
      whatsappRaw = {
        broadcastMessage: `Hi from ${bizName}! We would love to welcome you back to our store${hoodHeader}. Enjoy our special welcoming treat: ${offerText}. Show this message on your next visit!`,
        cta: 'Show this message on your next visit',
        quickReplyPreview: 'Welcome Back',
      };
      posterRaw = {
        headline: 'WELCOME BACK SPECIAL',
        subheading: offerText,
        body: `Welcome back to ${bizName}${hoodCues}.${sigText}`,
        cta: 'Ask our counter team to redeem.',
      };
      break;
  }

  const googleBusiness = sanitizeGoogleBusiness(googleRaw, bizName);
  const instagram = sanitizeInstagram(instagramRaw, localTags);
  const whatsapp = sanitizeWhatsApp(whatsappRaw, bizName);
  const poster = sanitizePoster(posterRaw, bizName);

  const outputs = {
    googleBusiness,
    instagram,
    whatsapp,
    poster,
  };

  const validationReport = validateAllOutputs(outputs);
  const validationStatus: ValidationStatus = validationReport.isValid ? 'VALID' : 'REPAIRED';

  return {
    campaignData: {
      type,
      objective,
      audience,
      offer,
      schedule,
      status: 'ready',
      performanceNotes: '',
    },
    outputs,
    validationStatus,
  };
}

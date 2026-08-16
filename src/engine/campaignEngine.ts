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
} from '../types/campaign';
import { BusinessProfile } from '../types/business';
import { ValidationStatus } from '../types/common';
import { generateLocalTags } from './rules';
import { validateAllOutputs, sanitizeGoogleBusiness, sanitizeInstagram, sanitizeWhatsApp, sanitizePoster } from './validator';

export interface CampaignGenerationInput {
  type: CampaignType;
  objective: CampaignObjective;
  audience?: string;
  offer: StructuredOffer;
  schedule: StructuredSchedule;
  customNotes?: string;
}

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
  profile: BusinessProfile,
  input: CampaignGenerationInput
): GeneratedCampaignPack {
  const {
    name = 'Our Cafe',
    neighborhood = 'the neighborhood',
    city = 'City',
    landmarks = '',
    signatureItems = 'Fresh coffee and artisanal bakes',
    category = 'Cafe',
  } = profile;

  const {
    type,
    objective,
    audience = 'Local residents and professionals',
    offer,
    schedule,
    customNotes = '',
  } = input;

  const localCues = landmarks ? `${neighborhood} (near ${landmarks})` : neighborhood;
  const localTags = generateLocalTags(neighborhood, city, category);
  const timing = schedule.timingLabel || 'Limited time';
  const offerSummary = offer.title ? `${offer.title} - ${offer.value}` : offer.description;

  let googleRaw: Partial<GoogleBusinessOutput> = {};
  let instagramRaw: Partial<InstagramOutput> = {};
  let whatsappRaw: Partial<WhatsAppOutput> = {};
  let posterRaw: Partial<PosterOutput> = {};

  switch (type) {
    case 'WEEKDAY_BOOST':
      googleRaw = {
        headline: `Afternoon special at ${name} in ${neighborhood}`,
        body: `Looking for a productive workspace or a quiet coffee catchup in ${neighborhood}? ${name} is offering ${offer.title || offer.description} during ${timing}.\n\nEnjoy our signature ${signatureItems} in a relaxed setting with reliable Wi-Fi, air conditioning, and comfortable seating located at ${localCues}, ${city}. ${offer.terms ? `Terms: ${offer.terms}` : ''}`,
        ctaType: 'Visit Us',
        ctaValue: 'https://streetcraft.local/visit',
        offerSummary: offerSummary.slice(0, 95),
      };
      instagramRaw = {
        hook: `Your afternoon break in ${neighborhood} just found its new home.`,
        caption: `Quiet corners, fresh brews, and space to think.\n\nTake advantage of ${offer.title || offer.description} valid ${timing} at ${name}. Whether you are finishing up work or catching up with friends, our ${neighborhood} store has your table ready.\n\nTag someone who needs an afternoon reset.`,
        storyFrames: [
          `AFTERNOON RESET / ${timing.toUpperCase()}`,
          `${(offer.value || offer.title).toUpperCase()}`,
          `At ${name}, ${neighborhood}`,
        ],
        reelHook: `The quietest 3 PM workspace in ${neighborhood} that you probably did not know about.`,
        localTags,
      };
      whatsappRaw = {
        broadcastMessage: `Hi from ${name}, ${neighborhood}! Need a calm afternoon break or a change of workspace? We are running a special: ${offer.title || offer.description} during ${timing}. Simply show this message at the counter to redeem. See you soon!`,
        cta: 'Show message at counter to redeem',
        quickReplyPreview: 'Claim Offer',
      };
      posterRaw = {
        headline: `AFTERNOON PERKS / ${timing.toUpperCase()}`,
        subheading: offer.title || offer.description,
        body: `Enjoy our signature ${signatureItems}. Available ${timing} at ${name}, ${neighborhood}.`,
        cta: 'Ask our barista at the counter to redeem.',
      };
      break;

    case 'WEEKEND_MAGNET':
      googleRaw = {
        headline: `Weekend brunch & specials at ${name}, ${neighborhood}`,
        body: `Make your weekend unhurried at ${name}. Join us in ${neighborhood} for ${offer.title || offer.description} during ${timing}.\n\nFeaturing our freshly prepared ${signatureItems}. Outdoor and indoor seating available in ${city}.`,
        ctaType: 'Visit Us',
        ctaValue: 'https://streetcraft.local/book',
        offerSummary: offerSummary.slice(0, 95),
      };
      instagramRaw = {
        hook: `The weekend table you will want to wake up early for.`,
        caption: `Unwind this weekend at ${name}.\n\nWe are serving up ${offer.title || offer.description} all weekend long in ${neighborhood}. Pair it with our signature ${signatureItems} and take your time.\n\nWalk-ins and reservations welcome. Drop by early for the best window seats!`,
        storyFrames: [
          `WEEKEND SPECIAL TABLE`,
          `${(offer.value || offer.title).toUpperCase()}`,
          `Serving all weekend at ${name}, ${neighborhood}`,
        ],
        reelHook: `This is your official sign to plan a slow weekend brunch in ${neighborhood}.`,
        localTags,
      };
      whatsappRaw = {
        broadcastMessage: `Happy weekend from ${name}! Make your Saturday & Sunday special with our weekend treat: ${offer.title || offer.description}. Tables fill up fast, so drop by early or reply to reserve your spot!`,
        cta: 'Reply to reserve your table',
        quickReplyPreview: 'Reserve Table',
      };
      posterRaw = {
        headline: 'WEEKEND SPECIAL TABLE',
        subheading: offer.title || offer.description,
        body: `Handcrafted ${signatureItems} served fresh all weekend at ${name}, ${neighborhood}.`,
        cta: 'Available Saturday & Sunday. Inquire at counter.',
      };
      break;

    case 'MENU_LAUNCH':
      googleRaw = {
        headline: `New on the menu at ${name}, ${neighborhood}`,
        body: `We are excited to introduce a fresh addition to our menu at ${name} in ${neighborhood}: ${customNotes || signatureItems}.\n\nTry it this week with our launch offer: ${offer.title || offer.description}. Visit us at ${localCues}, ${city}.`,
        ctaType: 'Order Online',
        ctaValue: 'https://streetcraft.local/menu',
        offerSummary: `New Drop: ${offerSummary}`.slice(0, 95),
      };
      instagramRaw = {
        hook: `Something new just dropped on our counter in ${neighborhood}.`,
        caption: `Introducing our latest creation at ${name}: ${customNotes || signatureItems}.\n\nCrafted with fresh ingredients and attention to detail. To celebrate the launch, enjoy ${offer.title || offer.description} when you visit this week in ${neighborhood}.\n\nTell us in the comments what you think after your first taste!`,
        storyFrames: [
          `NEW MENU DROP`,
          `${(customNotes || signatureItems).toUpperCase()}`,
          `${(offer.value || offer.title).toUpperCase()}`,
        ],
        reelHook: `Behind the scenes of how we crafted our new ${customNotes || signatureItems}.`,
        localTags,
      };
      whatsappRaw = {
        broadcastMessage: `Exciting news from ${name}, ${neighborhood}! We just launched our newest special: ${customNotes || signatureItems}. As a loyal customer, enjoy our launch perk: ${offer.title || offer.description}. Show this text at the counter to redeem!`,
        cta: 'Show this message at counter',
        quickReplyPreview: 'Try New Special',
      };
      posterRaw = {
        headline: 'JUST ARRIVED ON THE MENU',
        subheading: `${customNotes || signatureItems} - ${offer.title || offer.description}`,
        body: `Crafted in small batches daily at ${name}, ${neighborhood}.`,
        cta: 'Ask for today’s fresh batch at the counter.',
      };
      break;

    case 'FESTIVAL_SPECIAL':
      googleRaw = {
        headline: `Festive celebrations & treats at ${name}, ${neighborhood}`,
        body: `Celebrate the festive season with handcrafted flavors at ${name} in ${neighborhood}.\n\nEnjoy our festive promotion: ${offer.title || offer.description} valid ${timing}. Perfect for family gatherings, gifting, and celebrations in ${city}.`,
        ctaType: 'Visit Us',
        ctaValue: 'https://streetcraft.local/festive',
        offerSummary: `Festive: ${offerSummary}`.slice(0, 95),
      };
      instagramRaw = {
        hook: `Festive moments are sweeter shared with the neighborhood.`,
        caption: `Celebrate the season with ${name} in ${neighborhood}!\n\nWe have prepared exclusive festive treats and our special promotion: ${offer.title || offer.description}.\n\nWhether you are gathering with loved ones or looking for handcrafted gifting boxes, stop by our ${neighborhood} store.`,
        storyFrames: [
          `FESTIVE SEASON SPECIAL`,
          `${(offer.title || offer.value).toUpperCase()}`,
          `Handcrafted at ${name}, ${neighborhood}`,
        ],
        reelHook: `Festive gift boxes and seasonal specials are now ready at ${name}.`,
        localTags,
      };
      whatsappRaw = {
        broadcastMessage: `Festive greetings from ${name}, ${neighborhood}! Celebrate the season with our special festive offer: ${offer.title || offer.description}. Valid ${timing}. We look forward to hosting you and your family!`,
        cta: 'Visit us or reply to pre-order',
        quickReplyPreview: 'Pre-order Hampers',
      };
      posterRaw = {
        headline: 'FESTIVE GATHERINGS SPECIAL',
        subheading: offer.title || offer.description,
        body: `Celebrate with handcrafted bakes and artisan roasts at ${name}, ${neighborhood}.`,
        cta: 'Ask our team about celebration boxes & table reservations.',
      };
      break;

    case 'REVIEW_SPOTLIGHT':
      googleRaw = {
        headline: `What our ${neighborhood} community is saying about ${name}`,
        body: `“The coffee and fresh bakes here are hands-down the best in ${neighborhood}!” — Thank you to our wonderful local community for your continuous support.\n\nCome experience our signature ${signatureItems} at ${name}. Enjoy ${offer.title || offer.description} on your next visit.`,
        ctaType: 'Visit Us',
        ctaValue: 'https://streetcraft.local/community',
        offerSummary: `Community: ${offerSummary}`.slice(0, 95),
      };
      instagramRaw = {
        hook: `Words like this keep our baristas smiling all day.`,
        caption: `“Our favorite spot in ${neighborhood} for great food and calm conversations.”\n\nThank you to our amazing regulars for making ${name} part of your daily routine. To say thanks, we are running ${offer.title || offer.description} this week.\n\nSave this post and drop by soon!`,
        storyFrames: [
          `COMMUNITY LOVE / ${neighborhood.toUpperCase()}`,
          `“OUR FAVORITE LOCAL SPOT”`,
          `${(offer.title || offer.value).toUpperCase()}`,
        ],
        reelHook: `Reading our favorite customer reviews of the week at ${name}.`,
        localTags,
      };
      whatsappRaw = {
        broadcastMessage: `Thank you for being part of the ${name} family in ${neighborhood}! To show our appreciation, we are offering ${offer.title || offer.description} on your next visit. Just mention this text at checkout.`,
        cta: 'Mention this message at checkout',
        quickReplyPreview: 'Thank You',
      };
      posterRaw = {
        headline: 'THANK YOU TO OUR COMMUNITY',
        subheading: offer.title || offer.description,
        body: `Proudly serving the neighborhood of ${neighborhood} with fresh ${signatureItems}.`,
        cta: 'Mention our community review at checkout.',
      };
      break;

    case 'WIN_BACK_REGULARS':
    default:
      googleRaw = {
        headline: `We have missed you at ${name}, ${neighborhood}`,
        body: `It has been a while! Come back to ${name} in ${neighborhood} and enjoy our welcoming treat: ${offer.title || offer.description}.\n\nRelax with your favorite ${signatureItems} at ${localCues}, ${city}. Valid ${timing}.`,
        ctaType: 'Visit Us',
        ctaValue: 'https://streetcraft.local/welcome-back',
        offerSummary: `Comeback: ${offerSummary}`.slice(0, 95),
      };
      instagramRaw = {
        hook: `Consider this your official sign to revisit your favorite table.`,
        caption: `Haven’t stopped by ${name} recently? We have fresh roasts, new seasonal bakes, and your favorite corner waiting in ${neighborhood}.\n\nEnjoy ${offer.title || offer.description} on your next visit.\n\nSee you soon!`,
        storyFrames: [
          `COME BACK & UNWIND`,
          `YOUR TABLE IS WAITING`,
          `${(offer.title || offer.value).toUpperCase()}`,
        ],
        reelHook: `A reminder of why your favorite corner at ${name} is the best spot to recharge.`,
        localTags,
      };
      whatsappRaw = {
        broadcastMessage: `Hi from ${name}! We noticed it’s been a while since your last visit to our ${neighborhood} outlet. We’d love to welcome you back with a special treat: ${offer.title || offer.description}. Show this message on your next visit!`,
        cta: 'Show this message on your next visit',
        quickReplyPreview: 'Welcome Back',
      };
      posterRaw = {
        headline: 'YOUR FAVORITE TABLE AWAITS',
        subheading: offer.title || offer.description,
        body: `Welcome back to ${name}, ${neighborhood}. Handcrafted ${signatureItems} fresh every morning.`,
        cta: 'Ask our team about your welcome back offer.',
      };
      break;
  }

  const googleBusiness = sanitizeGoogleBusiness(googleRaw, name);
  const instagram = sanitizeInstagram(instagramRaw, localTags);
  const whatsapp = sanitizeWhatsApp(whatsappRaw, name);
  const poster = sanitizePoster(posterRaw, name);

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

/**
 * StreetCraft Intelligence Brain
 *
 * Separation of Concerns:
 * - Brain: Decides (Context -> Opportunity -> Strategy -> Timing -> Reasoning -> Specification)
 * - Engine: Produces (Google, Instagram, WhatsApp, In-Store Poster)
 * - Validator: Proves (Channel constraints, character bounds, required tokens)
 * - RPC: Commits (Atomic DB persistence)
 */

export * from './context/index';
export * from './opportunity/index';
export * from './strategy/index';
export * from './generation/index';
export * from './validation/index';

import { Module } from "@nestjs/common";

/**
 * Bounded context C-11 — Billing & Subscription.
 *
 * Ansvar: Stripe-integration, Klarna, Swish, prenumerationsstatus,
 * grace period, webhook-hantering. Cachas i Redis med 60s TTL för
 * snabb behörighetskoll (systemdesign §03).
 *
 * Skarp implementering börjar i M0-30 (Stripe-integration) och fylls
 * på genom M0-31…M0-35.
 */
@Module({})
export class BillingModule {}

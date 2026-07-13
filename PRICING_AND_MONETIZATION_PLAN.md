# BoardSpell (WizClone) Pricing and monday Monetization Plan

## 1) Executive Decision

Use **feature-based pricing** (usage + feature gates), not seat-based.

Why:
- Your cost/value driver is usage events (AI matching, template generation, copy volume, monitoring), not seats.
- monday documentation explicitly supports feature-based plans for usage/feature limits.
- It fits your existing product behavior (copy limits, upgrade prompts, per-workspace settings).

## 2) Final Launch Pricing (Recommended)

Recommended billing structure for Marketplace submission:

| Plan | Monthly | Yearly | Copy Limit / Month | AI Smart Matching | AI Template Builder | Template Suggestions | Recommended For |
|---|---:|---:|---:|---|---|---|---|
| Free | $0 | $0 | 50 | Limited trial | No | No | Testing and initial validation |
| Starter | $19 | $190 | 500 | Yes | No | No | Small teams / freelancers |
| Pro | $49 | $490 | 2,500 | Yes | Yes (100 uses/month) | Yes | Growing teams (default recommended) |
| Business | $99 | $990 | 10,000 | Yes | Yes (500 uses/month) | Yes | Heavy workflow automation teams |
| Enterprise | Custom | Custom | Custom | Yes | Custom | Yes | Large accounts with advanced needs |

## 3) 14-Day Trial Strategy (First Install)

Goal: Every first-time install gets immediate value, then convert to paid quickly.

### Recommended model: Trial-first with mandatory upgrade
- On first install, grant a 14-day Pro trial.
- During trial, allow premium features with a safety cap:
   - Up to 300 copies total during trial
   - Up to 60 AI builder calls during trial
- At day 14:
   - If paid subscription exists, continue with paid entitlements.
   - If no paid subscription, block copy and AI actions until upgrade.
   - Keep read-only views available (settings, logs, templates view).
   - Always show upgrade CTA in app and installed-app prompts.

### Alternative model (only if you want broad top-of-funnel)
- Keep Free plan at 50 copies/month after trial ends.
- Use this only if install growth matters more than short-term conversion.

### monday compatibility note
- monday docs define 14 days as the default trial period and support manual trial extensions.
- Keep trial and plan flows aligned to monday-native billing and subscription lifecycle events.

### Automation and webhook enforcement policy
- Every successful copy event consumes quota, regardless of trigger source:
   - Manual UI action
   - Webhook-triggered automation
   - Scheduled/retry worker jobs
- Quota checks must run in the backend copy service before executing copy.
- Use idempotency keys for webhook events to avoid double counting on retries.
- Count only successful copy operations toward quota.

## 4) Entitlement Matrix (Server-Enforced)

Entitlements must be enforced server-side for all write operations.

| Capability | Free | Starter | Pro | Business | Enterprise |
|---|---|---|---|---|---|
| Monthly copy quota | 50 | 500 | 2,500 | 10,000 | Contract |
| AI matching | Limited | Full | Full | Full | Full |
| AI template builder | No | No | Yes | Yes (higher cap) | Contract |
| Template suggestions | No | No | Yes | Yes | Yes |
| Workspace/board targeting | Basic | Basic | Advanced | Advanced | Advanced |
| Activity log retention | Last 50 | Standard | Filtered + longer retention | Advanced | Contract |
| Support SLA | Standard | Basic | Priority | Priority | Dedicated |

## 5) monday Monetization Requirements Checklist

Use this checklist before Marketplace submission:

1. Submit app with monday monetization selected.
2. Create first pricing version in Developer Center (feature-based).
3. Define stable plan IDs (must remain case-consistent across versions).
4. Implement runtime subscription checks in backend.
5. Implement webhook handlers for subscription lifecycle events.
6. Enforce entitlements server-side (never frontend-only).
7. Handle renewals, cancellations, failed payments, and grace-period states.
8. Connect Payoneer and complete vendor onboarding.
9. Validate upgrade/downgrade and proration flows in test scenarios.

## 6) Technical Implementation Plan for This Codebase

Current app signals:
- UI has upgrade modal and plan messaging.
- API client already contains `plansApi.current()` endpoint.
- App currently hardcodes free plan in layout and does not yet consume live entitlements globally.

Implementation phases:

### Phase A - Data model and backend enforcement
1. Add subscription table keyed by monday account/workspace.
2. Add usage counters per billing period:
   - `copies_used`
   - `ai_match_calls`
   - `ai_builder_calls`
3. Add entitlement resolver middleware:
   - Input: `plan_id`, `is_trial`, `days_left`, `billing_period`
   - Output: allowed limits/features
4. Guard all copy and AI endpoints with entitlement checks.
5. Return explicit upgrade-required errors when limit exceeded.

### Phase B - Webhooks and lifecycle handling
1. Subscribe to monday monetization webhooks.
2. Persist subscription updates (created/changed/renewed/cancelled).
3. Track `is_trial`, `renewal_date`, `plan_id`, `pricing_version`.
4. Recompute entitlements immediately on webhook receipt.
5. Add idempotency and signature verification for webhook security.

### Phase C - Frontend integration
1. Replace hardcoded plan display with `plansApi.current()` data.
2. Show live usage bars (`used / monthly_limit`).
3. Add trial countdown badge and proactive upgrade nudges.
4. Trigger upgrade flow from limit-error responses.
5. Keep app usable in read-only mode when blocked.

### Phase D - Analytics and pricing optimization
1. Track conversion funnel:
   - install -> trial start -> first value event -> paywall -> paid conversion
2. Track plan-level gross margin proxy:
   - revenue minus AI/infra estimates
3. Review cohort performance monthly.
4. Use pricing versioning for future plan experiments (new users/free users only).

## 7) Financial Guardrails

Set explicit internal limits to preserve margin:
- Target blended gross margin > 75% for Starter/Pro.
- Trigger review if AI cost per paid workspace exceeds 25% of MRR.
- Alert when Business accounts approach 80% quota repeatedly (upsell to Enterprise).

## 8) Copy and Positioning for Marketplace

Core positioning:
- "BoardSpell automates subitem workflows with AI matching, instant cloning, and plan-safe usage controls."

Recommended emphasis:
- Time saved per team per month
- Reliability (fallback exact matching + logs)
- Governance (server-enforced limits, audit trail)
- Fast setup on monday boards/workspaces

## 9) Immediate Next Actions (2-week execution)

Week 1:
1. Finalize plan IDs and feature bullets for Developer Center submission.
2. Implement backend entitlement middleware and usage counters.
3. Implement 14-day trial state model on first install.
4. Wire webhook ingestion endpoint and persistence.

Week 2:
1. Connect frontend to live `plans/current` response and usage metrics.
2. Add trial countdown + upgrade prompts.
3. Run end-to-end billing state QA (trial, upgrade, downgrade, cancel, grace period).
4. Submit pricing version and update Marketplace listing content.

## 10) Plan IDs (Suggested)

Use stable, simple IDs:
- `free`
- `starter`
- `pro`
- `business`
- `enterprise`
- optional trial marker: `trial_pro_14d` (internal mapping if needed)

Keep casing and identifiers unchanged across future pricing versions.

## 11) Requirement Response (for monday submission form)

Pricing method selected:
- Feature-based pricing with monday native monetization

Required plan setup:
- 14-day trial: Yes
- Free plan available: Yes
- Paid tiers: Starter, Pro (recommended), Business, Enterprise

External monetization declaration:
- Not using external monetization for this app.
- If submitted as ISV with external billing, provide the public pricing page URL in the form field.

# Discovery Canvas Reference

## Canvas → PRD Section Mapping

The Discovery Canvas maps directly to the PRD template used by `prd-architect`. Each canvas section feeds one or more PRD sections:

| Discovery Canvas Section | PRD Section | Notes |
|--------------------------|-------------|-------|
| 1. Vision Statement | Executive Summary | Canvas vision becomes the 3-sentence problem/solution/outcome |
| 2. Problem Map | Current State Audit | Status quo → systems inventory; frustrations → friction points |
| 3. User Map | Feature Requirements (user types) | Each user type becomes a feature grouping lens |
| 4. User Flows | Feature Requirements (flows) | Each flow becomes trigger→action→result specs |
| 5. Feature Map | Feature Requirements (priorities) | P0/P1/P2 transfer directly |
| 6. Business Context | Business Model | Revenue, pricing, metrics map 1:1 |
| 7. Constraints | Technical Architecture | Stack, integrations, scale inform architecture decisions |
| 7. Constraints (compliance) | Migration Considerations | Legal/regulatory feeds migration and compliance sections |
| 8. Uncertainty Register | Open Questions | Uncertainties become PRD open questions with impact levels |
| 9. Assumptions Log | Open Questions | Unvalidated assumptions flagged in PRD |
| 10. Scope Decision | (PRD boundary) | Determines whether 1 or N PRDs are written |
| 11. Open Questions | Open Questions | Merged with uncertainties |
| 12. Next Steps | Project Phases | Next steps inform phase breakdown |

**Key principle:** The canvas captures WHAT WAS DISCOVERED. The PRD interprets it into WHAT WILL BE BUILT. Discovery is descriptive; PRD is prescriptive.

---

## Quality Criteria

Each canvas section must meet a minimum quality bar before the session ends:

### Section 1: Vision Statement
- One paragraph, no jargon
- Contains: WHAT it is, WHO it's for, WHY it matters
- A stranger could read it and understand the product

### Section 2: Problem Map
- Problem described WITHOUT referencing the solution
- At least one specific, quantified pain point
- Status quo workaround described concretely
- "Why now" has a real answer (not "because I want to")

### Section 3: User Map
- At least 2 distinct user types identified
- Primary user explicitly chosen
- Each user has: goal, frustration, trigger (not just demographics)
- Relationships between user types noted if relevant

### Section 4: User Flows
- Primary happy path has 4+ steps
- At least one error/edge case path documented
- Flows use concrete language ("clicks Submit" not "interacts with the system")
- Entry point (trigger) and exit point (outcome) are clear

### Section 5: Feature Map
- P0 has 3-6 features (not 1, not 15)
- Each feature has a clear user type and flow
- P0 vs P1 distinction is defensible (not arbitrary)
- No feature exists without a problem it solves (traceable to Section 2)

### Section 6: Business Context
- Revenue model stated (even if "not yet decided")
- At least one competitor named
- At least one success metric that is measurable

### Section 7: Constraints
- Timeline stated with what drives it
- Budget range stated (even approximately)
- Known tech constraints listed
- Compliance requirements checked (even if "none")

### Section 8: Uncertainty Register
- At least 3 uncertainties identified
- Each classified as Must Validate / Learn Post-Launch / Acceptable
- No uncertainty marked "Low" without justification

### Section 9: Assumptions Log
- At least 5 assumptions captured
- Each assumption is falsifiable (can be proven wrong)
- The most dangerous assumption is identified

---

## Worked Example

### Discovery Canvas: PetConnect

**Date:** 2026-02-15
**Participants:** Sarah Chen (Founder), AI Discovery Agent
**Complexity:** Standard

#### 1. Vision Statement
PetConnect is a neighborhood-level pet sitting marketplace that matches pet owners with trusted, nearby sitters for short-notice care (same-day to 3-day). Unlike Rover or Wag, it focuses on hyperlocal trust — sitters within walking distance, verified by shared community connections, with real-time GPS check-ins during walks.

#### 2. Problem Map
**Problem Statement:**
Pet owners in urban areas need short-notice care (vet appointments, last-minute travel, emergencies) but don't trust strangers from large platforms with their pets. They currently rely on neighbors and friends, which is unreliable and doesn't scale.

**Status Quo:**
Owners text 3-4 friends hoping someone is available. Success rate ~40%. When friends aren't available, they either cancel plans or use Rover (which feels impersonal and requires advance booking).

**Why Now:**
Remote work has increased pet ownership 30% since 2020, but return-to-office mandates mean owners now need regular daytime care. The gap between "pet count" and "available care" is widening.

**Cost of Inaction:**
Owners cancel plans, skip vet appointments, or leave pets alone longer than comfortable. 23% of new pet owners report "care logistics" as their #1 stress source.

#### 3. User Map
**Pet Owner (Primary)**
- **Role:** Urban professional, 25-45, has 1-2 pets
- **Goal:** Find a trusted sitter within 2 hours for same-day needs
- **Frustration:** Can't find reliable short-notice care without texting 5 people
- **Trigger:** Gets a last-minute meeting, vet opens a cancellation slot, friend invites them to dinner

**Pet Sitter**
- **Role:** Neighbor who loves animals, wants flexible side income
- **Goal:** Earn $20-40/hr on their own schedule with nearby pets
- **Frustration:** Rover takes 20% commission and sends them 30 min away
- **Trigger:** Has free afternoon, opens app to see if anyone nearby needs help

**Community Admin** (future)
- **Role:** Neighborhood association or building manager
- **Goal:** Facilitate trusted pet care network within their community
- **Frustration:** No tool to organize informal pet sitting arrangements

#### 4. User Flows
**Flow: Owner Books Same-Day Sitter**
1. TRIGGER: Owner gets last-minute dinner invitation, needs sitter in 2 hours
2. Opens app → sees 3 available sitters within 0.5 miles
3. Taps sitter profile → sees shared connections (same building, mutual friend)
4. Sends request with time, pet details, special instructions
5. Sitter accepts within 10 min (push notification)
6. Sitter arrives → owner does quick handoff → sitter checks in via app
7. Owner gets GPS ping during walk + photo update
8. Sitter completes → owner gets summary + auto-payment
9. OUTCOME: Owner enjoyed dinner, pet was happy, sitter earned $35

**Flow: Sitter Cancels Last-Minute**
1. Sitter cancels 30 min before arrival
2. App auto-notifies 2 backup sitters in the area
3. If backup accepts → owner gets notification with new sitter profile
4. If no backup in 15 min → owner gets notification: "No sitter available. Here are your options: [cancel/extend search radius/post to community]"
5. OUTCOME: Owner has clear options, not left hanging

#### 5. Feature Map
**P0 — Must Have**
| Feature | User | Trigger → Action → Outcome |
|---------|------|---------------------------|
| Hyperlocal matching | Owner | Needs sitter → sees nearby options ranked by trust signals → books one |
| Real-time availability | Sitter | Has free time → toggles available → gets matched to nearby requests |
| Trust signals | Both | Viewing profile → sees shared connections, reviews, verification → feels confident |
| In-session updates | Owner | Pet is with sitter → gets GPS + photos → feels at ease |
| Instant payment | Sitter | Completes session → gets paid immediately → stays motivated |

**P1 — Should Have**
| Feature | User | Trigger → Action → Outcome |
|---------|------|---------------------------|
| Recurring bookings | Owner | Needs weekly Tuesday care → sets schedule → auto-matched |
| Sitter ratings & reviews | Both | Session ends → rates experience → builds trust data |
| Pet profiles | Owner | Adds pet → records allergies, behavior, vet info → sitter is prepared |

**P2 — Nice to Have**
| Feature | User | Trigger → Action → Outcome |
|---------|------|---------------------------|
| Community boards | Admin | Creates neighborhood group → members see local sitters first |
| Emergency vet integration | Owner | Pet has emergency → app shows nearest vet + notifies owner |

#### 6. Business Context
- **Revenue Model:** 12% service fee on bookings (split: 8% owner, 4% sitter)
- **Pricing Concept:** Sitters set their own rates. Suggested range: $15-30/hr based on locale
- **Key Metrics:** Bookings/week, sitter response time (<10 min target), repeat booking rate (>60% target)
- **Competitive Landscape:** Rover (large, impersonal, $20 fee), Wag (walks only, high churn), Nextdoor (informal posts, no payment), Care.com (not pet-focused)

#### 7. Constraints
- **Timeline:** MVP in 8 weeks, beta launch in specific neighborhood
- **Budget:** $15K (founder-funded, pre-seed)
- **Team:** Founder (product/design) + 1 contractor (full-stack)
- **Tech Stack:** React Native (cross-platform), Supabase (backend), Stripe Connect (payments)
- **Integrations:** Stripe Connect, Google Maps API, push notifications
- **Compliance:** Pet sitter insurance requirements vary by state — research needed for launch city

#### 8. Uncertainty Register
| # | Uncertainty | Risk | Classification |
|---|-------------|------|----------------|
| 1 | Will sitters respond fast enough for same-day bookings? | High | Must Validate |
| 2 | Is hyperlocal density sufficient in target neighborhood? | High | Must Validate |
| 3 | Will owners trust a new platform over texting friends? | Med | Must Validate |
| 4 | Optimal commission rate (too high = sitter churn, too low = unsustainable) | Med | Learn Post-Launch |
| 5 | GPS tracking battery impact on sitter's phone | Low | Acceptable Risk |

#### 9. Assumptions Log
1. Pet owners prefer hyperlocal (walking distance) sitters over highly-rated distant ones
2. Shared community connections (same building, mutual friends) increase trust
3. Sitters will respond within 10 minutes for same-day requests
4. $15-30/hr is competitive for casual pet sitting
5. Target neighborhood has sufficient density (>50 pet owners per sq mile)
6. React Native + Supabase can handle real-time GPS within budget

**Most dangerous assumption:** #3 — If sitters don't respond fast, the core value prop (same-day) fails.

#### 10. Scope Decision
**Single PRD** — This is a focused MVP with clear boundaries. Community features (Admin user type) deferred to v2.

#### 11. Open Questions
1. What pet sitter insurance is required in [launch city]? — **High impact** (could delay launch)
2. Can Supabase handle real-time GPS at the update frequency we need? — **Medium** (has alternatives)
3. How do we seed the initial sitter supply in one neighborhood? — **High** (chicken-and-egg)

#### 12. Next Steps
1. Validate assumption #3: Run a 1-week manual matching experiment in target neighborhood (text-based, no app)
2. Research pet sitter insurance requirements for launch city
3. Write PRD from this canvas using prd-architect
4. Design 3 key screens: sitter browse, booking flow, in-session tracker

---

## Multi-PRD Split Examples

### Example: E-Commerce Platform → 3 PRDs

Discovery revealed three distinct systems with different user types and technical domains:

```markdown
## 10. Scope Decision
**Multiple PRDs recommended (3):**

### PRD 1: Storefront — Customer-facing shopping experience
- Users: Shoppers, Guest browsers
- Features: Product browse, search, cart, checkout, order tracking
- Tech: Next.js, Stripe, CDN for images
- Can ship independently: Yes

### PRD 2: Merchant Dashboard — Seller management portal
- Users: Merchants, Store managers
- Features: Inventory management, order fulfillment, analytics, payout dashboard
- Tech: React admin panel, same API as storefront
- Depends on: PRD 1 (shared product/order data model)

### PRD 3: Operations Engine — Internal logistics
- Users: Warehouse staff, Support agents
- Features: Shipping label generation, return processing, fraud detection, support tickets
- Tech: Internal tools, third-party integrations (ShipStation, Zendesk)
- Depends on: PRD 1 (order data), PRD 2 (merchant data)
```

### Separation Signals That Triggered the Split:
1. Shoppers and merchants never use the same screens
2. Storefront can launch with manual fulfillment (no Operations Engine needed initially)
3. Each PRD has a different tech stack emphasis (SSR vs admin panel vs internal tools)
4. Different deployment cadences (storefront = daily, merchant = weekly, ops = monthly)

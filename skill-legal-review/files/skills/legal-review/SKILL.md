---
name: legal-review
description: Review and analyze legal documents — contracts, NDAs, terms of service, privacy policies, SaaS agreements, and freelancer contracts. Identifies risks, flags problematic clauses, checks compliance, and produces structured findings with severity levels and actionable recommendations.
---

# Legal Review Skill

Analyze contracts and legal documents for risks, missing protections, problematic clauses, and compliance gaps. Produces a structured review with severity-rated findings and actionable recommendations.

## Disclaimer

**This skill provides general guidance only and does not constitute legal advice.** AI-assisted review is a starting point, not a substitute for qualified legal counsel. Always have significant contracts reviewed by a licensed attorney in the relevant jurisdiction before execution.

## When to Activate

- Reviewing a contract, agreement, or legal document before signing
- Analyzing terms of service or privacy policies for a product or service
- Evaluating an NDA (non-disclosure agreement) for completeness
- Checking a freelancer or independent contractor agreement
- Reviewing a SaaS or software license agreement
- Comparing contract terms against industry standards
- Performing due diligence on vendor or partner agreements
- Assessing employment or consulting agreements
- Identifying missing clauses in a draft contract
- Evaluating renewal, termination, or amendment terms

## Review Workflow

Follow this sequence for every legal document review.

### Step 1: Document Identification

Determine the document type and context:

1. **Classify the document** -- NDA, service agreement, terms of service, privacy policy, freelancer contract, SaaS agreement, employment contract, consulting agreement, license agreement, or other.
2. **Identify the parties** -- Who is offering and who is accepting? Which party does the reviewer represent?
3. **Note the jurisdiction** -- Governing law clause, or infer from party locations.
4. **Determine the stakes** -- Estimated contract value, duration, data sensitivity, IP implications.

### Step 2: Structural Completeness Check

Verify the document contains all expected sections for its type. Missing sections are findings.

**Core sections every contract should have:**
- Parties and recitals
- Definitions
- Scope of services or obligations
- Payment terms
- Term and termination
- Intellectual property
- Confidentiality
- Representations and warranties
- Limitation of liability
- Indemnification
- Dispute resolution
- Governing law
- General provisions (severability, entire agreement, amendments, notices)
- Signature blocks

### Step 3: Clause-by-Clause Analysis

Read each clause and evaluate against the Contract Analysis Checklist below. For every issue found, record:

- **Clause reference** (section number or heading)
- **Issue description** (what is wrong or missing)
- **Risk level** (High, Medium, or Low -- see Risk Categories)
- **Recommendation** (specific action to remediate)

### Step 4: Cross-Reference and Consistency

- Check that defined terms are used consistently throughout.
- Verify dates, amounts, and party names match across all sections.
- Confirm that referenced exhibits, schedules, or appendices actually exist.
- Look for internal contradictions between clauses.

### Step 5: Produce Structured Output

Compile all findings into the output format defined in the Output Format section below.

---

## Contract Analysis Checklist

Work through each category systematically. Check every item; mark as compliant, non-compliant, or missing.

### Liability and Risk Allocation

- [ ] **Liability cap exists** -- Is total liability limited? To what amount (contract value, fees paid, fixed cap)?
- [ ] **Liability cap is reasonable** -- Cap should be proportional to contract value. Unlimited liability is a red flag.
- [ ] **Consequential damages exclusion** -- Are indirect, incidental, and consequential damages excluded?
- [ ] **Carve-outs from liability cap** -- Are there appropriate exceptions (gross negligence, willful misconduct, IP infringement, confidentiality breach)?
- [ ] **Warranty disclaimers** -- Are implied warranties (merchantability, fitness for purpose) disclaimed where appropriate?
- [ ] **Force majeure** -- Is there a force majeure clause covering unforeseeable events?

### Indemnification

- [ ] **Indemnification obligations defined** -- Who indemnifies whom, and for what?
- [ ] **Mutual vs. one-sided** -- Is indemnification mutual or does it unfairly burden one party?
- [ ] **Scope is reasonable** -- Does indemnification cover only third-party claims, or does it extend to direct losses?
- [ ] **Defense and control** -- Who controls the defense of indemnified claims?
- [ ] **Cap on indemnification** -- Is indemnification subject to the overall liability cap, or is it uncapped?
- [ ] **Survival** -- Do indemnification obligations survive termination?

### Intellectual Property

- [ ] **IP ownership is clearly assigned** -- Who owns deliverables, work product, and derivative works?
- [ ] **Pre-existing IP identified** -- Are each party's pre-existing materials carved out?
- [ ] **License grants are appropriate** -- If IP is licensed rather than assigned, are the terms (scope, exclusivity, territory, duration) clear?
- [ ] **Work-for-hire designation** -- If applicable, is work-for-hire status properly established?
- [ ] **Open source disclosure** -- Are open source components identified with their license obligations?
- [ ] **IP warranties** -- Does the provider warrant non-infringement of third-party IP?
- [ ] **Background IP protection** -- Is background IP (tools, methodologies, frameworks) retained by its owner?

### Termination

- [ ] **Termination for convenience** -- Can either party terminate without cause? What is the notice period?
- [ ] **Termination for cause** -- Are material breach triggers defined? Is there a cure period?
- [ ] **Cure period is reasonable** -- Typically 15-30 days for non-payment, 30 days for other breaches.
- [ ] **Effect of termination** -- What happens to payments, deliverables, data, and licenses upon termination?
- [ ] **Survival clauses** -- Which obligations survive termination (confidentiality, indemnification, liability caps)?
- [ ] **Wind-down provisions** -- Is there an orderly transition or handoff process?
- [ ] **Refund or payment on termination** -- Is the provider paid for work completed to date?

### Non-Compete and Non-Solicitation

- [ ] **Non-compete scope** -- Is there a non-compete? What activities are restricted?
- [ ] **Geographic limitation** -- Is the non-compete geographically bounded?
- [ ] **Duration is reasonable** -- Non-competes beyond 1-2 years are often unenforceable.
- [ ] **Non-solicitation of employees** -- Is there a restriction on hiring the other party's staff?
- [ ] **Non-solicitation of clients** -- Is there a restriction on soliciting the other party's customers?
- [ ] **Enforceability** -- Non-competes are unenforceable in many jurisdictions (e.g., California). Flag if potentially void.

### Data Handling and Privacy

- [ ] **Data processing roles defined** -- Who is the controller and who is the processor?
- [ ] **Personal data scope** -- What categories of personal data are processed?
- [ ] **Data processing agreement (DPA)** -- Is a DPA attached or referenced if personal data is involved?
- [ ] **Security measures specified** -- Are technical and organizational security measures defined?
- [ ] **Breach notification** -- Is there a data breach notification obligation and timeline?
- [ ] **Data retention and deletion** -- What happens to data after termination?
- [ ] **Sub-processor restrictions** -- Are sub-processors permitted? Is consent required?
- [ ] **Cross-border transfers** -- If data crosses borders, are transfer mechanisms (SCCs, adequacy decisions) addressed?
- [ ] **Compliance with applicable laws** -- Does the contract reference GDPR, CCPA, or other relevant data protection laws?

### Payment Terms

- [ ] **Payment amounts are clear** -- Are fees, rates, or prices unambiguous?
- [ ] **Payment schedule defined** -- When are payments due (net 30, milestones, monthly)?
- [ ] **Late payment consequences** -- Are interest rates or late fees specified?
- [ ] **Expense reimbursement** -- Are reimbursable expenses defined and capped?
- [ ] **Price escalation** -- Can prices increase? Under what conditions and with what notice?
- [ ] **Currency specified** -- Is the payment currency explicitly stated?
- [ ] **Tax treatment** -- Is it clear who bears tax obligations?
- [ ] **Right to withhold payment** -- Can the client withhold payment for disputed work? Under what conditions?
- [ ] **Milestone acceptance criteria** -- For milestone payments, are acceptance criteria objectively defined?

### Governing Law and Dispute Resolution

- [ ] **Governing law stated** -- Which jurisdiction's laws govern the agreement?
- [ ] **Dispute resolution mechanism** -- Litigation, arbitration, or mediation?
- [ ] **Venue specified** -- Where must disputes be brought?
- [ ] **Arbitration rules** -- If arbitration, which rules (AAA, ICC, LCIA, ad hoc)?
- [ ] **Escalation process** -- Is there a good-faith negotiation step before formal proceedings?
- [ ] **Prevailing party fees** -- Does the losing party pay the winner's legal fees?
- [ ] **Jury waiver** -- Is there a jury trial waiver (common in US commercial contracts)?

### Auto-Renewal and Evergreen Traps

- [ ] **Auto-renewal clause present** -- Does the contract auto-renew?
- [ ] **Opt-out window** -- How far in advance must notice be given to prevent renewal?
- [ ] **Renewal term length** -- Does it renew for the same initial term or a shorter period?
- [ ] **Price changes on renewal** -- Can the price increase upon renewal?
- [ ] **Opt-out mechanism is practical** -- Is the cancellation process clearly defined and not unduly burdensome?

---

## Risk Categories

Classify every finding into one of three severity levels.

### High Risk

Issues that could cause significant financial loss, legal exposure, or loss of critical rights. These should be resolved before signing.

**Indicators:**
- Unlimited or uncapped liability
- Unilateral indemnification with no cap
- IP ownership is ambiguous or assigned away without consideration
- No termination rights or unreasonably long lock-in periods
- Broad non-compete that could restrict core business activities
- Missing data protection provisions when personal data is involved
- Automatic assignment of all IP (including background IP) to the other party
- Governing law in an unfavorable or distant jurisdiction with mandatory arbitration
- Penalty clauses or liquidated damages grossly disproportionate to potential harm
- Broad "most favored nation" or exclusivity clauses
- Waiver of consequential damages by only one party

### Medium Risk

Issues that create imbalanced terms or could become problematic under certain circumstances. These should be negotiated but may not be deal-breakers.

**Indicators:**
- Liability cap set well below contract value
- Asymmetric termination rights (one party has more flexibility)
- Vague scope of work that could enable scope creep
- Non-standard payment terms (net 60+, back-loaded milestones)
- Auto-renewal with short opt-out windows (less than 30 days)
- Broad but time-limited non-compete (1-2 years)
- Missing warranty period or unreasonably short warranty
- Ambiguous expense reimbursement terms
- No change order process for scope modifications
- Vague acceptance criteria for deliverables
- Insurance requirements that exceed industry norms

### Low Risk

Minor issues or best-practice improvements. Acceptable to sign with these, but worth improving in future revisions.

**Indicators:**
- Minor drafting ambiguities that do not affect rights
- Missing but non-critical boilerplate (e.g., counterparts clause)
- Slightly unusual but not harmful notice periods
- Formatting or numbering inconsistencies
- Missing definitions for terms that are clear from context
- Absence of a force majeure clause in a short-term agreement
- No escalation step before formal dispute resolution
- General provisions that could be more detailed

---

## Common Clause Patterns

Reference patterns for the most frequently reviewed document types.

### NDAs (Non-Disclosure Agreements)

**Expected structure:**
1. Definition of confidential information (should be specific, not overly broad)
2. Obligations of receiving party (maintain confidentiality, limit access)
3. Exclusions (public knowledge, independent development, prior knowledge, legally compelled disclosure)
4. Term of confidentiality obligation (typically 2-5 years, or indefinite for trade secrets)
5. Return or destruction of materials
6. No license or IP transfer implied
7. Remedies (injunctive relief acknowledged)

**Common red flags in NDAs:**
- Overly broad definition of "confidential information" that captures everything
- No exclusions for publicly available information
- Unilateral obligation when mutual is appropriate
- Indefinite term with no sunset
- No carve-out for legally compelled disclosures
- Residuals clause missing (information retained in unaided memory)

### Service Agreements

**Expected structure:**
1. Scope of services (detailed, with reference to SOW or schedule)
2. Performance standards and SLAs
3. Acceptance process for deliverables
4. Change order procedure
5. Payment terms tied to milestones or time periods
6. IP ownership of deliverables
7. Warranties (professional standard, non-infringement)
8. Limitation of liability
9. Term, renewal, and termination

**Common red flags in service agreements:**
- Scope defined too vaguely ("all necessary services")
- No change order process (invites scope creep)
- IP clause is silent on background IP
- Acceptance deemed automatic if client does not respond within X days
- Warranty period is zero or undefined
- No right to cure before termination for cause

### Terms of Service

**Expected structure:**
1. Acceptance mechanism (click-wrap, browse-wrap)
2. User obligations and acceptable use
3. Account terms and responsibilities
4. Service availability and SLA (if any)
5. Payment and billing (subscription terms, refund policy)
6. Intellectual property rights
7. User-generated content license
8. Disclaimer of warranties
9. Limitation of liability
10. Dispute resolution and class action waiver
11. Modification procedure and notice
12. Termination and account deletion

**Common red flags in terms of service:**
- Unilateral right to modify terms without notice or opt-out
- Overly broad license grant on user-generated content
- No refund policy or unclear cancellation terms
- Forced arbitration with class action waiver
- Data retention after account deletion
- Liability limited to fees paid in prior 12 months (may be very low)

### Privacy Policies

**Expected structure:**
1. Data collected (categories and specific data points)
2. How data is collected (directly, cookies, third parties)
3. Purpose of processing (with legal basis if GDPR applies)
4. Data sharing and third-party recipients
5. Data retention periods
6. User rights (access, correction, deletion, portability, objection)
7. Security measures
8. International transfers
9. Children's data
10. Cookie policy
11. Changes to the policy
12. Contact information for data protection inquiries

**Common red flags in privacy policies:**
- Vague "we may share data with partners" without specifics
- No data retention periods stated
- Missing user rights section
- No legal basis for processing specified (GDPR requirement)
- Blanket consent for all processing purposes
- No cookie consent mechanism described
- No DPO or privacy contact provided

### Freelancer and Independent Contractor Agreements

**Expected structure:**
1. Independent contractor status (not employee)
2. Scope of work
3. Compensation and invoicing
4. IP assignment (work product ownership)
5. Confidentiality
6. Non-solicitation (if applicable)
7. Representations (authority, no conflicts)
8. Insurance and tax obligations
9. Termination

**Common red flags in freelancer contracts:**
- Control provisions that suggest employment rather than independent contractor status
- All IP assigned including tools and pre-existing work
- No right to work for other clients
- Payment contingent on client's end-customer payment
- Non-compete that is too broad for contractor relationship
- No termination right for the contractor

### SaaS Agreements

**Expected structure:**
1. Subscription terms and service description
2. User limits and usage restrictions
3. Uptime SLA and service credits
4. Data ownership and portability
5. Security and compliance certifications
6. Support tiers and response times
7. Integration and API terms
8. Pricing, billing, and renewal
9. Termination and data export
10. Acceptable use policy

**Common red flags in SaaS agreements:**
- No uptime commitment or SLA
- Customer data ownership is unclear
- No data export or portability provision
- Vendor can change pricing with insufficient notice
- No service credits for downtime
- Broad right to suspend service without notice
- Vendor retains rights to use customer data for analytics or ML training
- No transition assistance upon termination

---

## Red Flags Quick Reference

When performing a rapid scan, prioritize checking for these high-impact issues.

| Red Flag | Why It Matters |
|----------|---------------|
| Unlimited liability | Exposure to uncapped financial risk |
| Unilateral termination only | One party locked in, the other can walk away |
| IP assignment without carve-outs | Loss of background IP, tools, and methodologies |
| No cure period for breach | Termination without opportunity to fix |
| Broad non-compete | May prevent working in your field |
| Auto-renewal with short opt-out | Trapped in unwanted renewals |
| Uncapped indemnification | Potentially liable for far more than contract value |
| No data deletion on termination | Data retained indefinitely by counterparty |
| Governing law in remote jurisdiction | Dispute resolution becomes impractical |
| "Sole and exclusive remedy" limits | Normal legal remedies may be waived |
| Waiver of jury trial | Gives up significant procedural right |
| Assignment without consent | Contract can be transferred to unknown third party |
| Modification without notice | Terms can change without your knowledge |
| Broad audit rights | Counterparty can inspect your systems at any time |

---

## Output Format

Every legal review must produce output in this structure.

### Review Header

```
LEGAL DOCUMENT REVIEW
=====================
Document:     [Document title or filename]
Type:         [NDA | Service Agreement | Terms of Service | Privacy Policy |
               Freelancer Contract | SaaS Agreement | Other]
Parties:      [Party A] / [Party B]
Reviewed for: [Which party the review is conducted on behalf of]
Governing Law:[Jurisdiction, or "Not specified"]
Date Reviewed:[YYYY-MM-DD]
```

### Executive Summary

A 3-5 sentence summary covering:
- Overall assessment (favorable, balanced, concerning, or unfavorable)
- Number of findings by severity
- Top 2-3 most critical issues
- General recommendation (sign as-is, negotiate specific terms, significant revision needed, do not sign)

### Findings Table

```
| # | Section/Clause     | Risk Level | Finding                          | Recommendation                        |
|---|--------------------|------------|----------------------------------|---------------------------------------|
| 1 | 7.2 Liability Cap  | HIGH       | Liability is uncapped for        | Add cap equal to 2x fees paid         |
|   |                    |            | provider obligations              | under the agreement                   |
| 2 | 4.1 IP Assignment  | HIGH       | All IP including pre-existing    | Add carve-out for background IP       |
|   |                    |            | work is assigned to client        | and tools                             |
| 3 | 9.3 Auto-Renewal   | MEDIUM     | Auto-renews annually with only   | Extend opt-out window to 60 days      |
|   |                    |            | 15-day opt-out window             | or remove auto-renewal                |
| 4 | 12.1 Notices       | LOW        | Notice address not specified     | Add notice addresses for both parties |
```

### Missing Provisions

List any sections or protections that are absent and should be added:

```
MISSING PROVISIONS
------------------
- [ ] Force majeure clause
- [ ] Data processing agreement (personal data is in scope)
- [ ] Change order process for scope modifications
- [ ] Acceptance criteria for deliverables
```

### Severity Summary

```
RISK SUMMARY
------------
High:   [count] findings — must resolve before signing
Medium: [count] findings — negotiate if possible
Low:    [count] findings — acceptable, improve in future

Overall Assessment: [FAVORABLE | BALANCED | CONCERNING | UNFAVORABLE]
Recommendation:     [Sign as-is | Negotiate specific terms | Significant revision needed | Do not sign]
```

### Detailed Analysis

For each HIGH-risk finding, provide an expanded analysis:

```
FINDING #[N]: [Title]
Section:     [Clause reference]
Risk Level:  HIGH
Current Text:[Quote the relevant clause text]
Issue:       [Detailed explanation of why this is problematic]
Impact:      [What could happen if this is not addressed]
Recommendation: [Specific language changes or additions to resolve the issue]
```

### Positive Observations

Note any particularly well-drafted provisions or protections that favor the reviewed party:

```
POSITIVE OBSERVATIONS
---------------------
- Mutual liability cap at 2x annual fees (Section 7.1) — balanced and industry-standard
- Comprehensive data breach notification within 48 hours (Section 11.3)
- Clear IP ownership with proper background IP carve-out (Section 5.2)
```

---

## Review Principles

Apply these principles throughout every review:

1. **Advocate for the reviewed party** -- Evaluate terms from the perspective of the party you are reviewing for. Flag anything that creates disadvantage.
2. **Proportionality** -- Assess risk relative to contract value, duration, and business context. A broad indemnity in a $500 contract is different from one in a $5M deal.
3. **Industry standards** -- Compare terms against what is normal for the document type and industry. Flag significant deviations.
4. **Enforceability** -- Note provisions that may be unenforceable in the governing jurisdiction (e.g., overbroad non-competes, penalty clauses).
5. **Practical impact** -- Focus on terms that will actually affect the parties in practice, not theoretical edge cases.
6. **Plain language** -- Write findings in clear, non-legalese language. The audience may not be lawyers.
7. **Actionable recommendations** -- Every finding must include a specific, implementable recommendation, not just "this is bad."
8. **Completeness** -- Check for what is missing, not just what is present. Absent protections are as important as problematic clauses.

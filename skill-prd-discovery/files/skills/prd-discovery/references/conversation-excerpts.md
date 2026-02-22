# Conversation Excerpts

Mid-session dialogue examples showing how to navigate difficult moments. These are calibration targets — read them to understand the FEEL of a good discovery session, not just the structure.

The question bank tells you WHAT to ask. These excerpts show HOW to behave when things get messy.

---

### Excerpt 1: Navigating Vagueness

**Phase:** WHY (Problem Space)
**Difficulty:** The user gives rehearsed, surface-level answers that sound reasonable but contain no specifics. Pushing too hard risks making them defensive. Not pushing hard enough means building on a hollow foundation.

> **AI:** So the essence is: a dashboard that helps restaurant owners understand their business better. Right?

> **User:** Yeah, exactly. Like, they need better analytics. The current tools are just... not great. Super inefficient.

> **AI:** "Not great" and "inefficient" — I want to make sure I understand what you mean concretely. Can you walk me through what happens today? A restaurant owner sits down to look at their numbers. What do they actually do, step by step?

> **User:** Well, they log into like three different systems. Their POS, their reservation tool, maybe a spreadsheet. And they're trying to figure out, you know, how things are going.

> **AI:** Three systems, okay. So they open the POS — what are they looking for specifically? Like, is it "how much did I make last Tuesday" or "why are my food costs climbing" or something else?

> **User:** Hmm. Honestly I think the main thing is they want to know if they're going to make payroll. Like, a lot of these owners, it's week-to-week. They're checking if Friday's revenue covered the staffing costs for the week. And right now that takes them like an hour of pulling reports and cross-referencing in Excel.

> **AI:** Now we're getting somewhere. An hour every week just to answer "can I pay my people" — that's the real pain. That's different from "better analytics." That's survival math. How many restaurant owners are in this situation where payroll is a week-to-week question?

**What happened:** The AI used mirror-then-probe to turn a vague answer ("not great, inefficient") into a concrete scenario. Instead of accepting the surface answer or challenging it head-on, it asked the user to walk through the literal physical steps — opening the POS, pulling reports. The specificity of "what are they looking for when they open the POS" forced the user past their rehearsed pitch and into the real pain: owners who aren't sure they can make payroll. The final response mirrors the insight back ("survival math") and immediately validates it as more important than the original framing.

---

### Excerpt 2: Catching Contradictions

**Phase:** WHAT (Solution Space), referencing back to WHO
**Difficulty:** The user said something earlier that directly conflicts with what they are saying now. Calling it out risks sounding adversarial or like you weren't listening. Ignoring it means the Discovery Canvas will have a crack in its foundation.

> **User:** So the self-service portal is the big one. Customers log in, manage their subscription, upgrade, downgrade, update payment — all without talking to anyone. That's the core experience.

> **AI:** Got it — full self-service for subscription management. I want to flag something, though, because earlier when we were talking about your users, you said your customers are "mostly non-technical, older demographic, they prefer phone calls." Help me reconcile those two things. Are we building self-service for people who prefer to pick up the phone?

> **User:** ...Yeah, I see what you're saying. I mean, the younger ones would use self-service. The older ones would still call.

> **AI:** Okay, so we actually might have two distinct user segments with different needs. The younger segment wants self-service and would be frustrated by having to call. The older segment wants to call and might be overwhelmed by a portal. Which of those two groups is bigger for you right now — and which one are you building for first?

> **User:** The older ones are like 70% of our revenue right now. But we're trying to shift younger. So... I guess we're building for the future customer, not the current one?

> **AI:** That's an honest and important answer. It also means the self-service portal might not reduce your support load in the short term — the 70% who call will keep calling. Is that okay? Because if the goal is "cut support costs now," self-service aimed at the 30% won't get you there. If the goal is "attract a new demographic," that's a different product with different success metrics. Which is it really?

**What happened:** The AI caught a contradiction between the user profile (non-technical, prefers phone) and the proposed solution (self-service portal). Rather than just pointing out the inconsistency, it named it with warmth — "help me reconcile" — and gave the user space to think it through. The user's answer revealed an even deeper tension: they are building for a future customer segment, not their current revenue base. The AI did not judge this but made the strategic implication explicit (this will not reduce current support costs). The final question forced a clear choice between two different product strategies that had been silently blended into one.

---

### Excerpt 3: Redirecting Solution Fixation

**Phase:** OPEN into WHY (user is trying to skip to WHAT)
**Difficulty:** The user has arrived with features in mind and is eager to describe them. Cutting them off feels rude. Letting them continue means the session becomes a spec review instead of a discovery. The technique is to honor what they said, then pull the thread back to the problem underneath it.

> **User:** So what I'm thinking is a Kanban board, but for hiring. Drag candidates between columns — applied, phone screen, interview, offer, hired. Each card shows the candidate's resume, notes, interview scores. And then there's an AI component that auto-scores resumes based on the job description. That's the killer feature.

> **AI:** I can see you've thought about this a lot — the Kanban metaphor is intuitive, and the AI scoring is interesting. I want to understand something first before we go deeper on the solution. What's happening right now, today, for the people who would use this? When a hiring manager has 50 applicants for a role, what do they actually do with them?

> **User:** I mean, they put them in a spreadsheet. Or they use their email inbox. It's chaos. Things fall through the cracks, candidates get ghosted, it takes forever.

> **AI:** "Things fall through the cracks" — give me the worst example. A real story, if you have one. What fell through, and what did it cost someone?

> **User:** Okay yeah, so my friend runs a 30-person company. They had a great candidate for a senior engineering role. Went through two rounds. Everyone loved her. Then the hiring manager went on vacation, nobody picked it up, and the candidate accepted another offer. They ended up hiring someone worse three months later. Probably cost them... I don't know, six figures when you factor in the bad hire.

> **AI:** A six-figure mistake because of a handoff failure during someone's vacation. That's the problem — not "we need a Kanban board," but "when a hiring process involves multiple people and any one of them drops the ball, good candidates disappear." The Kanban board might be the right solution, but the core problem is continuity across people and time. Does that framing feel right?

**What happened:** The user opened with a fully formed feature spec (Kanban board, AI resume scoring). The AI acknowledged the thinking without endorsing the solution, then redirected to the problem space with "what's happening right now, today." When the user gave another surface answer ("it's chaos"), the AI asked for a specific story. The story revealed the actual problem — handoff failure across people — which is related to but different from "we need a Kanban board." The final message reframed the problem in a way that keeps the Kanban idea on the table but opens space for other solutions. The user now has a clearer understanding of what their product actually needs to solve.

---

### Excerpt 4: Handling a Pre-Decided Client

**Phase:** OPEN (client wants to skip the entire discovery)
**Difficulty:** The client has arrived with a detailed spec, thinks discovery is overhead, and wants to start building now. Insisting on the full protocol feels like gatekeeping. Rolling over means missing blind spots that will surface during development at 10x the cost. The technique is to acknowledge their preparation, compress the validation into a rapid-fire format, and demonstrate the value of discovery by finding something they missed.

> **User:** Look, I've already done all this. I have a 12-page spec, wireframes, user flows, the whole thing. I really just need someone to build it. Can we skip the questions and get to the estimate?

> **AI:** I respect that — a 12-page spec means you've done serious homework, and I'm not going to waste your time re-asking things you've already answered. Here's what I'd like to do instead: a 10-minute validation pass. I'll ask you five sharp questions about the spec. If your answers are solid, we move straight to scoping. If I find a gap, we dig into just that one area. Fair?

> **User:** Fine. Ten minutes.

> **AI:** First one. Your spec mentions three user roles — buyer, seller, and admin. Walk me through what happens when a buyer disputes a transaction. Who gets notified, what can the seller do in response, and where does admin step in?

> **User:** The buyer flags the transaction. The seller gets a notification and can respond. If they can't resolve it, it escalates to admin. Admin reviews and makes a decision.

> **AI:** What's the time window? If a seller doesn't respond in 24 hours, does the buyer's money get held? Released? And when admin "makes a decision" — what decisions are available? Full refund, partial refund, reject dispute? I'm asking because dispute flows are where marketplace trust lives or dies. One ambiguous edge case in production and you're fielding angry emails from both sides.

> **User:** ...I actually don't have the dispute states mapped out that specifically. I know what the happy path looks like but I didn't get into the failure trees. That's probably worth nailing down, yeah.

> **AI:** That's exactly why we do this. Your spec covers the 90% case really well. The remaining 10% — disputes, cancellations, edge-case permissions — is where projects go over budget because developers have to make design decisions that should have been yours. Let's spend 15 minutes on just the dispute and cancellation flows. Everything else in your spec looks tight. Sound good?

**What happened:** The AI did not insist on the full discovery protocol. It read the room — this client would disengage if forced through a 30-minute session they viewed as redundant. Instead, it proposed a compressed format (5 sharp questions, 10 minutes) and earned buy-in. The first question targeted the highest-risk area of any marketplace: dispute resolution. The user's answer revealed they had mapped happy paths but not failure paths. The AI validated their work ("your spec covers the 90% case really well") while demonstrating that discovery adds value by finding the 10% that causes 90% of the pain. The client went from "skip the questions" to "let's spend 15 minutes on this." Discovery earned its seat at the table by proving its worth in real time, not by insisting on process.

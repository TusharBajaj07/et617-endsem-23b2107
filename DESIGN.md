# Ganit Chaupal: Design Rationale

The content (persona, outcomes, tasks, feedback) is in [REPORT.md](REPORT.md) sections D1–D3. This file holds the
design decisions and the build blueprint.

## Design principles

1. **DP1:** We will check every numeric answer with code and use the AI agents only to explain, question and phrase
   feedback, because Kavita has no one at home to cross-check a wrong AI explanation, and unverified AI output is an
   AIED anti-pattern.
2. **DP2:** We will show agent disagreement as one labelled "दो राय: तुम तय करो" card with three choices, instead of
   separate conflicting messages, because loose contradictions add extraneous load (CLT), while resolving the conflict
   herself drives conceptual change and keeps her in charge (autonomy, Self-Determination Theory).
3. **DP3:** We will teach every rule through two concrete models, a number-line move and an udhaar story, because she
   memorised "minus-minus-plus" without meaning (M2). A familiar village context plus a picture gives two routes to
   encoding (situated learning, dual coding).
4. **DP4:** We will give Samjhao's hint ladder (nudge → worked step → answer) before revealing any answer, because she
   has no tutor and learns best with just-enough help at the point of being stuck (ZPD).
5. **DP5:** We will design for a shared, weakly connected phone:
   - Hindi first, with an English toggle
   - one task per screen, no sound needed
   - a session of about 20 minutes, with pause and resume
   - tasks and scripted feedback pre-loaded; events saved on the phone and synced later
   - AI with an 8-second timeout and a fallback to scripted text

   We will do this because of L1's constraints (the phone gets taken back, evening data is weak) and because we saw
   Gemini return 503 errors and take about 10 seconds per call during the build.
6. **DP6:** We will send unresolved disagreements and every AI judgement of a free-text explanation to a teacher queue,
   where the teacher approves or overrides them before the next session, because the AI is least reliable on open
   answers and the teacher is the trusted authority (C5, human-in-the-loop).

## Theory → feature map

| Theory | Prediction for Kavita | Feature | Code location |
|---|---|---|---|
| Conceptual change / cognitive conflict | Two clashing rules need resolving with evidence | "दो राय" card + test item | `src/screens/TwoViews.jsx` |
| ZPD / scaffolding | Stuck with no tutor | Samjhao hint ladder; targeted re-explanation per misconception | `src/agents/samjhao.js` |
| Cognitive Load Theory | 30-minute window, small screen | 4 concept cards, one task per screen, at most 2 agent bubbles per turn | `src/screens/Learn.jsx`, `Practice.jsx` |
| Situated learning + dual coding | Rules without meaning | Number line + udhaar stories | `src/components/NumberLine.jsx`, `src/content.js` |
| Affective filter | Goes quiet when publicly wrong | Private, encouraging feedback; no scores shown to others | feedback text in `content.js` |
| Human-in-the-loop AIED (C5) | AI may misjudge free text | Teacher approve/override queue | `src/screens/Teacher.jsx`, `reviews` table |

## Multi-agent architecture (P3)

```
Learner attempt
  → Checker (code): correct? matches the M1 or M2 prediction?
  → Blackboard (shared learner state: item, attempt, verdict, misconception tags, hint level, history, teacher notes)
       ├─ Jaanch reads the verdict and writes stance + diagnosis
       ├─ Samjhao reads Jaanch's misconception tag → money model for M1, number line for M2
       └─ Sawaal reads Jaanch's stance + history (e.g. M2 in T1) → counterexample or "why?"
  → Coordinator (code) applies the conflict policy → UI: one bubble at a time, or the "दो राय" card
  → events logged → teacher queue (disagreements, AI free-text scores)
```

**How the agents exchange information:**
- Jaanch's misconception tag decides which model Samjhao uses.
- Jaanch's stance plus the learner's history decide Sawaal's challenge.
- The result of Sawaal's test item updates Jaanch's evidence for LO2.
- A teacher override replaces the agents' feedback the next time the learner opens the app.

**Conflict policy (answer to the design challenge):**
1. **R1:** Correctness is never debated; code owns it.
2. **R2:** One voice at a time, at most 2 bubbles per turn, each at most 2 sentences.
3. **R3:** Disagreement is about the reason only, and appears as one explicit card.
4. **R4:** The learner chooses between Test, Continue and Ask teacher; no choice is penalised.
5. **R5:** If unresolved, it goes to the teacher, whose decision is final and shown.

**AI calls:**
- One serverless endpoint, `/api/agent`, using Gemini `gemini-3.5-flash-lite` with key 1, then key 2.
- Each agent has its own role prompt and receives the blackboard as JSON.
- The scripted line from D3 shows instantly; the AI line replaces it if it arrives within 8 s and passes validation:
  valid JSON, length cap, Devanagari present, no number that contradicts the checker's answer.

## Screens (D4): identity token `ID 23B2107 · S#` in the header of every screen

| ID | Screen | Learner or teacher input → system output | Next |
|---|---|---|---|
| S1 | प्रवेश / Start | Learner: name. Teacher: PIN. Language toggle | S2 or S6 |
| S2 | समझो / Learn | 4 concept cards with a tappable number line | S3 |
| S3 | अभ्यास / Practice | T1–T6 answers → Jaanch / Samjhao / Sawaal bubbles, hints | next task, S4, or S5 |
| S4 | दो राय / Two views | Test / Continue / Ask teacher | S3 |
| S5 | मेरी प्रगति / Summary | LO mastery, misconceptions, teacher messages | S3 (review) or S1 |
| S6 | शिक्षक / Teacher | Class progress table + review queue: approve or override | updates the learner's S5 |

## Data
- **Storage:** localStorage first, then batch sync to Supabase. Tables: `events` (clickstream), `learners`, and a new
  `reviews` table for the teacher queue.
- **Events:** session_start, item_presented, answer_submitted (correct, misconception), hint_requested,
  agent_message (agent, source ai|scripted), disagreement_shown, disagreement_choice, teacher_review, session_end.

## Limitations
- The persona's details are assumed, not taken from field data.
- There is only one activity, and it covers addition and subtraction only (multiplication sign rules are left out).
- The Supabase read policy is open for the demo.

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
   - Hindi and English, one-tap toggle on every screen, remembered per phone (English is the default view)
   - one task per screen, no sound needed
   - a session of about 20 minutes; Pause shows a resume card (and pauses automatically when the phone is taken
     back), "Done for today" saves and exits
   - tasks and scripted feedback pre-loaded; events saved on the phone and synced later
   - AI with an 11-second limit and a fallback to scripted text

   We will do this because of L1's constraints (the phone gets taken back, evening data is weak) and because we saw
   Gemini return 503 errors and take about 10 seconds per call during the build.
6. **DP6:** We will send unresolved disagreements and every AI judgement of a free-text explanation to a teacher queue,
   where the teacher approves or overrides them before the next session, because the AI is least reliable on open
   answers and the teacher is the trusted authority (C5, human-in-the-loop).

## Theory → feature map

| Theory | Prediction for Kavita | Feature | Code location |
|---|---|---|---|
| Conceptual change / cognitive conflict | Two clashing rules need resolving with evidence | "दो राय" card + test item | `src/screens/TwoViews.jsx` |
| ZPD / scaffolding | Stuck with no tutor | Samjhao hint ladder; targeted re-explanation per misconception | `ROLES.samjhao` in `api/agent.js`; `task.hints` in `src/content.js` |
| Cognitive Load Theory | 30-minute window, small screen | 4 concept cards, one task per screen, at most 2 agent bubbles per turn | `src/screens/Learn.jsx`, `Practice.jsx` |
| Situated learning + dual coding | Rules without meaning | Number line + udhaar stories | `src/components/NumberLine.jsx`, `src/content.js` |
| Affective filter | Goes quiet when publicly wrong | Private, encouraging feedback; no scores shown to others | feedback text in `content.js` |
| Human-in-the-loop AIED (C5) | AI may misjudge free text | Teacher approve/override queue | `src/screens/Teacher.jsx`, `reviews` table |

## Multi-agent architecture (P3)

Code decides correctness. The three AI agents only phrase, explain and challenge. A coordinator (code) decides who
speaks, passes each agent's message to the next, and checks every AI line before the learner sees it.

| Part | AI? | Role | Code |
|---|---|---|---|
| Checker | No | Correct or not, plus the misconception tag (M1, M2, `diff`, `sign`, `other`, `shortcut`) | `check()` in `src/agents.js` |
| Blackboard | No | Shared learner state rebuilt from saved progress: per-task tags, done flags, M1/M2 counts | `blackboard()` in `src/agents.js` |
| Jaanch (Evaluator) | Yes | Puts the checker's verdict and tag into words; scores T5 free text 0–3 | `ROLES.jaanch`, `ROLES.jaanch_rubric` in `api/agent.js` |
| Samjhao (Explainer) | Yes | A nudge targeted at the tag: udhaar for M1, number-line direction for M2 | `ROLES.samjhao` |
| Sawaal (Challenger) | Yes | One "why?" or counterexample; may disagree with Jaanch | `ROLES.sawaal` |
| Coordinator | No | Picks speakers from the script for the tag, runs them in order, validates output, falls back to the script | `say()`/`speak()` in `Practice.jsx`, debate in `TwoViews.jsx` |
| Teacher | Human | Final word on disagreements and free-text scores | `Teacher.jsx`, `reviews` table |

```
Learner submits
  → Checker (code): { correct, tag }  → instant "✓ Correct" / "✗ Not right yet" (no AI wait)
  → Blackboard (code): history of tags across T1–T6
  → Coordinator: speakers = task.feedback[tag], e.g. M2 → [Jaanch, Samjhao]; conversation reset
       Jaanch  ← task, verdict, tag, attempt, blackboard, scripted line, conversation []
       Samjhao ← same + conversation [Jaanch's message]   (reads Jaanch, builds on it, returns stance)
  → Validator (code, validAI) per message → pass: show AI line · fail/timeout/offline: show scripted line
  → Learner: retry · hint ladder · "Explain it to me" (Samjhao) · "Or challenge me instead" (Sawaal)
  → Events logged (agent, source ai|scripted, model, stance) → teacher queue for disagreements and free text
```

**How the agents exchange information:**
1. **Conversation passing:** each reply is appended to the turn's conversation and sent to the next agent (last 4
   turns), with an instruction to respond to the other agents by name.
2. **Shared blackboard:** every agent receives the learner's tag history, so Sawaal can say "in question 1 this same
   rule went wrong".
3. **Stance:** every agent returns `agree`/`disagree` about the previous message; a disagreement is labelled on the
   bubble ("🤝 Disagrees with Jaanch").
4. **Debate (S4):** Jaanch's AI verdict on the T5 shortcut is passed to Sawaal with `debate: true`; Sawaal must
   disagree and name the counterexample −2 + (−5). The coordinator turns this into one "Two views: you decide" card.
5. **Outcome feeds back:** a failed test adds an M2 tag to T5 (lowers LO2, shows in the teacher's class table); "Ask
   my teacher" and every free-text score go to the review queue; the teacher's decision appears on the learner's S5.

Honest scope: the misconception diagnosis is made by code, and Jaanch phrases it. Agents do not write to the
blackboard; it is rebuilt from progress each turn. The conversation resets on each submit, so memory across
questions comes from the blackboard only. A teacher decision is shown as a message on S5; it does not rewrite the
agents' earlier feedback.

**Conflict policy (answer to the design challenge):**
1. **R1:** Correctness is never debated; code owns it.
2. **R2:** One voice at a time, at most 2 bubbles per turn, each at most 2 sentences.
3. **R3:** Disagreement is about the reason only, and appears as one explicit card.
4. **R4:** The learner chooses between Test, Continue and Ask teacher; no choice is penalised.
5. **R5:** If unresolved, it goes to the teacher, whose decision is final and shown.

**AI calls:** one serverless endpoint, `/api/agent`, so keys never reach the phone. Model chain: Groq
`openai/gpt-oss-120b` (about 1 s) → Groq `openai/gpt-oss-20b` → Gemini `gemini-3.5-flash-lite` key 1 → key 2, within a
10 s server budget; the phone waits at most 11 s. Full specification in REPORT.md D6.

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

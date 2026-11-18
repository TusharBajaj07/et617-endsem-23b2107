# Ganit Chaupal: how the AI agents are orchestrated

Code decides correctness. Three AI agents (Jaanch, Samjhao, Sawaal) only phrase, explain and challenge. A coordinator
(code) decides who speaks, passes each agent's message to the next, checks every AI line, and falls back to a
script written in advance. The teacher has the final word. Full specification: [REPORT.md D6](../REPORT.md).

## 1. Who does what

```mermaid
flowchart LR
    L([Learner]) -->|answer / question| C{{"Checker (code)<br/>right? which misconception?"}}
    C --> B[("Blackboard (code)<br/>tags per task, M1/M2 counts")]
    B --> K["Coordinator (code)<br/>who speaks, in what order"]
    K --> J["🔍 Jaanch · Evaluator (AI)<br/>says the verdict in words"]
    K --> S["🧭 Samjhao · Explainer (AI)<br/>udhaar for M1, number line for M2"]
    K --> Q["❓ Sawaal · Challenger (AI)<br/>one why / counterexample"]
    J -->|message| S
    J -->|message| Q
    S -->|stance| K
    Q -->|stance| K
    K --> V{{"Validator (code)<br/>Hindi? ≤400 chars? no answer leak?<br/>Jaanch never calls wrong right"}}
    V -->|pass| L
    V -->|fail / timeout / offline| F["Scripted line (D3)"] --> L
    K -->|disagreement, free-text score| T(["👩‍🏫 Teacher queue (C5)"])
    T -->|approve / override message| L
```

## 2. One answer in Practice (S3), step by step

```mermaid
sequenceDiagram
    autonumber
    actor L as Learner
    participant C as Checker (code)
    participant K as Coordinator (code)
    participant API as /api/agent (serverless)
    participant LLM as Groq gpt-oss-120b (keys 1→2→3)<br/>→ gpt-oss-20b → Gemini flash-lite
    participant V as Validator (code)

    L->>C: taps +7 for −4 + (−3)
    C-->>L: "✗ Not right yet" (instant, no AI)
    C->>K: { correct: false, tag: "M2" } + blackboard
    K->>K: speakers = script for M2 → [Jaanch, Samjhao]
    K->>API: Jaanch ← task, verdict, tag, attempt, blackboard, scripted line, conversation []
    API->>LLM: system prompt (COMMON + Jaanch role) + JSON
    LLM-->>API: { hi, en, stance }
    API-->>V: reply
    V-->>L: Jaanch: "The answer isn't +7, 'two minuses = plus' got used here."
    K->>API: Samjhao ← same + conversation [Jaanch's message]
    API->>LLM: system prompt (COMMON + Samjhao role) + JSON
    LLM-->>API: { hi, en, stance: agree }
    API-->>V: reply
    V-->>L: Samjhao: "A negative is ADDED: ₹4 owed + ₹3 owed… move left."
    Note over V,L: Any failure, timeout (11 s) or offline → the scripted D3 line instead
    L->>K: retry · hint ladder · "Explain it to me" (Samjhao) · "Or challenge me" (Sawaal)
```

## 3. The disagreement moment (S4, question 5)

```mermaid
flowchart TD
    A["Learner picks reason B on T5:<br/>'two minuses make a plus'"] --> B["Checker tag = shortcut<br/>(answer right, reason memorised)"]
    B --> J["🔍 Jaanch (AI): 'Your answer is right,<br/>and your reason works here.'"]
    J -->|Jaanch's message passed on, debate: true| Q["❓ Sawaal (AI): 'I disagree: a memorised rule<br/>breaks on −2 + (−5).'"]
    Q --> H{"Blackboard: M2 earlier?"}
    H -->|yes| Q2["Sawaal adds: 'In question N this rule went wrong.'"]
    H -->|no| Card
    Q2 --> Card[["🤝 Two views: you decide<br/>(correct answer not in dispute)"]]
    Card -->|Test Sawaal's example| T["Tap −2 + (−5) on the number line<br/>checked by code"]
    Card -->|My reason is fine| C2["Logged, sent to teacher"]
    Card -->|Ask my teacher| A2["Sent to teacher queue"]
    T -->|−7 ✓| P["Auto-resolved, LO2 secure"]
    T -->|+7 ✗| F["M2 tag added → LO2 needs work<br/>→ teacher queue"]
    C2 --> TQ(["👩‍🏫 Teacher: 'Jaanch is right' /<br/>'Sawaal is right' / write own"])
    A2 --> TQ
    F --> TQ
    TQ -->|message| S5["Learner sees it on 'My progress' (S5)"]
```

## 4. Agents on the Learn screen (S2)

```mermaid
flowchart LR
    C1["Card 1 tap check"] --> J1["🔍 Jaanch: right / not yet"] --> S1["🧭 Samjhao: nudge<br/>(went right of 0? count left)"]
    Any["Any card: 'Explain it to me'"] --> S2["🧭 Samjhao (AI)<br/>card text + question as context"]
    C4["Card 4"] --> Q1["❓ Sawaal: 'Is −4 + (−3) positive or negative?<br/>Guess first.'"] --> P["Prediction logged,<br/>checked by Practice question 1"]
```

## How the agents exchange information

| Channel | What passes | Where in code |
|---|---|---|
| Conversation | Each agent's reply is sent to the next agent (last 4 turns) | `speak()` in `Practice.jsx`, `TwoViews.jsx` |
| Blackboard | Learner's misconception history across all questions | `blackboard()` in `src/agents.js` |
| Stance | `agree` / `disagree` with the previous agent, shown on the bubble | `api/agent.js` → `Bubble.jsx` |
| Debate flag | Jaanch's verdict is handed to Sawaal, who must challenge it | `TwoViews.jsx` |
| Teacher queue | Disagreements and free-text scores → teacher → message to learner | `store.addReview`, `Teacher.jsx`, `reviews` table |

# Development Log

Short iterations, each ending in deployed, working software (design-based research cycles).
AI assistance (Claude Code) is used for scaffolding and implementation; every module is reviewed and
explained by the author.

| Time | Iteration | What changed | Observed / next |
|---|---|---|---|
| 2026-11-18 | 0 — Setup | Vite + React scaffold, Supabase schema, Vercel deploy pipeline, docs skeleton | Waiting for problem statement |
| 2026-11-18 | 1 — Core app | 6 screens (S1–S6), 3 agents via /api/agent (Gemini, 2 keys, 8 s budget, scripted fallback), teacher queue, clickstream, offline service worker | Live test at 412 px: M2 path, disagreement card, teacher approve → learner message all work. Gemini answers in ~2 s live |
| 2026-11-18 | 2 — Fixes from live test | Blocked Chrome auto-translate (it mistranslated चौपाल as "chapel" and froze React text, so the ID token showed S1 on S2); "code-checked" badge on Jaanch verdicts | Token now updates per screen |
| 2026-11-18 | 3 — Supabase sync | Tables learners/events/reviews (RLS on), REST outbox sync, teacher view reads all phones | Cross-device test: learner on phone A asks teacher → teacher on phone B (cleared storage) sees it and overrides → reply stored in Supabase |

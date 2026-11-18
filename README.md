# ET 617 Endsem App

| Roll no. | P | T | L | C |
|---|---|---|---|---|
| 23B2107 | P3 Multi-agent collaborative learning environment | P3-T1 Integers: operations with negative numbers (Class 7) | L1 Rural government-school student (Class 6–8), regional-language medium, parent's Android phone ~30 min/evening | C5 Teacher-in-the-loop |

Educational web app built for the ET 617 (IIT Bombay) end-semester hackathon.

- **Live:** https://et617-23b2107.vercel.app
- **Design rationale:** [DESIGN.md](DESIGN.md)
- **Development log:** [DEVLOG.md](DEVLOG.md)

## Stack
- React 19 + Vite (single-page app, mobile-first)
- Clickstream logging: localStorage first (offline-tolerant), synced to Supabase (Postgres)
- AI tutor: Vercel serverless function in `/api` (LLM key stays server-side)
- Hosting: Vercel

## Run locally
```bash
npm install
cp .env.example .env.local   # fill in Supabase URL + anon key
npm run dev
```

## Database
Run `supabase/schema.sql` once in the Supabase SQL editor.

## License
Content and code released under [CC BY 4.0](LICENSE).

**How the AI agents are orchestrated:** [docs/AI_FLOW.md](docs/AI_FLOW.md) (flow diagrams).

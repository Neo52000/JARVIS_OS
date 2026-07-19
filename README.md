# JARVIS OS — Business Operating System

A modern, AI-powered business management platform with an Iron Man HUD interface.
React frontend backed directly by **Supabase** (auth, Postgres + RLS, Edge Functions),
deployed on **Netlify**.

## Features

- **Neural Core** — Animated brain-activity visualization driven by live business data
- **Dashboard** — Overview of your business metrics, tasks, and upcoming events
- **Contacts / CRM** — Manage business contacts with search and filtering
- **Task Management** — Kanban-style task board with priorities and due dates
- **Calendar** — Event scheduling with monthly calendar view
- **Notes** — Rich note-taking with tags and search
- **AI Assistant** — Chat assistant powered by the `ai-chat` Supabase Edge Function
- **Authentication** — Supabase Auth (email/password, reset flow)

## Architecture

```
JARVIS_OS/
├── frontend/                 # React 18 + TypeScript + Vite + Tailwind (Iron Man HUD theme)
│   ├── src/
│   │   ├── api/              # Supabase queries (contacts, tasks, events, notes, AI)
│   │   ├── components/       # Layout, Sidebar, Modal, NeuralCore…
│   │   ├── pages/            # Dashboard, Contacts, Tasks, Calendar, Notes, AIChat…
│   │   ├── store/            # Zustand stores (auth)
│   │   ├── lib/supabase.ts   # Supabase client
│   │   └── types/            # TypeScript interfaces
│   └── package.json
├── supabase/                 # Versioned Supabase infrastructure
│   ├── migrations/           # Tables + indexes + RLS policies
│   └── functions/ai-chat/    # AI chat Edge Function
├── jarvis-business-os/       # Separate sub-project: multi-agent AI business system
│                             # (Mistral agents, ChromaDB memory, voice, scheduler)
└── netlify.toml              # Netlify build config (frontend)
```

The frontend talks **directly to Supabase** — there is no intermediate API server.
Data isolation between users relies on Row Level Security policies
(see `supabase/README.md`, including how to verify and apply them).

> `jarvis-business-os/` is an independent sub-project with its own README,
> requirements and run scripts. It is not part of the Netlify deployment.

## Tech Stack

- **React 18** + **TypeScript** + **Vite** + **Tailwind CSS**
- **Zustand** for state management, **Lucide** for icons
- **Supabase** — Auth, Postgres (RLS), Edge Functions (Deno)
- **Netlify** — hosting & CI for the frontend

## Quick Start

```bash
cd frontend
npm install
cp .env.example .env    # fill in your Supabase URL + anon key
npm run dev             # http://localhost:5173
```

To provision a fresh Supabase project (schema, RLS policies, Edge Function),
follow `supabase/README.md`.

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | frontend build (local `.env`, Netlify) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | frontend build (local `.env`, Netlify) | Supabase anon (public) key |
| `OPENAI_API_KEY` | Supabase Edge Function secret | Enables the AI chat |

## Deployment

Pushes to `main` trigger a Netlify build (`netlify.toml`: `npm install && npm run build`
in `frontend/`, publishes `dist/` with SPA redirects).

## License

MIT

# Supabase — schéma et fonctions versionnés

Le frontend (`frontend/`) parle **directement** à Supabase : auth (`supabase.auth`), CRUD
sur les tables `contacts`, `tasks`, `events`, `notes`, et chat IA via l'Edge Function
`ai-chat`. Ce dossier est la référence versionnée de cette infrastructure.

Projet de production : `tvpmyzxopxvoiyxgngeh` (voir `frontend/src/lib/supabase.ts`).

## Contenu

- `migrations/20260719000000_initial_schema.sql` — tables, index, triggers `updated_at`
  et **policies RLS** (chaque utilisateur ne voit que ses propres lignes).
- `functions/ai-chat/index.ts` — Edge Function du chat IA (OpenAI `gpt-4o-mini`,
  secret `OPENAI_API_KEY` requis).

## ⚠️ Vérifier le RLS en production

Le frontend interroge les tables avec la clé anon **sans filtre `user_id`** : sans RLS,
tous les utilisateurs verraient les données de tous les autres. À vérifier dans le
dashboard Supabase (Database → Tables → RLS) ou via :

```sql
select tablename, rowsecurity from pg_tables where schemaname = 'public';
```

Si `rowsecurity` est `false` quelque part, appliquer la migration de ce dossier —
elle est idempotente (`create table if not exists`, `drop policy if exists`).

## Appliquer / synchroniser

```bash
supabase link --project-ref tvpmyzxopxvoiyxgngeh
supabase db push                          # applique migrations/
supabase functions deploy ai-chat         # déploie l'Edge Function
supabase secrets set OPENAI_API_KEY=sk-…  # secret du chat IA
```

Si la production a déjà un schéma, comparer d'abord : `supabase db diff --linked`.

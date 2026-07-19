// jarvis-agent — the JARVIS brain. Claude with tool use, acting on the user's
// real data (tasks, events, contacts, notes) through Supabase under RLS.
//
// Invoked by the frontend with { messages: [{role, content}], mode? }.
// Returns { reply, actions: [{type, label}] } — actions lists what JARVIS
// actually did so the UI can confirm and refresh.
//
// Secrets: ANTHROPIC_API_KEY (supabase secrets set ANTHROPIC_API_KEY=...)
// Deployed with JWT verification on: tools run with the caller's token, so
// RLS scopes every read/write to the authenticated user.

import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

const MODEL = 'claude-opus-4-8';
const MAX_ITERATIONS = 8;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function systemPrompt(now: string): string {
  return (
    'You are JARVIS, a personal business assistant in the spirit of the film: a precise, ' +
    'unflappable butler with a hint of dry wit. You manage the user\'s contacts, tasks, ' +
    'calendar events, and notes — and you ACT: when the user asks you to create, update, ' +
    'or find something, use your tools and do it rather than merely advising. ' +
    'Confirm what you did in one short sentence. ' +
    'Always respond in the language the user writes or speaks (default to French). ' +
    'Keep replies short and speakable — they may be read aloud by a voice synthesizer, ' +
    'so avoid lists, markdown, and long enumerations unless explicitly asked. ' +
    'When a date or time is relative ("demain", "lundi prochain"), resolve it using the ' +
    'current date below and use ISO 8601 timestamps in tool calls. ' +
    'If a request is ambiguous, make the reasonable choice and note it briefly. ' +
    `\n\nCurrent date and time (Europe/Paris): ${now}`
  );
}

const tools: Anthropic.Tool[] = [
  {
    name: 'create_task',
    description:
      'Create a task for the user. Call this when the user asks to add, remember, or plan something to do.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short task title' },
        description: { type: 'string', description: 'Optional details' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        due_date: { type: 'string', description: 'ISO 8601 due date, if the user gave one' },
      },
      required: ['title'],
    },
  },
  {
    name: 'update_task_status',
    description:
      'Update the status of an existing task. Use search_data first to find the task id if you do not have it.',
    input_schema: {
      type: 'object',
      properties: {
        task_id: { type: 'string', description: 'UUID of the task (from search_data)' },
        status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
      },
      required: ['task_id', 'status'],
    },
  },
  {
    name: 'create_event',
    description: 'Create a calendar event (meeting, appointment, reminder with a time).',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        start_time: { type: 'string', description: 'ISO 8601 start' },
        end_time: { type: 'string', description: 'ISO 8601 end (default: start + 1 hour)' },
        description: { type: 'string' },
        location: { type: 'string' },
        all_day: { type: 'boolean' },
      },
      required: ['title', 'start_time'],
    },
  },
  {
    name: 'create_contact',
    description: 'Add a contact to the CRM.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        company: { type: 'string' },
        position: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['name'],
    },
  },
  {
    name: 'create_note',
    description: 'Save a note for the user.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        is_pinned: { type: 'boolean' },
      },
      required: ['title'],
    },
  },
  {
    name: 'search_data',
    description:
      'Search the user\'s contacts, tasks, events, and notes by text. Returns compact results with ids.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Text to search for' },
        types: {
          type: 'array',
          items: { type: 'string', enum: ['contacts', 'tasks', 'events', 'notes'] },
          description: 'Restrict to these types (default: all)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_agenda',
    description:
      'Get today\'s agenda: open tasks due today, overdue tasks, upcoming events (next 7 days), and quick counts. Use it for briefings and any "what is on my plate" question.',
    input_schema: { type: 'object', properties: {} },
  },
];

interface Action {
  type: string;
  label: string;
}

async function runTool(
  db: SupabaseClient,
  userId: string,
  name: string,
  input: Record<string, unknown>,
  actions: Action[],
): Promise<string> {
  switch (name) {
    case 'create_task': {
      const { data, error } = await db
        .from('tasks')
        .insert({
          user_id: userId,
          title: input.title,
          description: input.description ?? null,
          priority: input.priority ?? 'medium',
          due_date: input.due_date ?? null,
          status: 'todo',
        })
        .select('id, title')
        .single();
      if (error) throw new Error(error.message);
      actions.push({ type: 'create_task', label: `Tâche « ${data.title} » créée` });
      return JSON.stringify({ ok: true, id: data.id });
    }
    case 'update_task_status': {
      const { data, error } = await db
        .from('tasks')
        .update({ status: input.status })
        .eq('id', input.task_id)
        .select('id, title, status')
        .single();
      if (error) throw new Error(error.message);
      actions.push({ type: 'update_task', label: `Tâche « ${data.title} » → ${data.status}` });
      return JSON.stringify({ ok: true, id: data.id, status: data.status });
    }
    case 'create_event': {
      const start = new Date(input.start_time as string);
      const end = input.end_time
        ? new Date(input.end_time as string)
        : new Date(start.getTime() + 60 * 60 * 1000);
      const { data, error } = await db
        .from('events')
        .insert({
          user_id: userId,
          title: input.title,
          description: input.description ?? null,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          location: input.location ?? null,
          all_day: input.all_day ?? false,
        })
        .select('id, title')
        .single();
      if (error) throw new Error(error.message);
      actions.push({ type: 'create_event', label: `Rendez-vous « ${data.title} » créé` });
      return JSON.stringify({ ok: true, id: data.id });
    }
    case 'create_contact': {
      const { data, error } = await db
        .from('contacts')
        .insert({
          user_id: userId,
          name: input.name,
          email: input.email ?? null,
          phone: input.phone ?? null,
          company: input.company ?? null,
          position: input.position ?? null,
          notes: input.notes ?? null,
        })
        .select('id, name')
        .single();
      if (error) throw new Error(error.message);
      actions.push({ type: 'create_contact', label: `Contact « ${data.name} » ajouté` });
      return JSON.stringify({ ok: true, id: data.id });
    }
    case 'create_note': {
      const { data, error } = await db
        .from('notes')
        .insert({
          user_id: userId,
          title: input.title,
          content: input.content ?? null,
          tags: input.tags ?? [],
          is_pinned: input.is_pinned ?? false,
        })
        .select('id, title')
        .single();
      if (error) throw new Error(error.message);
      actions.push({ type: 'create_note', label: `Note « ${data.title} » enregistrée` });
      return JSON.stringify({ ok: true, id: data.id });
    }
    case 'search_data': {
      const q = `%${input.query}%`;
      const types = (input.types as string[] | undefined) ?? ['contacts', 'tasks', 'events', 'notes'];
      const out: Record<string, unknown[]> = {};
      if (types.includes('contacts')) {
        const { data } = await db
          .from('contacts')
          .select('id, name, email, company')
          .or(`name.ilike.${q},email.ilike.${q},company.ilike.${q}`)
          .limit(5);
        out.contacts = data ?? [];
      }
      if (types.includes('tasks')) {
        const { data } = await db
          .from('tasks')
          .select('id, title, status, priority, due_date')
          .ilike('title', q)
          .limit(5);
        out.tasks = data ?? [];
      }
      if (types.includes('events')) {
        const { data } = await db
          .from('events')
          .select('id, title, start_time, location')
          .ilike('title', q)
          .limit(5);
        out.events = data ?? [];
      }
      if (types.includes('notes')) {
        const { data } = await db
          .from('notes')
          .select('id, title')
          .or(`title.ilike.${q},content.ilike.${q}`)
          .limit(5);
        out.notes = data ?? [];
      }
      return JSON.stringify(out);
    }
    case 'get_agenda': {
      const now = new Date();
      const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(now); dayEnd.setHours(23, 59, 59, 999);
      const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const [dueToday, overdue, upcoming, openCount] = await Promise.all([
        db.from('tasks').select('id, title, priority')
          .neq('status', 'done')
          .gte('due_date', dayStart.toISOString())
          .lte('due_date', dayEnd.toISOString()),
        db.from('tasks').select('id, title, priority')
          .neq('status', 'done')
          .lt('due_date', dayStart.toISOString()),
        db.from('events').select('id, title, start_time, location')
          .gte('start_time', now.toISOString())
          .lte('start_time', weekEnd.toISOString())
          .order('start_time')
          .limit(10),
        db.from('tasks').select('id', { count: 'exact', head: true }).neq('status', 'done'),
      ]);
      return JSON.stringify({
        tasks_due_today: dueToday.data ?? [],
        tasks_overdue: overdue.data ?? [],
        upcoming_events: upcoming.data ?? [],
        open_tasks_count: openCount.count ?? 0,
      });
    }
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  let history: { role: 'user' | 'assistant'; content: string }[];
  try {
    const body = await req.json();
    history = body.messages;
  } catch (_err) {
    return json({ error: 'Invalid JSON body' }, 400);
  }
  if (!Array.isArray(history) || history.length === 0) {
    return json({ error: 'messages array is required' }, 400);
  }
  const valid = history.every(
    (m) => m && typeof m === 'object' && (m.role === 'user' || m.role === 'assistant') &&
      typeof m.content === 'string',
  );
  if (!valid) {
    return json({ error: 'Each message must have role user|assistant and string content' }, 400);
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return json({
      reply: "Je ne suis pas encore configuré : le secret ANTHROPIC_API_KEY manque sur cette Edge Function.",
      actions: [],
    });
  }

  // Supabase client bound to the caller's JWT — RLS scopes everything to them.
  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
  );
  const { data: userData, error: userError } = await db.auth.getUser();
  if (userError || !userData?.user) {
    return json({ error: 'Unauthorized' }, 401);
  }
  const userId = userData.user.id;

  const now = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  }).format(new Date());

  const anthropic = new Anthropic({ apiKey });
  const messages: Anthropic.MessageParam[] = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));
  const actions: Action[] = [];

  try {
    let response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'medium' },
      system: systemPrompt(now),
      tools,
      messages,
    });

    for (let i = 0; i < MAX_ITERATIONS && response.stop_reason === 'tool_use'; i++) {
      messages.push({ role: 'assistant', content: response.content });
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type !== 'tool_use') continue;
        try {
          const result = await runTool(
            db, userId, block.name, block.input as Record<string, unknown>, actions,
          );
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
        } catch (err) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: `Error: ${err instanceof Error ? err.message : String(err)}`,
            is_error: true,
          });
        }
      }
      messages.push({ role: 'user', content: toolResults });
      response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 4096,
        thinking: { type: 'adaptive' },
        output_config: { effort: 'medium' },
        system: systemPrompt(now),
        tools,
        messages,
      });
    }

    const reply = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    return json({
      reply: reply || "À votre service. (Je n'ai rien à ajouter.)",
      actions,
    });
  } catch (err) {
    console.error('jarvis-agent error:', err);
    return json({ error: 'AI service error' }, 502);
  }
});

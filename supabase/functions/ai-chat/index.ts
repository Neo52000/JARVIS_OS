// ai-chat — Edge Function invoked by the frontend (frontend/src/api/endpoints.ts).
// Receives { messages: [{ role, content }] } and returns { reply }.
// Requires the OPENAI_API_KEY secret: supabase secrets set OPENAI_API_KEY=...
// Deployed with JWT verification on (default), so only authenticated users can call it.

const SYSTEM_PROMPT =
  'You are JARVIS, an AI business assistant. You help users manage their ' +
  'business operations including tasks, contacts, calendar events, and notes. ' +
  'Be concise, professional, and helpful. When asked about business topics, ' +
  'provide actionable advice.';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          reply:
            'AI assistant is not configured. Set the OPENAI_API_KEY secret on this Edge Function.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `AI service error: ${response.status}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(
      JSON.stringify({ reply: data.choices[0].message.content, usage: data.usage ?? null }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (_err) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

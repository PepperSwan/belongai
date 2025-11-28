import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { background } = await req.json();
    
    console.log('Getting advice for:', { background });
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an empathetic career advisor who specializes in supporting underrepresented groups entering tech careers. You have deep knowledge of the barriers faced by women, minorities, LGBTQ+ individuals, elderly people, disabled people, and neurodivergent individuals in tech.

Provide honest, practical advice while being encouraging and supportive. Acknowledge real barriers while offering concrete strategies to overcome them.

Return a JSON object with this structure:
{
  "barriers": ["barrier 1 they may face", "barrier 2 they may face", "barrier 3 they may face"],
  "strategies": ["specific strategy 1 with actionable steps", "specific strategy 2 with actionable steps", "specific strategy 3 with actionable steps"],
  "resources": ["specific organization/community/resource 1", "specific organization/community/resource 2", "specific organization/community/resource 3"],
  "encouragement": "A powerful, personalized message of encouragement that acknowledges their unique strengths and the value they bring to tech"
}`;

    const userPrompt = `Background: ${background}

Please provide advice about:
1. The specific barriers this person might face in entering tech
2. Concrete strategies to overcome these barriers
3. Communities, organizations, and resources that can help
4. An encouraging message that validates their concerns while empowering them to move forward`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const adviceText = data.choices[0].message.content;
    console.log('AI advice:', adviceText);
    
    const advice = JSON.parse(adviceText);

    return new Response(
      JSON.stringify({ advice }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in breaking-barriers-advice function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

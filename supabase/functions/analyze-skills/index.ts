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
    const { experience, skills, targetRole } = await req.json();
    
    console.log('Analyzing skills for:', { experience, skills, targetRole });
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a career adviser specialising in tech transitions. Analyse the user's background and provide insights on how their skills translate to their target tech role. Be encouraging and specific.

IMPORTANT: In your "recommendedPath", you MUST recommend specific courses from the app's LEARNING section. The available roles with courses are:
- Data Analyst
- UX Designer  
- Software Engineer
- Product Manager
- DevOps Engineer
- QA Tester
- Data Scientist
- Business Analyst
- Technical Writer
- Technical Project Manager
- Technical Support Engineer
- Cybersecurity Analyst

You should recommend following one or more of these courses in the app based on their target role. You may suggest external activities like networking at local tech communities, attending meetups, seeking job opportunities, or contributing to open source projects, but NEVER recommend external learning providers (like Duolingo, Coursera, Udemy, Brilliant, etc.). Keep the focus on using this app's courses for learning.

Use British English throughout (e.g., "analyse", "specialise", "organisation", "colour").

Return a JSON object with this structure:
{
  "transferableSkills": ["skill1 - explanation", "skill2 - explanation"],
  "skillGaps": ["gap1 - why needed", "gap2 - why needed"],
  "recommendedPath": "detailed paragraph about the learning path that includes specific courses from the LEARNING section of this app",
  "matchScore": 75,
  "encouragement": "personalised encouraging message"
}`;

    const userPrompt = `Current Experience: ${experience}

Current Skills: ${skills}

Target Role: ${targetRole}

Analyse how this person's background translates to their target role. Be specific about which of their existing skills are valuable and which new skills they should develop. Remember to recommend specific courses from the app's LEARNING section.`;

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
    const analysisText = data.choices[0].message.content;
    console.log('AI analysis:', analysisText);
    
    const analysis = JSON.parse(analysisText);

    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in analyze-skills function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

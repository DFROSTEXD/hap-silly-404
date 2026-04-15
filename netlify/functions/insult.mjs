/*
 * insult.mjs — Serverless function that generates a passive-aggressive 404 roast
 *
 * GET /.netlify/functions/insult
 * Returns: { insult: "..." }
 *
 * The Groq API is called with a short roast prompt. If the API is unavailable
 * or rate-limited (free tier), one of the fallback insults is returned instead.
 */

const FALLBACK_INSULTS = [
  "Wow. You managed to find a page that doesn't exist. That's almost impressive.",
  "404. Even HAP's map couldn't find this one, and HAP has a very good map.",
  "You typed something. The server looked. Nothing. You're welcome.",
  "This page has been gone longer than your browser history. Take the hint.",
  "Congratulations! You've discovered the void. The void is not impressed.",
  "HAP checked twice. Still not here. HAP is very thorough.",
  "The page you wanted called in sick. It did not leave a note.",
  "Error 404: page not found. Error 100%: this is your fault.",
];

export const config = {
  rateLimit: {
    windowSize: 60,
    windowLimit: 10,
    aggregateBy: ["ip"],
  },
};

const ALLOWED_ORIGIN = process.env.SITE_URL || "*";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
};

export default async function handler(request) {
  if (request.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use GET." }),
      { status: 405, headers: CORS_HEADERS }
    );
  }

  const apiKey = process.env.GROQ_API_KEY;

  /* No API key — return a fallback rather than an error */
  if (!apiKey) {
    return new Response(
      JSON.stringify({ insult: randomFallback(), source: "fallback" }),
      { status: 200, headers: CORS_HEADERS }
    );
  }

  const ANGLES = [
    "blame their typing skills",
    "sympathize with the missing page",
    "narrate it like a nature documentary",
    "deliver it as breaking news",
    "write it as a fortune cookie",
    "say it like a disappointed librarian",
    "frame it as a sports commentary",
    "present it as a weather forecast",
    "deliver it like a flight attendant announcement",
    "say it like a detective solving the case",
    "phrase it as a restaurant review",
    "deliver it as a voicemail from the page that left",
  ];

  const angle = ANGLES[Math.floor(Math.random() * ANGLES.length)];

  try {
    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "You write short, witty one-liners for a fun 404 error page. Keep it clean, lighthearted, and family-friendly. No profanity, slurs, insults about identity, or mean-spirited content. Poke fun at the situation, never the person.",
            },
            {
              role: "user",
              content: `Write a one-liner roast for someone who just hit a 404 page. Angle: ${angle}. Under 25 words. No hashtags, no emojis. Dry wit only.`,
            },
          ],
          max_tokens: 60,
          temperature: 0.8,
        }),
      }
    );

    /* Rate limited or API error — fall back gracefully */
    if (!response.ok) {
      console.warn(`Groq API returned ${response.status}`);
      return new Response(
        JSON.stringify({ insult: randomFallback(), source: "fallback" }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    const data = await response.json();
    const insult = data.choices[0].message.content.trim();

    return new Response(
      JSON.stringify({ insult, source: "groq" }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch {
    /* Network error — fall back gracefully */
    return new Response(
      JSON.stringify({ insult: randomFallback(), source: "fallback" }),
      { status: 200, headers: CORS_HEADERS }
    );
  }
}

function randomFallback() {
  return FALLBACK_INSULTS[Math.floor(Math.random() * FALLBACK_INSULTS.length)];
}

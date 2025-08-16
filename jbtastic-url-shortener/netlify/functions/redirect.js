export async function handler(event, context) {
  const slug = event.queryStringParameters.slug;

  console.log("Query Parameters:", event.queryStringParameters);

  if (!slug) {
    return {
      statusCode: 400,
      body: "Missing slug"
    };
  }

  // Supabase-URL and Anon Key from Environment Variables
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/links?slug=eq.${slug}`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json"
    }
  });

  const data = await response.json();

  console.log("Data:", data);

  if (!data || data.length === 0) {
    return {
      statusCode: 404,
      body: "Shortlink not found"
    };
  }

  const originalUrl = data[0].original_url;

  return {
    statusCode: 302,
    headers: {
      Location: originalUrl
    }
  };
}

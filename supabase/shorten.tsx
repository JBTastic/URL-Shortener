import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);
// CORS Header
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info"
};
serve(async (req)=>{
  // Preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { url } = await req.json();
    if (!url || !url.startsWith("https://")) {
      return new Response(JSON.stringify({
        error: "Invalid URL"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    // Check if URL already exists
    const { data } = await supabase.from("urls").select("slug").eq("original", url).single();
    if (data) {
      return new Response(JSON.stringify({
        slug: data.slug
      }), {
        status: 200,
        headers: corsHeaders
      });
    }
    // Generate unique slug
    let slug;
    while(true){
      slug = Math.random().toString(36).substring(2, 8);
      const { data: exists } = await supabase.from("urls").select("id").eq("slug", slug).single();
      if (!exists) break;
    }
    // Insert
    await supabase.from("urls").insert({
      original: url,
      slug
    });
    return new Response(JSON.stringify({
      slug
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});

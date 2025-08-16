import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info"
};
serve(async (req)=>{
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
    // Prüfen, ob URL schon existiert
    const { data: existing, error: existingError } = await supabase.from("links").select("slug").eq("original_url", url).single();
    if (existingError && existingError.code !== "PGRST116") {
      // PGRST116 = no rows found, das ist ok
      throw new Error(existingError.message);
    }
    if (existing) {
      return new Response(JSON.stringify({
        slug: existing.slug
      }), {
        status: 200,
        headers: corsHeaders
      });
    }
    // Eindeutigen Slug generieren
    let slug;
    while(true){
      slug = Math.random().toString(36).substring(2, 8);
      const { data: exists } = await supabase.from("links").select("id").eq("slug", slug).single();
      if (!exists) break;
    }
    // Insert und gleich das Insert-Ergebnis zurückgeben
    const { data: inserted, error: insertError } = await supabase.from("links").insert({
      original_url: url,
      slug
    }).select().single();
    if (insertError || !inserted) {
      throw new Error(insertError?.message || "Failed to insert URL");
    }
    return new Response(JSON.stringify({
      slug: inserted.slug
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    console.error("Edge Function Error:", err);
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});

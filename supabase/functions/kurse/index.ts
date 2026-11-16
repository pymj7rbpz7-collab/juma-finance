// pairo: aktuelle Kurse für die Rubrik "Kurse". Holt öffentliche Kursdaten und reicht sie an die App weiter.
// Feste Liste, keine Nutzerdaten. Nur für angemeldete Nutzer dieses Projekts; Antworten werden 60 Sekunden zwischengespeichert.
// Einspielen: supabase functions deploy kurse --no-verify-jwt (die Anmeldung prüft die Funktion selbst, siehe signedIn).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SYMBOLS = ["AAPL", "ONON", "SPCX", "TSLA", "PLTR", "BTC-USD", "FET-USD", "USDCHF=X", "EURCHF=X"];
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";
let cache: { t: number; body: string } | null = null;
const known = new Map<string, number>(); // geprüfte Anmeldungen, je 5 Minuten gültig

async function get(url: string, headers: Record<string, string> = {}): Promise<Response> {
  const ac = new AbortController(), timer = setTimeout(() => ac.abort(), 6000);
  try { return await fetch(url, { headers: { "User-Agent": UA, "Accept": "application/json,text/csv,*/*", ...headers }, signal: ac.signal }); }
  finally { clearTimeout(timer); }
}

// Fragt den Anmeldedienst des Projekts, ob das mitgeschickte Token zu einem angemeldeten Nutzer gehört
async function signedIn(req: Request): Promise<boolean> {
  const auth = req.headers.get("Authorization") || "", apikey = req.headers.get("apikey") || "";
  if (!/^Bearer\s+\S{20,}$/.test(auth) || !apikey) return false;
  const now = Date.now(), hit = known.get(auth);
  if (hit && hit > now) return true;
  try {
    const r = await get(Deno.env.get("SUPABASE_URL") + "/auth/v1/user", { Authorization: auth, apikey });
    const ok = r.ok && !!(await r.json())?.id;
    if (ok) { if (known.size > 200) known.clear(); known.set(auth, now + 300000); }
    return ok;
  } catch (_e) { return false; }
}

async function yahoo(sym: string) {
  let last = "";
  for (const host of ["query1", "query2"]) {
    try {
      const r = await get(`https://${host}.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=1d&interval=1d`);
      if (!r.ok) { last = "yahoo " + r.status; await r.body?.cancel(); continue; }
      const m = (await r.json())?.chart?.result?.[0]?.meta;
      if (!m || typeof m.regularMarketPrice !== "number") { last = "yahoo leer"; continue; }
      const prev = typeof m.chartPreviousClose === "number" ? m.chartPreviousClose : typeof m.previousClose === "number" ? m.previousClose : null;
      return { price: m.regularMarketPrice, prev, cur: m.currency || "USD", time: m.regularMarketTime || null, src: "yahoo" };
    } catch (e) { last = "yahoo " + (e instanceof Error ? e.name : "Fehler"); }
  }
  throw new Error(last || "yahoo");
}

// Ersatzquelle für US-Aktien, falls die erste Quelle nicht antwortet (Veränderung dann seit Eröffnung)
async function stooq(sym: string) {
  if (!/^[A-Z]+$/.test(sym)) throw new Error("kein Ersatz");
  const r = await get(`https://stooq.com/q/l/?s=${sym.toLowerCase()}.us&f=sd2t2ohlc&h&e=csv`);
  if (!r.ok) { await r.body?.cancel(); throw new Error("stooq " + r.status); }
  const line = (await r.text()).trim().split(/\r?\n/)[1] || "", c = line.split(",");
  const open = Number(c[3]), close = Number(c[6]);
  if (!isFinite(close) || close <= 0) throw new Error("stooq leer");
  return { price: close, prev: isFinite(open) && open > 0 ? open : null, cur: "USD", time: null, src: "stooq" };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const head = { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" };
  if (!(await signedIn(req))) return new Response(JSON.stringify({ error: "nicht angemeldet" }), { status: 401, headers: head });
  if (cache && Date.now() - cache.t < 60000) return new Response(cache.body, { headers: head });
  const q: Record<string, unknown> = {};
  await Promise.all(SYMBOLS.map(async (s) => {
    try { q[s] = await yahoo(s); }
    catch (e1) {
      try { q[s] = await stooq(s); }
      catch (e2) { q[s] = { err: (e1 instanceof Error ? e1.message : "") + " / " + (e2 instanceof Error ? e2.message : "") }; }
    }
  }));
  const body = JSON.stringify({ t: Date.now(), q });
  if (Object.values(q).some((v) => v && typeof (v as { price?: number }).price === "number")) cache = { t: Date.now(), body };
  return new Response(body, { headers: head });
});

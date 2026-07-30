// ============================================================
//  Función serverless de Vercel: /api/ics-proxy
//  El navegador no puede bajar el .ics de Google directamente
//  (lo bloquea CORS). Esta función hace de intermediario:
//  recibe la URL del calendario, baja el .ics y lo devuelve
//  con los headers CORS que el navegador necesita.
//
//  Seguridad: solo acepta URLs de google.com, así nadie puede
//  usar esta función como proxy hacia otros sitios.
// ============================================================

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "authorization, x-client-info, apikey, content-type");

  if (req.method === "OPTIONS") {
    res.status(200).send("ok");
    return;
  }

  try {
    let url = "";
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      url = body.url || "";
    } else {
      url = (req.query && req.query.url) || "";
    }

    if (!url) {
      res.status(400).json({ error: "Falta la URL del calendario." });
      return;
    }

    url = String(url).replace(/^webcal:\/\//i, "https://");
    let host = "";
    try { host = new URL(url).hostname.toLowerCase(); } catch { host = ""; }
    if (!(host === "calendar.google.com" || host.endsWith(".google.com"))) {
      res.status(403).json({ error: "Solo se permiten URLs de Google Calendar." });
      return;
    }

    const upstream = await fetch(url, { headers: { "User-Agent": "ics-proxy" } });
    if (!upstream.ok) {
      res.status(502).json({ error: "Google respondió " + upstream.status + ". Revisá que la URL secreta sea correcta." });
      return;
    }

    const text = await upstream.text();
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.status(200).send(text);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}

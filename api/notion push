// ============================================================
//  Función serverless de Vercel: /api/notion-push
//
//  Empuja una tarea de Supabase a Notion. Si la fila todavía no
//  tiene notion_page_id, crea la página. Si ya lo tiene, la
//  actualiza.
//
//  El token de Notion NO puede estar en el navegador: a
//  diferencia de la anon key de Supabase, no está protegido por
//  RLS. Vive acá, como variable de entorno.
//
//  Autenticación: el navegador manda su access token de Supabase
//  en el header Authorization. Esta función lo reenvía a Supabase
//  tal cual, así que RLS sigue aplicando y cada usuario sólo
//  puede empujar sus propias tareas.
//
//  Variables de entorno necesarias en Vercel:
//    SUPABASE_URL        la misma URL que está en config.js
//    SUPABASE_ANON_KEY   la misma anon key que está en config.js
//    NOTION_TOKEN        token interno de la integración de Notion
//    NOTION_TAREAS_DS    id del data source de la base Tareas
// ============================================================

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2025-09-03";

// app → Notion. El inverso vive en notion-hook.js; si tocás uno,
// tocá el otro.
const ESTADO = {
  sin: "Sin iniciar",
  urg: "Urgente",
  proc: "En proceso",
  comp: "Completado",
  desc: "Descartado",
};

const RECUR = {
  diaria: "Diaria",
  semanal: "Semanal",
  quincenal: "Quincenal",
  mensual: "Mensual",
  trimestral: "Trimestral",
  anual: "Anual",
};

const text = (s) => (s ? [{ type: "text", text: { content: String(s).slice(0, 2000) } }] : []);
const select = (name) => (name ? { select: { name } } : { select: null });

function notionProps(task) {
  return {
    "Tarea": { title: text(task.title || "(sin título)") },
    "ID app": { rich_text: text(task.id) },
    "Estado": select(ESTADO[task.status] || "Sin iniciar"),
    "Vence": { date: task.due ? { start: task.due } : null },
    "Área": select(task.area),
    "Responsable": select(task.resp),
    "Recurrencia": select(RECUR[task.recur]),
    "Link": { url: task.url || null },
    "Detalle": { rich_text: text(task.detail) },
  };
}

async function notion(path, method, body) {
  const r = await fetch(NOTION_API + path, {
    method,
    headers: {
      "Authorization": "Bearer " + process.env.NOTION_TOKEN,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json();
  if (!r.ok) throw new Error("Notion " + r.status + ": " + (data.message || "error desconocido"));
  return data;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "authorization, content-type");

  if (req.method === "OPTIONS") {
    res.status(200).send("ok");
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Sólo POST." });
    return;
  }

  try {
    const { SUPABASE_URL, SUPABASE_ANON_KEY, NOTION_TOKEN, NOTION_TAREAS_DS } = process.env;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !NOTION_TOKEN || !NOTION_TAREAS_DS) {
      res.status(500).json({ error: "Faltan variables de entorno en Vercel." });
      return;
    }

    const auth = req.headers.authorization || "";
    if (!/^Bearer\s+\S/i.test(auth)) {
      res.status(401).json({ error: "Falta el token de sesión." });
      return;
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const taskId = body.taskId || "";
    if (!taskId) {
      res.status(400).json({ error: "Falta taskId." });
      return;
    }

    // Leemos la tarea con el token del usuario. Si no es suya, RLS
    // devuelve cero filas y cortamos acá.
    const q = await fetch(
      SUPABASE_URL + "/rest/v1/tasks?id=eq." + encodeURIComponent(taskId) + "&select=*",
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: auth } }
    );
    const rows = await q.json();
    if (!q.ok) {
      res.status(502).json({ error: "Supabase: " + (rows.message || q.status) });
      return;
    }
    if (!Array.isArray(rows) || !rows.length) {
      res.status(404).json({ error: "Tarea no encontrada." });
      return;
    }

    const task = rows[0];
    const props = notionProps(task);
    let pageId = task.notion_page_id || null;

    if (pageId) {
      // Ya existe: la actualizamos. Si alguien la borró del lado de
      // Notion, el 404 nos hace crearla de nuevo.
      try {
        await notion("/pages/" + pageId, "PATCH", { properties: props });
      } catch (e) {
        if (!/Notion 404/.test(String(e))) throw e;
        pageId = null;
      }
    }

    if (!pageId) {
      const page = await notion("/pages", "POST", {
        parent: { type: "data_source_id", data_source_id: NOTION_TAREAS_DS },
        properties: props,
      });
      pageId = page.id;
    }

    // Guardamos el vínculo y el momento del push.
    await fetch(SUPABASE_URL + "/rest/v1/tasks?id=eq." + encodeURIComponent(taskId), {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: auth,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        notion_page_id: pageId,
        notion_synced_at: new Date().toISOString(),
        sync_notion: true,
      }),
    });

    res.status(200).json({ ok: true, pageId });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}

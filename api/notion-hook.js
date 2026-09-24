// ============================================================
//  Función serverless de Vercel: /api/notion-hook
//
//  Recibe el POST de la automatización de Notion ("Enviar
//  webhook") cuando cambia el Estado de una tarea, y lo escribe
//  de vuelta en Supabase.
//
//  No confiamos en la forma del payload: sacamos el id de la
//  página y le volvemos a preguntar a Notion cuál es su estado
//  actual. Así, si Notion cambia el formato del body, esto sigue
//  funcionando.
//
//  Corte del loop de eco: si el estado que viene de Notion ya es
//  el que tiene la fila, no escribimos nada. Sin esto, el push
//  dispara el webhook, el webhook escribe en la app, la app
//  vuelve a empujar, y no para más.
//
//  Variables de entorno necesarias en Vercel:
//    SUPABASE_URL                 la misma URL que está en config.js
//    SUPABASE_SERVICE_ROLE_KEY    ¡SECRETA! Supabase → Project
//                                 Settings → API → service_role.
//                                 Saltea RLS. Nunca en el cliente.
//    NOTION_TOKEN                 token interno de la integración
//    NOTION_HOOK_SECRET           cadena larga inventada por vos
// ============================================================

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2025-09-03";

// Notion → app. El inverso vive en notion-push.js.
const ESTADO = {
  "Sin iniciar": "sin",
  "Urgente": "urg", // no es un estado: se traduce a prioridad alta (ver abajo)
  "En proceso": "proc",
  "Completado": "comp",
  "Descartado": "desc",
};

// Notion manda ids con guiones o sin ellos según el contexto.
const norm = (id) => String(id || "").replace(/-/g, "");

function findPageId(payload) {
  if (!payload || typeof payload !== "object") return "";
  // Probamos las ubicaciones habituales antes de buscar a ciegas.
  const direct =
    payload.pageId ||
    payload.page_id ||
    (payload.data && payload.data.id) ||
    (payload.entity && payload.entity.id) ||
    payload.id;
  if (direct) return direct;

  // Último recurso: el primer UUID que aparezca en el cuerpo.
  const m = JSON.stringify(payload).match(
    /[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}/i
  );
  return m ? m[0] : "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Sólo POST." });
    return;
  }

  try {
    const {
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      NOTION_TOKEN,
      NOTION_HOOK_SECRET,
    } = process.env;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !NOTION_TOKEN || !NOTION_HOOK_SECRET) {
      res.status(500).json({ error: "Faltan variables de entorno en Vercel." });
      return;
    }

    // Esta URL es pública. El secreto es lo único que impide que
    // cualquiera escriba en tu base. Va en la query string o en un
    // header, según cómo configures la automatización.
    const given = (req.query && req.query.key) || req.headers["x-sync-secret"] || "";
    if (given !== NOTION_HOOK_SECRET) {
      res.status(401).json({ error: "No autorizado." });
      return;
    }

    const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const pageId = findPageId(payload);
    if (!pageId) {
      res.status(400).json({ error: "No pude encontrar el id de la página en el payload." });
      return;
    }

    // Le preguntamos a Notion el estado actual en vez de confiar
    // en el body.
    const r = await fetch(NOTION_API + "/pages/" + pageId, {
      headers: {
        Authorization: "Bearer " + NOTION_TOKEN,
        "Notion-Version": NOTION_VERSION,
      },
    });
    const page = await r.json();
    if (!r.ok) {
      res.status(502).json({ error: "Notion " + r.status + ": " + (page.message || "") });
      return;
    }

    const props = page.properties || {};
    const estadoNotion = props["Estado"] && props["Estado"].select && props["Estado"].select.name;
    const status = ESTADO[estadoNotion];
    if (!status) {
      // Estado vacío o con un nombre que no conocemos. No inventamos.
      res.status(200).json({ ok: true, skipped: "estado desconocido: " + estadoNotion });
      return;
    }

    // Preferimos el "ID app" si está cargado; si no, buscamos por
    // notion_page_id.
    const idApp =
      props["ID app"] &&
      Array.isArray(props["ID app"].rich_text) &&
      props["ID app"].rich_text.map((t) => t.plain_text).join("").trim();

    const sbHeaders = {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
    };

    const filter = idApp
      ? "id=eq." + encodeURIComponent(idApp)
      : "notion_page_id=eq." + encodeURIComponent(norm(pageId));

    const q = await fetch(SUPABASE_URL + "/rest/v1/tasks?" + filter + "&select=id,status,prio", {
      headers: sbHeaders,
    });
    const rows = await q.json();
    if (!Array.isArray(rows) || !rows.length) {
      res.status(200).json({ ok: true, skipped: "sin fila equivalente en la app" });
      return;
    }

    // "Urgente" en Notion = prioridad alta en la app. Si la tarea estaba
    // cerrada, la reabrimos; si estaba abierta, conservamos su estado.
    const row = rows[0];
    let patch;
    if (status === "urg") {
      const cerrada = row.status === "comp" || row.status === "desc";
      patch = { prio: "alta", status: cerrada ? "sin" : (row.status === "urg" ? "sin" : row.status) };
    } else {
      patch = { status };
    }

    // Acá se corta el eco.
    if (patch.status === row.status && (!patch.prio || patch.prio === row.prio)) {
      res.status(200).json({ ok: true, skipped: "ya estaba en ese estado" });
      return;
    }

    const upd = await fetch(SUPABASE_URL + "/rest/v1/tasks?id=eq." + encodeURIComponent(row.id), {
      method: "PATCH",
      headers: { ...sbHeaders, Prefer: "return=minimal" },
      body: JSON.stringify({ ...patch, notion_synced_at: new Date().toISOString() }),
    });
    if (!upd.ok) {
      const e = await upd.text();
      res.status(502).json({ error: "Supabase: " + e });
      return;
    }

    res.status(200).json({ ok: true, taskId: row.id, ...patch });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}

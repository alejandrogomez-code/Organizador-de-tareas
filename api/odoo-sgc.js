// ============================================================
//  Función serverless de Vercel: /api/odoo-sgc
//
//  Lee el Sistema de Gestión de Calidad (SGC) del Odoo de DEAM
//  y lo devuelve a la pestaña "✦ Sistema de Calidad" del Panel.
//  Solo lectura: los hallazgos, mejoras y procedimientos se
//  editan en Odoo.
//
//  Reemplaza la conexión vieja con la app deam-calidad (tablas
//  externas cal_hallazgos / cal_mejoras / cal_procedimientos de
//  Supabase).
//
//  Usa la API JSON-2 de Odoo 19 con la clave API del usuario de
//  Alejandro. La clave NO puede estar en el navegador: vive acá,
//  como variable de entorno.
//
//  Autenticación: el navegador manda su access token de Supabase
//  en el header Authorization. Se valida contra Supabase antes de
//  consultar Odoo, así que solo una sesión iniciada en el Panel
//  puede leer el SGC.
//
//  Variables de entorno necesarias en Vercel:
//    SUPABASE_URL        la misma URL que está en config.js
//    SUPABASE_ANON_KEY   la misma anon key que está en config.js
//    ODOO_URL            https://deam.odoo.com
//    ODOO_DB             aitic-deam-19-0-28953703
//    ODOO_API_KEY        clave API del usuario alejandro.gomez@deam.com.ar
//                        (Odoo → Mi perfil → Seguridad → Claves API)
//  Opcional:
//    PANEL_ALLOWED_EMAILS  emails (separados por coma) que pueden leer
// ============================================================

const EST_HALLAZGO = { abierto: "Abierto", tratamiento: "En tratamiento", cerrado: "Cerrado", descartado: "Descartado" };
const SEVERIDAD = { menor: "Menor", mayor: "Mayor", critica: "Crítica" };
const EST_MEJORA = { propuesta: "Propuesta", implementacion: "En implementación", implementada: "Implementada", verificada: "Verificada", descartada: "Descartada" };
const EST_PROC = { borrador: "Borrador", en_revision: "En revisión", en_firma: "En firma", vigente: "Vigente", obsoleto: "Obsoleto" };

const m2o = (v) => (Array.isArray(v) ? v[1] : "");
const str = (v) => (v === false || v == null ? "" : String(v));

async function odoo(model, method, body) {
  const base = process.env.ODOO_URL.replace(/\/+$/, "");
  const r = await fetch(`${base}/json/2/${model}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": "bearer " + process.env.ODOO_API_KEY,
      "X-Odoo-Database": process.env.ODOO_DB,
    },
    body: JSON.stringify(body || {}),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Odoo ${model}.${method}: ${j.message || j.name || r.status}`);
  return j;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "authorization, content-type");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") { res.status(200).send("ok"); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Sólo GET." }); return; }

  try {
    const { SUPABASE_URL, SUPABASE_ANON_KEY, ODOO_URL, ODOO_DB, ODOO_API_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !ODOO_URL || !ODOO_DB || !ODOO_API_KEY) {
      res.status(500).json({ error: "Faltan variables de entorno en Vercel (ODOO_URL, ODOO_DB, ODOO_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY)." });
      return;
    }

    // 1) Validar la sesión del Panel
    const auth = req.headers.authorization || "";
    if (!/^Bearer\s+\S/i.test(auth)) { res.status(401).json({ error: "Falta el token de sesión." }); return; }
    const u = await fetch(SUPABASE_URL + "/auth/v1/user", { headers: { apikey: SUPABASE_ANON_KEY, Authorization: auth } });
    if (!u.ok) { res.status(401).json({ error: "Sesión inválida o vencida." }); return; }
    const user = await u.json();
    const allowed = (process.env.PANEL_ALLOWED_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (allowed.length && !allowed.includes(String(user.email || "").toLowerCase())) {
      res.status(403).json({ error: "Usuario sin acceso al SGC." }); return;
    }

    // 2) Leer el SGC
    const base = ODOO_URL.replace(/\/+$/, "");
    const [hal, mej, proc] = await Promise.all([
      odoo("x_sgc_hallazgo", "search_read", {
        domain: [],
        fields: ["x_name", "x_fecha_deteccion", "x_area_id", "x_resumen", "x_resumen_corto", "x_severidad", "x_estado", "x_responsable_id", "x_responsable_otro", "x_fecha_cierre"],
        order: "x_fecha_deteccion desc, id desc",
      }),
      odoo("x_sgc_mejora", "search_read", {
        domain: [["x_estado", "in", ["propuesta", "implementacion"]]],
        fields: ["x_name", "x_titulo", "x_fecha", "x_area_id", "x_estado", "x_responsable_id", "x_responsable_otro"],
        order: "x_fecha desc, id desc",
      }),
      odoo("x_sgc_procedimiento", "search_read", {
        domain: [["x_estado", "in", ["borrador", "en_revision", "en_firma"]]],
        fields: ["x_name", "x_codigo", "x_titulo", "x_version", "x_estado", "x_area_id", "x_fecha_proxima_revision", "x_link"],
        order: "x_orden, id",
      }),
    ]);

    const hallazgos = hal.map((r) => ({
      id: r.id,
      codigo: str(r.x_name),
      fecha_deteccion: str(r.x_fecha_deteccion),
      area: m2o(r.x_area_id),
      resumen: str(r.x_resumen_corto) || str(r.x_resumen),
      severidad: SEVERIDAD[r.x_severidad] || "",
      estado_key: str(r.x_estado),
      estado: EST_HALLAZGO[r.x_estado] || str(r.x_estado),
      responsable: m2o(r.x_responsable_id) || str(r.x_responsable_otro),
      fecha_cierre: str(r.x_fecha_cierre),
      url: `${base}/odoo/action-1280/${r.id}`,
    }));
    const mejoras = mej.map((r) => ({
      id: r.id,
      fecha: str(r.x_fecha),
      area: m2o(r.x_area_id),
      mejora_realizada: str(r.x_titulo) || str(r.x_name),
      estado: EST_MEJORA[r.x_estado] || str(r.x_estado),
      responsable: m2o(r.x_responsable_id) || str(r.x_responsable_otro),
      url: `${base}/odoo/action-1346/${r.id}`,
    }));
    const procedimientos = proc.map((r) => ({
      id: r.id,
      procedimiento: [str(r.x_codigo), str(r.x_titulo) || str(r.x_name)].filter(Boolean).join(" "),
      area: m2o(r.x_area_id),
      version: str(r.x_version),
      estado: EST_PROC[r.x_estado] || str(r.x_estado),
      fecha_proxima_revision: str(r.x_fecha_proxima_revision),
      link: str(r.x_link) || `${base}/odoo/action-1287/${r.id}`,
    }));

    res.status(200).json({ hallazgos, mejoras, procedimientos });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}

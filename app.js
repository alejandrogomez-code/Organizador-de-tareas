import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

/* ============================================================
   Conexión
   ============================================================ */
const CONFIGURED = !/TU-PROYECTO|TU-ANON/.test(SUPABASE_URL + SUPABASE_ANON_KEY);
const sb = CONFIGURED ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
let UID = null, booted = false;

/* ============================================================
   Constantes
   ============================================================ */
const STATUSES = [{key:"sin",label:"Sin iniciar",cls:"st-sin"},{key:"urg",label:"Urgente",cls:"st-urg"},{key:"proc",label:"En proceso",cls:"st-proc"},{key:"comp",label:"Completado",cls:"st-comp"},{key:"desc",label:"Descartado",cls:"st-desc"}];
const stMeta = k => STATUSES.find(s=>s.key===k) || STATUSES[0];
const RECUR = [["","No se repite"],["diaria","Diaria"],["semanal","Semanal"],["quincenal","Quincenal"],["mensual","Mensual"],["trimestral","Trimestral"],["anual","Anual"]];
const recurLabel = k => (RECUR.find(r=>r[0]===k)||["",""])[1];
const OBJ_STATUS = [["Sin iniciar","#5b6471","#eef0f3"],["En curso","#1f6fb6","#e6f0fb"],["En riesgo","#b4760a","#fdf3e2"],["Cumplido","#15803d","#e8f6ee"],["Pausado","#7c8593","#f0f1f4"]];
const PLAN_STATES = {"":{bg:"transparent",mk:""},pend:{bg:"#fde9c8",mk:""},proc:{bg:"#cfe0fb",mk:""},cump:{bg:"#c7ebd3",mk:"✓"}};
const planTitle = v => ({"":"No programado",pend:"Pendiente",proc:"En proceso",cump:"Cumplido"}[v]);
const MONTHS_ES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const Cap = s => s.charAt(0).toUpperCase()+s.slice(1);
function monthRange(){ const out=[]; let y=2026,m=4; for(let i=0;i<13;i++){ out.push(y+"-"+String(m).padStart(2,"0")); m++; if(m>12){m=1;y++;} } return out; }
const MONTHS = monthRange();
const monthLabel = ym => { const[y,m]=ym.split("-"); return Cap(MONTHS_ES[+m-1])+" "+y; };
const shortM = ym => { const[y,m]=ym.split("-"); return Cap(MONTHS_ES[+m-1]).slice(0,3)+" '"+y.slice(2); };

const SECTIONS = [{id:"dashboard",label:"Dashboard",ic:"▦"},{id:"objetivos",label:"Objetivos",ic:"◎"},{id:"tareas",label:"Seguimiento de Tareas",ic:"☑"},{id:"admin",label:"Administración · Finanzas",ic:"$"},{id:"calidad",label:"Calidad",ic:"✦"},{id:"logistica",label:"Logística · Compras",ic:"⛟"},{id:"sistemas",label:"Sistemas",ic:"⚙"}];
const CARD_STYLE = {objetivos:{bg:"#eef1ff",fg:"#4453c4"},tareas:{bg:"#e8f6ee",fg:"#15803d"},admin:{bg:"#fdf3e2",fg:"#b4760a"},calidad:{bg:"#f3eefe",fg:"#7b4fd0"},logistica:{bg:"#e6f3fb",fg:"#1f7bb6"},sistemas:{bg:"#eef0f3",fg:"#5b6471"}};

/* ---------- Paletas ---------- */
const PALETTES = {
  grafito:{ name:"Grafito", vars:{"--bg":"#f4f5f7","--panel":"#ffffff","--panel-2":"#fafbfc","--hover":"#fafbfd","--sidebar":"#21262e","--sidebar-2":"#2a313b","--sidebar-tx":"#b8c0cc","--sidebar-tx-dim":"#79828f","--line":"#e4e7eb","--line-2":"#eef0f3","--tx":"#1f2430","--tx-dim":"#6b7280","--tx-faint":"#9aa1ac","--accent":"#4c5bd4","--accent-soft":"#eceefb"} },
  indigo:{ name:"Índigo claro", vars:{"--bg":"#f3f4fb","--panel":"#ffffff","--panel-2":"#f7f8fe","--hover":"#f6f7fe","--sidebar":"#2b2f6b","--sidebar-2":"#363b80","--sidebar-tx":"#c3c8f0","--sidebar-tx-dim":"#878dc4","--line":"#e3e5f3","--line-2":"#edeefa","--tx":"#1e2140","--tx-dim":"#5d6184","--tx-faint":"#9a9ec0","--accent":"#5b5bd6","--accent-soft":"#e9e9fb"} },
  bosque:{ name:"Bosque", vars:{"--bg":"#f3f6f3","--panel":"#ffffff","--panel-2":"#f7faf7","--hover":"#f6faf6","--sidebar":"#1f2a25","--sidebar-2":"#293831","--sidebar-tx":"#b6c6bd","--sidebar-tx-dim":"#7a8c82","--line":"#e0e8e2","--line-2":"#eaf1ec","--tx":"#1c2722","--tx-dim":"#5b6b62","--tx-faint":"#97a59d","--accent":"#2f8f6b","--accent-soft":"#e3f3ec"} },
  arena:{ name:"Arena", vars:{"--bg":"#f6f3ee","--panel":"#fffdf9","--panel-2":"#f9f5ef","--hover":"#f8f4ed","--sidebar":"#34302a","--sidebar-2":"#403a32","--sidebar-tx":"#cbc2b4","--sidebar-tx-dim":"#8f8676","--line":"#e8e1d6","--line-2":"#f0ebe2","--tx":"#2c2820","--tx-dim":"#6b6457","--tx-faint":"#a59d8e","--accent":"#b06a3c","--accent-soft":"#f5e7da"} },
  pizarra:{ name:"Pizarra (oscuro)", vars:{"--bg":"#161a20","--panel":"#1e232b","--panel-2":"#242a33","--hover":"#232932","--sidebar":"#12151a","--sidebar-2":"#1c212a","--sidebar-tx":"#aeb6c2","--sidebar-tx-dim":"#6b7480","--line":"#2c333d","--line-2":"#262c35","--tx":"#e7eaef","--tx-dim":"#a6adb8","--tx-faint":"#7a828d","--accent":"#6f7ce6","--accent-soft":"#272d4a"} },
};
function applyTheme(key){ const p = PALETTES[key] || PALETTES.grafito; for(const[k,v] of Object.entries(p.vars)) document.documentElement.style.setProperty(k,v); state.theme = PALETTES[key]?key:"grafito"; }

/* ---------- Secciones operativas ---------- */
// Qué áreas (de Seguimiento de Tareas) agrupa cada sección.
const SECTION_AREAS = {
  admin:["Administración","Contabilidad","Finanzas"],
  calidad:["Calidad"],
  logistica:["Logística","Compras"],
  sistemas:["Sistemas"],
};
const OPS_ENABLED = ["admin","calidad"]; // secciones ya construidas
const VENC_TIPO = ["Impuesto","Contrato","Licencia","Seguro","Certificación","Servicio","Pago","Habilitación","Auditoría","Otro"];
const PERIODICIDAD = [["unica","Única vez"],["mensual","Mensual"],["bimestral","Bimestral"],["trimestral","Trimestral"],["cuatrimestral","Cuatrimestral"],["semestral","Semestral"],["anual","Anual"]];
const perLabel = k => (PERIODICIDAD.find(p=>p[0]===k)||["","Única vez"])[1];

/* ============================================================
   Estado
   ============================================================ */
const DEFAULTS = {
  areas:["Administración","Contabilidad","Finanzas","Marketing","Calidad","Logística","Compras","Sistemas"],
  responsables:["Alejandro","Diego","Leandro","Claudio"],
  shortcuts:[{ic:"📅",label:"Notion Calendar",url:"#",section:"dashboard"},{ic:"✉️",label:"Correo",url:"#",section:"dashboard"},{ic:"🗂️",label:"Notion",url:"#",section:"dashboard"},{ic:"📊",label:"Odoo",url:"#",section:"dashboard"}],
  theme:"grafito",
};
const state = {
  view:"dashboard", taskView:"tabla", scale:1, seq:1,
  sort:{col:"n",dir:"asc"}, group:"", showDone:false,
  objSel:null, objReviewMonth:null, objFilterArea:"", justSavedReview:null,
  secTab:"tareas", vencFilter:{tipo:"",status:""}, reuSel:null,
  areas:[], responsables:[], objetivos:[], shortcuts:[], theme:"grafito",
  filters:{estado:"",area:"",resp:"",venc:"",q:""},
  tasks:[], vencimientos:[], reuniones:[],
};

/* ============================================================
   Helpers
   ============================================================ */
const $ = (s,el=document)=>el.querySelector(s);
const esc = s => (s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt = d => d ? new Date(d+"T00:00").toLocaleDateString("es-AR",{day:"2-digit",month:"short"}) : "—";
const today = () => new Date().toISOString().slice(0,10);
function dueClass(d){ if(!d)return""; if(d<today())return"due-over"; const diff=(new Date(d)-new Date(today()))/864e5; return diff<=3?"due-soon":""; }
const initials = n => n ? n.trim().slice(0,2).toUpperCase() : "?";
const currentYM = () => today().slice(0,7);
const clampMonth = ym => MONTHS.includes(ym) ? ym : MONTHS[MONTHS.length-1];
const CUR = clampMonth(currentYM());
const getObjById = id => state.objetivos.find(o=>o.id===id);
function newObjetivo(tag,name){ return {id:crypto.randomUUID(),tag,name,area:"",owner:"",status:"En curso",indicators:[],plan:[],reviews:[]}; }

let toastTimer=null;
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove("show"),2200); }

/* ============================================================
   Persistencia (Supabase)
   ============================================================ */
function serTask(t){ return {id:t.id,user_id:UID,n:t.n,created:t.created||null,title:t.title||"",status:t.status||"sin",due:t.due||null,area:t.area||null,resp:t.resp||null,obj:t.obj||null,url:t.url||null,file:t.file||null,detail:t.detail||null,recur:t.recur||null,subs:t.subs||[]}; }
function serObj(o){ return {id:o.id,user_id:UID,tag:o.tag||"",name:o.name||"",area:o.area||null,owner:o.owner||null,status:o.status||"En curso",indicators:o.indicators||[],plan:o.plan||[],reviews:o.reviews||[]}; }
function deTask(r){ return {id:r.id,n:r.n,created:r.created||"",title:r.title||"",status:r.status||"sin",due:r.due||"",area:r.area||"",resp:r.resp||"",obj:r.obj||"",url:r.url||"",file:r.file||null,detail:r.detail||"",recur:r.recur||"",subs:r.subs||[]}; }
function deObj(r){ return {id:r.id,tag:r.tag||"",name:r.name||"",area:r.area||"",owner:r.owner||"",status:r.status||"En curso",indicators:r.indicators||[],plan:r.plan||[],reviews:r.reviews||[]}; }
function serVenc(v){ return {id:v.id,user_id:UID,area:v.area||null,concepto:v.concepto||"",tipo:v.tipo||null,due:v.due||null,periodicidad:v.periodicidad||"unica",resp:v.resp||null,status:v.status||"pend",url:v.url||null,nota:v.nota||null}; }
function deVenc(r){ return {id:r.id,area:r.area||"",concepto:r.concepto||"",tipo:r.tipo||"",due:r.due||"",periodicidad:r.periodicidad||"unica",resp:r.resp||"",status:r.status||"pend",url:r.url||"",nota:r.nota||""}; }
function serReu(r){ return {id:r.id,user_id:UID,area:r.area||null,fecha:r.fecha||null,titulo:r.titulo||"",participantes:r.participantes||"",temas:r.temas||"",decisiones:r.decisiones||"",compromisos:r.compromisos||[],proxima:r.proxima||null}; }
function deReu(r){ return {id:r.id,area:r.area||"",fecha:r.fecha||"",titulo:r.titulo||"",participantes:r.participantes||"",temas:r.temas||"",decisiones:r.decisiones||"",compromisos:r.compromisos||[],proxima:r.proxima||""}; }

const timers = {};
function db(){ return sb && UID; }
function scheduleSaveTask(id){ if(!db())return; clearTimeout(timers["t"+id]); timers["t"+id]=setTimeout(()=>saveTaskNow(id),500); }
async function saveTaskNow(id){ if(!db())return; const t=state.tasks.find(x=>x.id===id); if(!t)return; const {error}=await sb.from("tasks").upsert(serTask(t)); if(error)toast("No se pudo guardar: "+error.message); }
async function deleteTaskDb(id){ if(!db())return; const {error}=await sb.from("tasks").delete().eq("id",id); if(error)toast("No se pudo borrar: "+error.message); }
function scheduleSaveObj(id){ if(!db())return; clearTimeout(timers["o"+id]); timers["o"+id]=setTimeout(()=>saveObjNow(id),500); }
async function saveObjNow(id){ if(!db())return; const o=getObjById(id); if(!o)return; const {error}=await sb.from("objetivos").upsert(serObj(o)); if(error)toast("No se pudo guardar: "+error.message); }
async function deleteObjDb(id){ if(!db())return; const {error}=await sb.from("objetivos").delete().eq("id",id); if(error)toast("No se pudo borrar: "+error.message); }
function scheduleSaveSettings(){ if(!db())return; clearTimeout(timers.settings); timers.settings=setTimeout(saveSettingsNow,500); }
async function saveSettingsNow(){ if(!db())return; const {error}=await sb.from("settings").upsert({user_id:UID,areas:state.areas,responsables:state.responsables,shortcuts:state.shortcuts,theme:state.theme,updated_at:new Date().toISOString()}); if(error)toast("No se pudo guardar config: "+error.message); }
function getVenc(id){ return state.vencimientos.find(v=>v.id===id); }
function scheduleSaveVenc(id){ if(!db())return; clearTimeout(timers["v"+id]); timers["v"+id]=setTimeout(()=>saveVencNow(id),500); }
async function saveVencNow(id){ if(!db())return; const v=getVenc(id); if(!v)return; const {error}=await sb.from("vencimientos").upsert(serVenc(v)); if(error)toast("No se pudo guardar: "+error.message); }
async function deleteVencDb(id){ if(!db())return; const {error}=await sb.from("vencimientos").delete().eq("id",id); if(error)toast("No se pudo borrar: "+error.message); }
function getReu(id){ return state.reuniones.find(r=>r.id===id); }
function scheduleSaveReu(id){ if(!db())return; clearTimeout(timers["r"+id]); timers["r"+id]=setTimeout(()=>saveReuNow(id),500); }
async function saveReuNow(id){ if(!db())return; const r=getReu(id); if(!r)return; const {error}=await sb.from("reuniones").upsert(serReu(r)); if(error)toast("No se pudo guardar: "+error.message); }
async function deleteReuDb(id){ if(!db())return; const {error}=await sb.from("reuniones").delete().eq("id",id); if(error)toast("No se pudo borrar: "+error.message); }

async function loadAll(){
  // settings
  let st=null;
  { const {data}=await sb.from("settings").select("*").eq("user_id",UID).maybeSingle(); st=data; }
  if(!st){ state.areas=[...DEFAULTS.areas]; state.responsables=[...DEFAULTS.responsables]; state.shortcuts=DEFAULTS.shortcuts.map(s=>({...s})); state.theme=DEFAULTS.theme; await saveSettingsNow(); }
  else { state.areas=st.areas||[]; state.responsables=st.responsables||[]; state.shortcuts=st.shortcuts||[]; state.theme=st.theme||"grafito"; }
  applyTheme(state.theme);
  // tasks
  { const {data}=await sb.from("tasks").select("*").eq("user_id",UID).order("n",{ascending:true}); state.tasks=(data||[]).map(deTask); }
  // objetivos
  { const {data}=await sb.from("objetivos").select("*").eq("user_id",UID).order("inserted_at",{ascending:true}); state.objetivos=(data||[]).map(deObj); }
  // vencimientos
  { const {data,error}=await sb.from("vencimientos").select("*").eq("user_id",UID).order("due",{ascending:true}); if(error&&/relation|does not exist/i.test(error.message))toast("Falta correr la migración de Vencimientos en Supabase."); state.vencimientos=(data||[]).map(deVenc); }
  // reuniones
  { const {data}=await sb.from("reuniones").select("*").eq("user_id",UID).order("fecha",{ascending:false}); state.reuniones=(data||[]).map(deReu); }
  state.seq = state.tasks.reduce((m,t)=>Math.max(m,t.n||0),0)+1;
}

/* ============================================================
   Navegación / render raíz
   ============================================================ */
function renderNav(){
  $("#nav").innerHTML = SECTIONS.map(s=>`<a href="#" class="${state.view===s.id?'active':''}" data-go="${s.id}"><span class="ic">${s.ic}</span>${esc(s.label)}</a>`).join("")
    + `<div class="sep"></div><a href="#" class="${state.view==='config'?'active':''}" data-go="config"><span class="ic">⚙</span>Configuración</a>`;
  $("#nav").querySelectorAll("a[data-go]").forEach(a=>a.onclick=e=>{ e.preventDefault(); go(a.dataset.go); });
}
function go(id){ state.view=id; state.objSel=null; state.secTab="tareas"; state.reuSel=null; render(); }
function setScale(dir){ if(dir===0)state.scale=1; else state.scale=Math.min(1.35,Math.max(.82,state.scale+dir*0.09)); document.documentElement.style.setProperty("--scale",state.scale.toFixed(2)); }

function render(){
  renderNav();
  const sec=SECTIONS.find(s=>s.id===state.view);
  if(state.view==='config') $("#crumb").innerHTML="Configuración";
  else if(state.view==='objetivos'){ const o=state.objSel?getObjById(state.objSel):null; $("#crumb").innerHTML=o?`<span class="crumb">Objetivos / </span>${esc(o.tag)}`:`<span class="crumb">Objetivos</span>`; }
  else $("#crumb").innerHTML=`<span class="crumb">${esc(sec?sec.label:'')}</span>`;
  const c=$("#content");
  if(state.view==="dashboard") c.innerHTML=viewDashboard();
  else if(state.view==="tareas"){ c.innerHTML=viewTasks(); paintTasks(); }
  else if(state.view==="objetivos") c.innerHTML=state.objSel?objDetail(getObjById(state.objSel)):objList();
  else if(state.view==="config") c.innerHTML=viewConfig();
  else if(OPS_ENABLED.includes(state.view)) c.innerHTML=sectionView(state.view);
  else c.innerHTML=viewPlaceholder(sec);
  bindContent();
}

/* event delegation para el contenido renderizado por innerHTML */
function bindContent(){
  const c=$("#content");
  c.querySelectorAll("[data-act]").forEach(el=>{
    const act=el.dataset.act;
    const handler=ACTIONS[act];
    if(!handler) return;
    const ev = el.dataset.ev || (el.tagName==="SELECT"||el.tagName==="INPUT"||el.tagName==="TEXTAREA" ? "change":"click");
    el["on"+ev]=e=>handler(el,e);
    if(el.dataset.input!==undefined) el.oninput=e=>handler(el,e);
  });
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function viewDashboard(){
  const pend=state.tasks.filter(t=>!["comp","desc"].includes(t.status)).length;
  const sc=state.shortcuts.filter(s=>(s.section||"dashboard")==="dashboard").map(s=>`<a class="sc-btn" href="${esc(s.url||'#')}" target="_blank"><span class="ic">${esc(s.ic)}</span>${esc(s.label)}</a>`).join("") || `<span style="color:var(--tx-faint);font-size:.86em">Agregá accesos directos desde Configuración.</span>`;
  // próxima reunión real (fecha futura o "próxima reunión" cargada)
  const up=[]; state.reuniones.forEach(r=>{ if(r.fecha&&r.fecha>=today())up.push({d:r.fecha,t:r.titulo||'Reunión',a:r.area}); if(r.proxima&&r.proxima>=today())up.push({d:r.proxima,t:(r.titulo?'Seguimiento: '+r.titulo:'Próxima reunión'),a:r.area}); });
  up.sort((a,b)=>a.d<b.d?-1:1);
  const nm=up[0];
  const secName=id=>{ const s=SECTIONS.find(x=>x.id===id); return s?s.label:''; };
  let meetingWidget;
  if(nm){ const dd=new Date(nm.d+"T00:00"); const dnum=dd.getDate(); const mlbl=dd.toLocaleDateString("es-AR",{month:"short"});
    meetingWidget=`<h3>Próxima reunión</h3><div class="meeting"><div class="when"><b>${dnum}</b><span>${esc(mlbl)}</span></div><div class="info"><b>${esc(nm.t)}</b><p>${esc(secName(nm.a))}</p><span class="src">🗓 ${fmt(nm.d)}</span></div></div>`;
  } else {
    meetingWidget=`<h3>Próxima reunión</h3><div style="color:var(--tx-faint);font-size:.9em;padding:6px 0">No hay reuniones próximas cargadas. Registralas en cada sección.</div>`;
  }
  const cards=SECTIONS.filter(s=>s.id!=="dashboard").map(s=>{
    const cs=CARD_STYLE[s.id]||{bg:"#eef0f3",fg:"#5b6471"};
    let stat=`<div class="stat" style="color:var(--tx-faint)">En construcción</div>`;
    if(s.id==="tareas")stat=`<div class="stat"><b>${pend}</b> pendientes</div>`;
    else if(s.id==="objetivos")stat=`<div class="stat"><b>${state.objetivos.length}</b> en seguimiento</div>`;
    else if(OPS_ENABLED.includes(s.id)){ const areas=SECTION_AREAS[s.id]||[]; const tp=state.tasks.filter(t=>areas.includes(t.area)&&!["comp","desc"].includes(t.status)).length; const vp=state.vencimientos.filter(v=>v.area===s.id&&v.status!=='ok'&&v.due&&v.due<today()).length; stat=`<div class="stat"><b>${tp}</b> tareas · ${vp?`<b style="color:var(--st-urg)">${vp}</b> vencidas`:'0 vencidas'}</div>`; }
    return `<button class="card" data-act="goCard" data-id="${s.id}"><div class="ico" style="background:${cs.bg};color:${cs.fg}">${s.ic}</div><h4>${esc(s.label)}</h4>${stat}</button>`;
  }).join("");
  return `<div class="dash-top">
    <div class="widget">${meetingWidget}</div>
    <div class="widget"><h3>Accesos directos</h3><div class="shortcuts">${sc}</div></div>
  </div><div class="section-h">Secciones</div><div class="cards">${cards}</div>`;
}
function viewPlaceholder(sec){ return `<div class="placeholder"><div class="pico">${sec?sec.ic:'•'}</div><h2>${esc(sec?sec.label:'')}</h2><p>Esta sección todavía no tiene contenido. La armamos cuando definamos qué necesitás acá.</p></div>`; }
function optionList(arr,sel,empty){ return `<option value="">${empty}</option>`+arr.map(a=>`<option value="${esc(a)}" ${a===sel?'selected':''}>${esc(a)}</option>`).join(""); }

/* ============================================================
   TAREAS
   ============================================================ */
function viewTasks(){
  const f=state.filters;
  return `<div class="toolbar">
    <div class="seg"><button class="${state.taskView==='tabla'?'on':''}" data-act="taskView" data-id="tabla">▤ Tabla</button><button class="${state.taskView==='kanban'?'on':''}" data-act="taskView" data-id="kanban">▥ Kanban</button></div>
    <div class="filters">
      <select data-act="filter" data-id="estado"><option value="">Todos los estados</option>${STATUSES.map(s=>`<option value="${s.key}" ${f.estado===s.key?'selected':''}>${s.label}</option>`).join("")}</select>
      <select data-act="filter" data-id="area">${optionList(state.areas,f.area,"Todas las áreas")}</select>
      <select data-act="filter" data-id="resp">${optionList(state.responsables,f.resp,"Todos los responsables")}</select>
      <select data-act="filter" data-id="venc"><option value="">Cualquier vencimiento</option><option value="over" ${f.venc==='over'?'selected':''}>Vencidas</option><option value="today" ${f.venc==='today'?'selected':''}>Vence hoy</option><option value="week" ${f.venc==='week'?'selected':''}>Esta semana</option><option value="none" ${f.venc==='none'?'selected':''}>Sin fecha</option></select>
      <input type="search" placeholder="Buscar tarea…" value="${esc(f.q)}" data-act="filter" data-id="q" data-input>
    </div>
    <div class="spacer"></div>
    <select class="inp" data-act="group"><option value="">Sin agrupar</option><option value="area" ${state.group==='area'?'selected':''}>Agrupar por área</option><option value="resp" ${state.group==='resp'?'selected':''}>Agrupar por responsable</option></select>
    <button class="btn-ghost ${state.showDone?'on':''}" data-act="toggleDone">${state.showDone?'Ocultar':'Ver'} completadas</button>
    <button class="btn-primary" data-act="addTask">＋ Nueva tarea</button>
  </div><div id="taskArea"></div>`;
}
function filtered(){
  const f=state.filters,t0=today(),weekEnd=new Date(Date.now()+7*864e5).toISOString().slice(0,10);
  return state.tasks.filter(t=>{
    if(f.estado&&t.status!==f.estado)return false;
    if(f.area&&t.area!==f.area)return false;
    if(f.resp&&t.resp!==f.resp)return false;
    if(f.q&&!t.title.toLowerCase().includes(f.q.toLowerCase()))return false;
    if(f.venc==='over'&&!(t.due&&t.due<t0))return false;
    if(f.venc==='today'&&t.due!==t0)return false;
    if(f.venc==='week'&&!(t.due&&t.due>=t0&&t.due<=weekEnd))return false;
    if(f.venc==='none'&&t.due)return false;
    return true;
  });
}
function visibleTable(list){ if(state.showDone||state.filters.estado)return list; return list.filter(t=>t.status!=='comp'&&t.status!=='desc'); }
function sortList(list){
  const s=state.sort; if(!s||!s.col)return list; const dir=s.dir==='desc'?-1:1;
  const val=t=>{ switch(s.col){ case 'n':return t.n; case 'created':return t.created; case 'title':return t.title.toLowerCase(); case 'status':return STATUSES.findIndex(x=>x.key===t.status); case 'due':return t.due||'9999-99'; case 'area':return(t.area||'~~~').toLowerCase(); case 'resp':return(t.resp||'~~~').toLowerCase(); case 'obj':return(t.obj||'~~~').toLowerCase(); default:return 0; } };
  return [...list].sort((a,b)=>{ const va=val(a),vb=val(b); return va<vb?-1*dir:va>vb?1*dir:0; });
}
function paintTasks(){
  const area=$("#taskArea"); if(!area)return;
  const list=filtered();
  if(state.taskView==='kanban'){ if(!list.length){ area.innerHTML=`<div class="table-wrap"><div class="empty">No hay tareas que coincidan con los filtros.</div></div>`; return; } area.innerHTML=kanbanHTML(list); bindTaskArea(); wireKanban(); return; }
  const tl=sortList(visibleTable(list));
  if(!tl.length){ area.innerHTML=`<div class="table-wrap"><div class="empty">No hay tareas para mostrar. ${!state.showDone?'Quizás estén completadas — probá "Ver completadas".':'Probá cambiar los filtros o creá una nueva.'}</div></div>`; return; }
  area.innerHTML=tableHTML(tl); bindTaskArea();
}
function bindTaskArea(){
  const area=$("#taskArea"); if(!area)return;
  area.querySelectorAll("[data-act]").forEach(el=>{
    const h=ACTIONS[el.dataset.act]; if(!h)return;
    const ev=el.dataset.ev||(el.tagName==="SELECT"||el.tagName==="INPUT"?"change":"click");
    el["on"+ev]=e=>h(el,e);
  });
}
function th(col,label){ const s=state.sort,on=s.col===col,arr=on?(s.dir==='asc'?'▲':'▼'):'↕'; return `<th class="sortable" data-act="sort" data-id="${col}">${label}<span class="arr" style="opacity:${on?1:.35}">${arr}</span></th>`; }
function rowHTML(t){
  const st=stMeta(t.status); const done=t.subs.filter(s=>s.d).length,tot=t.subs.length,pct=tot?Math.round(done/tot*100):0;
  const sp=tot?`<span class="subprog" title="${done} de ${tot} subtareas"><span class="bar"><i style="width:${pct}%"></i></span>${done}/${tot}</span>`:"";
  const rec=t.recur?`<span class="recur-badge" title="Se repite: ${recurLabel(t.recur)}">↻</span>`:"";
  const urlCell=t.url?`<a class="icon-link" href="${esc(t.url)}" target="_blank" title="${esc(t.url)}">🔗</a>`:`<span style="color:var(--tx-faint)">—</span>`;
  const fileCell=t.file?`<span class="attach-mini" title="${esc(t.file)}">📎 ${esc(t.file)}</span>`:`<span style="color:var(--tx-faint)">—</span>`;
  return `<tr><td class="num">${t.n}</td><td class="date">${fmt(t.created)}</td>
    <td><div class="title-wrap"><button class="task-title" data-act="open" data-id="${t.id}">${esc(t.title)}${rec}</button>${sp}</div></td>
    <td><select class="status-pill ${st.cls}" data-act="setF" data-id="${t.id}" data-f="status">${STATUSES.map(s=>`<option value="${s.key}" ${s.key===t.status?'selected':''}>${s.label}</option>`).join("")}</select></td>
    <td class="date ${dueClass(t.due)}">${fmt(t.due)}</td>
    <td><select class="cell-edit" data-act="setF" data-id="${t.id}" data-f="area">${optionList(state.areas,t.area,"—")}</select></td>
    <td><select class="cell-edit" data-act="setF" data-id="${t.id}" data-f="resp">${optionList(state.responsables,t.resp,"—")}</select></td>
    <td><select class="cell-edit" data-act="setF" data-id="${t.id}" data-f="obj"><option value="">—</option>${state.objetivos.map(o=>`<option value="${o.tag}" ${o.tag===t.obj?'selected':''}>${o.tag}</option>`).join("")}</select></td>
    <td style="text-align:center">${urlCell}</td><td>${fileCell}</td></tr>`;
}
function tableHTML(list){
  let body;
  if(!state.group)body=list.map(rowHTML).join("");
  else{ const groups={}; list.forEach(t=>{ const g=t[state.group]||"(sin asignar)"; (groups[g]=groups[g]||[]).push(t); }); body=Object.keys(groups).sort().map(g=>`<tr class="group-row"><td colspan="10">${esc(g)} · ${groups[g].length}</td></tr>${groups[g].map(rowHTML).join("")}`).join(""); }
  return `<div class="table-wrap"><table class="tasks"><thead><tr>${th('n','N°')}${th('created','Creada')}${th('title','Tarea')}${th('status','Estado')}${th('due','Vence')}${th('area','Área')}${th('resp','Responsable')}${th('obj','Objetivo')}<th>URL</th><th>Adjunto</th></tr></thead><tbody>${body}</tbody></table></div>`;
}
function kanbanHTML(list){
  const cols=STATUSES.map(s=>{
    const items=list.filter(t=>t.status===s.key);
    const cards=items.map(t=>{ const done=t.subs.filter(x=>x.d).length,tot=t.subs.length;
      return `<div class="kcard" draggable="true" data-id="${t.id}" data-act="open"><div class="kt">${esc(t.title)}${t.recur?' <span class="recur-badge" title="Se repite: '+recurLabel(t.recur)+'">↻</span>':''}</div><div class="kmeta">${t.area?`<span class="tag" style="background:var(--line-2);color:var(--tx-dim)">${esc(t.area)}</span>`:''}${tot?`<span title="subtareas">☑ ${done}/${tot}</span>`:''}${t.due?`<span class="${dueClass(t.due)}">📅 ${fmt(t.due)}</span>`:''}${t.resp?`<span class="who" title="${esc(t.resp)}">${initials(t.resp)}</span>`:''}</div></div>`;
    }).join("");
    return `<div class="kcol" data-status="${s.key}"><div class="kcol-h"><span class="${s.cls}" style="padding:2px 8px;border-radius:20px">${s.label}</span><span class="count">${items.length}</span></div>${cards||'<div style="color:var(--tx-faint);font-size:.84em;padding:6px;text-align:center">Sin tareas</div>'}</div>`;
  }).join("");
  return `<div class="kanban">${cols}</div>`;
}
function wireKanban(){
  let dragId=null;
  document.querySelectorAll('.kcard').forEach(c=>{ c.addEventListener('dragstart',e=>{ dragId=c.dataset.id; e.dataTransfer.effectAllowed='move'; setTimeout(()=>c.style.opacity='.4',0); }); c.addEventListener('dragend',()=>{ c.style.opacity=''; }); });
  document.querySelectorAll('.kcol').forEach(col=>{ col.addEventListener('dragover',e=>{ e.preventDefault(); col.classList.add('drag-over'); }); col.addEventListener('dragleave',()=>col.classList.remove('drag-over')); col.addEventListener('drop',e=>{ e.preventDefault(); col.classList.remove('drag-over'); const t=state.tasks.find(x=>x.id===dragId); if(t){ const prev=t.status; t.status=col.dataset.status; if(t.status==='comp'&&t.recur&&prev!=='comp')spawnRecurrence(t); scheduleSaveTask(t.id); paintTasks(); } }); });
}
function nextDue(dateStr,recur){ const d=dateStr?new Date(dateStr+"T00:00"):new Date(); switch(recur){ case 'diaria':d.setDate(d.getDate()+1);break; case 'semanal':d.setDate(d.getDate()+7);break; case 'quincenal':d.setDate(d.getDate()+14);break; case 'mensual':d.setMonth(d.getMonth()+1);break; case 'trimestral':d.setMonth(d.getMonth()+3);break; case 'anual':d.setFullYear(d.getFullYear()+1);break; default:return dateStr||""; } return d.toISOString().slice(0,10); }
function spawnRecurrence(t){ const nt={id:crypto.randomUUID(),n:state.seq++,created:today(),title:t.title,status:'sin',due:nextDue(t.due||today(),t.recur),area:t.area,resp:t.resp,obj:t.obj,url:t.url,file:null,detail:t.detail,recur:t.recur,subs:t.subs.map(s=>({t:s.t,d:false}))}; state.tasks.unshift(nt); saveTaskNow(nt.id); }
function refreshTasks(){ if(state.view==='tareas') paintTasks(); else render(); }
function setField(id,field,val){ const t=state.tasks.find(x=>x.id===id); if(!t)return; const prev=t[field]; t[field]=val; if(field==='status'&&val==='comp'&&t.recur&&prev!=='comp')spawnRecurrence(t); scheduleSaveTask(id); refreshTasks(); }
function addTask(){ const t={id:crypto.randomUUID(),n:state.seq++,created:today(),title:"Nueva tarea",status:"sin",due:"",area:"",resp:"",obj:"",url:"",file:null,detail:"",recur:"",subs:[]}; state.tasks.unshift(t); saveTaskNow(t.id); paintTasks(); openModal(t.id); }
function newTaskForObj(tag){ const t={id:crypto.randomUUID(),n:state.seq++,created:today(),title:"Nueva tarea",status:"sin",due:"",area:"",resp:"",obj:tag,url:"",file:null,detail:"",recur:"",subs:[]}; state.tasks.unshift(t); saveTaskNow(t.id); openModal(t.id); }

/* ---------- MODAL TAREA ---------- */
let modalId=null;
function openModal(id){
  modalId=id; const t=state.tasks.find(x=>x.id===id); if(!t)return; const done=t.subs.filter(s=>s.d).length;
  $("#modal").innerHTML=`
    <div class="modal-head"><span class="mh-num">#${t.n}</span><input class="m-title" id="mTitle" value="${esc(t.title)}" placeholder="Título de la tarea"><button class="modal-close" id="mClose">✕</button></div>
    <div class="modal-body">
      <div class="m-grid">
        <div class="m-field"><label>Estado</label><select id="mStatus">${STATUSES.map(s=>`<option value="${s.key}" ${s.key===t.status?'selected':''}>${s.label}</option>`).join("")}</select></div>
        <div class="m-field"><label>Vencimiento</label><input type="date" id="mDue" value="${esc(t.due)}"></div>
        <div class="m-field"><label>Área</label><select id="mArea">${optionList(state.areas,t.area,"— sin área —")}</select></div>
        <div class="m-field"><label>Responsable</label><select id="mResp">${optionList(state.responsables,t.resp,"— sin asignar —")}</select></div>
        <div class="m-field"><label>Objetivo</label><select id="mObj"><option value="">— ninguno —</option>${state.objetivos.map(o=>`<option value="${o.tag}" ${o.tag===t.obj?'selected':''}>${o.tag} · ${esc(o.name)}</option>`).join("")}</select></div>
        <div class="m-field"><label>Recurrencia</label><select id="mRecur">${RECUR.map(r=>`<option value="${r[0]}" ${r[0]===t.recur?'selected':''}>${r[1]}</option>`).join("")}</select></div>
        <div class="m-field"><label>URL</label><input type="url" id="mUrl" placeholder="https://…" value="${esc(t.url)}"></div>
      </div>
      <div><div class="m-block-h"><span>Subtareas</span><span class="sub-prog">${done}/${t.subs.length} listas</span></div>
        <div class="subs" id="mSubs">${t.subs.map((s,i)=>`<div class="sub ${s.d?'done':''}"><input type="checkbox" ${s.d?'checked':''} data-sub="chk" data-i="${i}"><input class="sx" value="${esc(s.t)}" data-sub="txt" data-i="${i}"><button class="del" data-sub="del" data-i="${i}">🗑</button></div>`).join("")}</div>
        <div class="sub-add"><input id="newSub" placeholder="Agregar subtarea y Enter…"></div></div>
      <div><div class="m-block-h"><span>Detalle</span></div><textarea class="m-detail" id="mDetail" placeholder="Notas, contexto, pasos…">${esc(t.detail)}</textarea></div>
      <div><div class="m-block-h"><span>Adjunto (PDF / foto / Excel)</span></div><div class="attach-row">${t.file?`<span class="file-pill">📎 ${esc(t.file)} <button class="del" id="mFileDel" style="opacity:1">✕</button></span>`:''}<label class="btn-ghost" style="cursor:pointer">＋ Subir archivo<input type="file" id="mFile" style="display:none" accept=".pdf,.xlsx,.xls,image/*"></label></div></div>
    </div>
    <div class="modal-foot"><button class="link-danger" id="mDelete">Eliminar tarea</button><button class="btn-primary" id="mDone">Listo</button></div>`;
  // binds
  const set=(f,v)=>setField(id,f,v);
  $("#mTitle").oninput=e=>set("title",e.target.value);
  $("#mStatus").onchange=e=>{ set("status",e.target.value); openModal(id); };
  $("#mDue").onchange=e=>set("due",e.target.value);
  $("#mArea").onchange=e=>set("area",e.target.value);
  $("#mResp").onchange=e=>set("resp",e.target.value);
  $("#mObj").onchange=e=>set("obj",e.target.value);
  $("#mRecur").onchange=e=>{ set("recur",e.target.value); openModal(id); };
  $("#mUrl").onchange=e=>set("url",e.target.value);
  $("#mDetail").oninput=e=>set("detail",e.target.value);
  $("#mClose").onclick=closeModal; $("#mDone").onclick=closeModal;
  $("#mDelete").onclick=()=>{ state.tasks=state.tasks.filter(x=>x.id!==id); deleteTaskDb(id); closeModal(); };
  const tk=()=>state.tasks.find(x=>x.id===id);
  $("#mSubs").querySelectorAll("[data-sub]").forEach(el=>{
    const i=+el.dataset.i, kind=el.dataset.sub;
    if(kind==="chk") el.onchange=()=>{ tk().subs[i].d=!tk().subs[i].d; scheduleSaveTask(id); openModal(id); };
    if(kind==="txt") el.oninput=()=>{ tk().subs[i].t=el.value; scheduleSaveTask(id); };
    if(kind==="del") el.onclick=()=>{ tk().subs.splice(i,1); scheduleSaveTask(id); openModal(id); };
  });
  $("#newSub").onkeydown=e=>{ if(e.key==='Enter'){ const v=e.target.value.trim(); if(!v)return; tk().subs.push({t:v,d:false}); scheduleSaveTask(id); openModal(id); setTimeout(()=>{const n=$("#newSub"); if(n)n.focus();},10); } };
  const fd=$("#mFileDel"); if(fd) fd.onclick=()=>{ set("file",null); openModal(id); };
  $("#mFile").onchange=e=>{ const f=e.target.files[0]; if(!f)return; set("file",f.name); openModal(id); };
  $("#overlay").classList.add("show");
}
function closeModal(){ $("#overlay").classList.remove("show"); modalId=null; if(state.view==='tareas')paintTasks(); else render(); }

/* ============================================================
   OBJETIVOS
   ============================================================ */
function objAvance(o){ let sched=0,done=0; o.plan.forEach(a=>Object.values(a.months).forEach(v=>{ if(v){sched++; if(v==='cump')done++;} })); return sched?Math.round(done/sched*100):0; }
function objStatusBadge(s){ const m=OBJ_STATUS.find(x=>x[0]===s)||OBJ_STATUS[0]; return `<span style="display:inline-flex;align-items:center;gap:6px;background:${m[2]};color:${m[1]};border-radius:20px;padding:3px 10px;font-size:.92em;font-weight:600"><span style="width:7px;height:7px;border-radius:50%;background:currentColor"></span>${s}</span>`; }
function avanceBar(p){ return `<div style="display:flex;align-items:center;gap:7px"><div style="width:70px;height:6px;border-radius:4px;background:var(--line-2);overflow:hidden"><div style="height:100%;width:${p}%;background:var(--accent)"></div></div><span style="font-size:.86em;color:var(--tx-dim)">${p}%</span></div>`; }

function objList(){
  const list=state.objetivos.filter(o=>!state.objFilterArea||o.area===state.objFilterArea);
  const rows=list.map(o=>`<tr>
    <td>${o.area?esc(o.area):'<span style="color:var(--tx-faint)">—</span>'}</td>
    <td><span class="tag">${esc(o.tag)}</span></td>
    <td><button class="task-title" data-act="openObj" data-id="${o.id}">${esc(o.name)}</button></td>
    <td>${o.owner?esc(o.owner):'<span style="color:var(--tx-faint)">—</span>'}</td>
    <td>${objStatusBadge(o.status)}</td>
    <td>${avanceBar(objAvance(o))}</td></tr>`).join("");
  return `<div class="toolbar">
    <div class="filters"><select data-act="objArea">${optionList(state.areas,state.objFilterArea,"Todas las áreas")}</select></div>
    <div class="spacer"></div><button class="btn-primary" data-act="addObj">＋ Nuevo objetivo</button>
  </div>
  <div class="table-wrap"><table class="tasks" style="min-width:760px"><thead><tr><th>Área</th><th>Tag</th><th>Objetivo</th><th>Responsable</th><th>Estado actual</th><th>Avance</th></tr></thead>
  <tbody>${rows||'<tr><td colspan="6"><div class="empty">No hay objetivos en esta área. Creá uno nuevo.</div></td></tr>'}</tbody></table></div>`;
}
function objDetail(o){
  if(!o)return objList();
  return `<button class="btn-ghost" data-act="backObj" style="margin-bottom:14px">← Volver a objetivos</button>
  <div class="scard">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><span class="tag">${esc(o.tag)}</span><input data-act="objF" data-f="name" value="${esc(o.name)}" style="flex:1;border:0;font-size:1.3em;font-weight:600;outline:none;font-family:inherit;color:var(--tx);background:transparent"></div>
    <div class="m-grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="m-field"><label>Área</label><select data-act="objF" data-f="area">${optionList(state.areas,o.area,"— sin área —")}</select></div>
      <div class="m-field"><label>Responsable del objetivo</label><select data-act="objF" data-f="owner">${optionList(state.responsables,o.owner,"— sin asignar —")}</select></div>
      <div class="m-field"><label>Estado actual</label><select data-act="objF" data-f="status">${OBJ_STATUS.map(s=>`<option ${s[0]===o.status?'selected':''}>${s[0]}</option>`).join("")}</select></div>
    </div>
  </div>
  ${indicatorsSection(o)}${planSection(o)}${linkedTasksSection(o)}${reviewSection(o)}`;
}
function indicatorsSection(o){
  const rows=o.indicators.map((ind,i)=>`<tr>
    <td><input value="${esc(ind.name)}" data-act="ind" data-i="${i}" data-f="name" placeholder="Nombre del indicador"></td>
    <td><input value="${esc(ind.unit)}" data-act="ind" data-i="${i}" data-f="unit" placeholder="$, %, u…" style="text-align:center"></td>
    <td><input value="${esc(ind.base)}" data-act="ind" data-i="${i}" data-f="base" placeholder="—" style="text-align:center"></td>
    <td><input value="${esc(ind.target)}" data-act="ind" data-i="${i}" data-f="target" placeholder="—" style="text-align:center"></td>
    <td><input value="${esc(ind.current)}" data-act="ind" data-i="${i}" data-f="current" placeholder="—" style="text-align:center"></td>
    <td class="del-c"><button class="row-del" data-act="delInd" data-i="${i}">🗑</button></td></tr>`).join("");
  return `<div class="scard"><h3>Indicadores y resultados</h3>
    <table class="mini-grid"><thead><tr><th>Indicador</th><th>Unidad</th><th>Línea base</th><th>Meta</th><th>Resultado actual</th><th></th></tr></thead>
    <tbody>${rows||'<tr><td colspan="6" style="padding:10px;color:var(--tx-faint);text-align:center;border:1px solid var(--line)">Sin indicadores todavía.</td></tr>'}</tbody></table>
    <button class="btn-ghost add-row" data-act="addInd">＋ Agregar indicador</button></div>`;
}
function planSection(o){
  const heads=MONTHS.map(m=>`<th class="${m===CUR?'cur':''}">${shortM(m)}</th>`).join("");
  const rows=o.plan.map((a,i)=>{
    const cells=MONTHS.map(m=>{ const v=a.months[m]||""; const st=PLAN_STATES[v]; return `<td class="mcell ${m===CUR?'cur':''}" style="background:${st.bg}" title="${shortM(m)} · ${planTitle(v)}" data-act="cycle" data-i="${i}" data-m="${m}">${st.mk}</td>`; }).join("");
    return `<tr><td class="plan-name"><input value="${esc(a.name)}" data-act="planName" data-i="${i}" placeholder="Acción o etapa"></td><td class="plan-resp"><select data-act="planResp" data-i="${i}">${optionList(state.responsables,a.resp,"—")}</select></td>${cells}<td class="del-c"><button class="row-del" data-act="delPlan" data-i="${i}">🗑</button></td></tr>`;
  }).join("");
  return `<div class="scard"><h3>Plan de acción <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--tx-faint)">— clic en cada celda: pendiente → en proceso → cumplido</span></h3>
    <div style="overflow-x:auto"><table class="plan-grid"><thead><tr><th class="plan-name">Acción / etapa</th><th class="plan-resp">Resp.</th>${heads}<th></th></tr></thead>
    <tbody>${rows||'<tr><td colspan="'+(MONTHS.length+3)+'" style="padding:10px;color:var(--tx-faint);text-align:center">Sin acciones todavía.</td></tr>'}</tbody></table></div>
    <div class="legend"><span><i style="background:#fde9c8"></i>Pendiente</span><span><i style="background:#cfe0fb"></i>En proceso</span><span><i style="background:#c7ebd3"></i>Cumplido</span><span><i style="background:transparent"></i>No programado</span></div>
    <button class="btn-ghost add-row" data-act="addPlan">＋ Agregar acción</button></div>`;
}
function linkedTasksSection(o){
  const linked=state.tasks.filter(t=>t.obj===o.tag);
  const rows=linked.map(t=>{ const st=stMeta(t.status); return `<div class="lt-row"><button class="lt-title" data-act="open" data-id="${t.id}">${esc(t.title)}</button><span class="status-pill ${st.cls}" style="cursor:default">${st.label}</span></div>`; }).join("");
  return `<div class="scard"><h3>Tareas vinculadas <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--tx-faint)">— ${linked.length} con la etiqueta ${esc(o.tag)}</span></h3>
    ${rows||'<p style="color:var(--tx-faint);font-size:.86em;margin:0 0 10px">Todavía no hay tareas con esta etiqueta.</p>'}
    <button class="btn-ghost add-row" data-act="newTaskObj" data-id="${o.tag}">＋ Nueva tarea para este objetivo</button></div>`;
}
function reviewFormData(o,ym){
  const ex=o.reviews.find(r=>r.month===ym); if(ex)return ex;
  const linked=state.tasks.filter(t=>t.obj===o.tag);
  return { month:ym, estado:o.status||"En curso", logros:linked.filter(t=>t.status==='comp').map(t=>'• '+t.title).join("\n"), problemas:"", ejecucion:linked.filter(t=>t.status==='proc').map(t=>'• '+t.title).join("\n"), proximo:"", fecha:"", respProximo:"", decisiones:"", hechaPor:"" };
}
function reviewSection(o){
  const ym=state.objReviewMonth||CUR; const d=reviewFormData(o,ym); const saved=state.justSavedReview===ym;
  const monthOpts=MONTHS.map(m=>`<option value="${m}" ${m===ym?'selected':''}>${monthLabel(m)}${o.reviews.find(r=>r.month===m)?'  ✓':''}</option>`).join("");
  const hist=[...o.reviews].sort((a,b)=>a.month<b.month?1:-1).map(r=>`<div class="hist-row ${r.month===ym?'active':''}" data-act="loadRev" data-m="${r.month}"><b>${monthLabel(r.month)}</b><span class="hsnip">${esc(r.decisiones||r.proximo||r.logros||'—')}</span><button class="row-del" data-act="delRev" data-m="${r.month}">🗑</button></div>`).join("");
  return `<div class="scard"><h3>Revisión por la dirección</h3>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><label style="font-size:.8em;color:var(--tx-dim);font-weight:600">Mes</label><select class="inp" style="min-width:190px" data-act="revMonth">${monthOpts}</select></div>
    <div class="m-field" style="margin-bottom:12px"><label>Estado actual</label><select id="rv_estado" class="inp" style="width:100%">${OBJ_STATUS.map(s=>`<option ${s[0]===d.estado?'selected':''}>${s[0]}</option>`).join("")}</select></div>
    <div class="m-field" style="margin-bottom:12px"><label>✅ Logros y avances confirmados</label><textarea id="rv_logros" class="m-detail" placeholder="Describir qué fue completado y está funcionando correctamente">${esc(d.logros)}</textarea></div>
    <div class="m-field" style="margin-bottom:12px"><label>⚠️ Problemas y desvíos detectados</label><textarea id="rv_problemas" class="m-detail" placeholder="Describir obstáculos, retrasos o resultados que difieren del plan">${esc(d.problemas)}</textarea></div>
    <div class="m-field" style="margin-bottom:12px"><label>🔄 En ejecución actualmente</label><textarea id="rv_ejecucion" class="m-detail" placeholder="Describir las acciones que están en curso en este momento">${esc(d.ejecucion)}</textarea></div>
    <div class="m-field" style="margin-bottom:12px"><label>▶️ Próximo paso concreto</label><textarea id="rv_proximo" class="m-detail" style="min-height:54px" placeholder="Definir la siguiente acción puntual">${esc(d.proximo)}</textarea></div>
    <div class="m-grid" style="margin-bottom:12px"><div class="m-field"><label>Fecha compromiso</label><input id="rv_fecha" type="date" class="inp" style="width:100%" value="${esc(d.fecha)}"></div><div class="m-field"><label>Responsable del próximo paso</label><select id="rv_respProximo" class="inp" style="width:100%">${optionList(state.responsables,d.respProximo,"— Sin asignar —")}</select></div></div>
    <div class="m-field" style="margin-bottom:12px"><label>📌 Decisiones tomadas</label><textarea id="rv_decisiones" class="m-detail" placeholder="Decisiones acordadas en la revisión">${esc(d.decisiones)}</textarea></div>
    <div class="m-field" style="margin-bottom:14px"><label>Hecha por</label><select id="rv_hechaPor" class="inp" style="width:100%">${optionList(state.responsables,d.hechaPor,"— Sin asignar —")}</select></div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button class="btn-primary" data-act="saveRev">Guardar revisión</button><button class="btn-ghost" data-act="taskFromNext">＋ Crear tarea del próximo paso</button>${saved?'<span style="color:var(--st-comp);font-size:.86em;font-weight:600">Guardada ✓</span>':''}</div>
    ${o.reviews.length?`<h4 style="font-size:.74em;text-transform:uppercase;letter-spacing:.5px;color:var(--tx-dim);margin:18px 0 10px">Historial de revisiones (${o.reviews.length})</h4>${hist}`:''}
  </div>`;
}

/* ============================================================
   SECCIONES OPERATIVAS (Administración, Calidad, …)
   ============================================================ */
function sectionView(secId){
  const scs=state.shortcuts.filter(s=>(s.section||"dashboard")===secId);
  const strip = scs.length
    ? `<div class="shortcuts" style="margin-bottom:14px">${scs.map(s=>`<a class="sc-btn" href="${esc(s.url||'#')}" target="_blank"><span class="ic">${esc(s.ic)}</span>${esc(s.label)}</a>`).join("")}</div>`
    : `<p style="color:var(--tx-faint);font-size:.82em;margin:0 0 14px">Sin accesos directos en esta sección — agregalos desde Configuración.</p>`;
  const tab=state.secTab;
  const tabs=`<div class="seg"><button class="${tab==='tareas'?'on':''}" data-act="secTab" data-id="tareas">☑ Tareas del área</button><button class="${tab==='venc'?'on':''}" data-act="secTab" data-id="venc">⏰ Vencimientos</button><button class="${tab==='reu'?'on':''}" data-act="secTab" data-id="reu">🗓 Reuniones</button></div>`;
  let body;
  if(tab==='venc') body=sectionVenc(secId);
  else if(tab==='reu') body=sectionReuniones(secId);
  else body=sectionTasks(secId);
  return `${strip}<div class="toolbar">${tabs}</div>${body}`;
}

/* ---------- Tareas del área ---------- */
function sectionTasks(secId){
  const areas=SECTION_AREAS[secId]||[];
  let list=state.tasks.filter(t=>areas.includes(t.area));
  if(!state.showDone) list=list.filter(t=>t.status!=='comp'&&t.status!=='desc');
  list=[...list].sort((a,b)=>(a.due||'9999-99-99')<(b.due||'9999-99-99')?-1:1);
  const rows=list.map(t=>{ const st=stMeta(t.status); return `<tr>
    <td class="num">${t.n}</td>
    <td><button class="task-title" data-act="open" data-id="${t.id}">${esc(t.title)}</button></td>
    <td><select class="status-pill ${st.cls}" data-act="setF" data-id="${t.id}" data-f="status">${STATUSES.map(s=>`<option value="${s.key}" ${s.key===t.status?'selected':''}>${s.label}</option>`).join("")}</select></td>
    <td class="date ${dueClass(t.due)}">${fmt(t.due)}</td>
    <td><select class="cell-edit" data-act="setF" data-id="${t.id}" data-f="area">${optionList(state.areas,t.area,"—")}</select></td>
    <td><select class="cell-edit" data-act="setF" data-id="${t.id}" data-f="resp">${optionList(state.responsables,t.resp,"—")}</select></td>
    <td>${t.obj?`<span class="tag">${esc(t.obj)}</span>`:'<span style="color:var(--tx-faint)">—</span>'}</td></tr>`; }).join("");
  return `<div style="display:flex;gap:10px;margin-bottom:12px;align-items:center;flex-wrap:wrap">
      <span style="font-size:.82em;color:var(--tx-faint)">Áreas incluidas: ${areas.map(esc).join(' · ')}</span>
      <div style="flex:1"></div>
      <button class="btn-ghost ${state.showDone?'on':''}" data-act="toggleDone">${state.showDone?'Ocultar':'Ver'} completadas</button>
      <button class="btn-primary" data-act="addTaskSec" data-id="${secId}">＋ Nueva tarea</button>
    </div>
    <div class="table-wrap"><table class="tasks" style="min-width:780px"><thead><tr><th>N°</th><th>Tarea</th><th>Estado</th><th>Vence</th><th>Área</th><th>Responsable</th><th>Objetivo</th></tr></thead>
    <tbody>${rows||'<tr><td colspan="7"><div class="empty">No hay tareas en estas áreas. Creá una, o asigná una de estas áreas a tus tareas en Seguimiento.</div></td></tr>'}</tbody></table></div>`;
}
function addTaskForSection(secId){ const areas=SECTION_AREAS[secId]||[]; const t={id:crypto.randomUUID(),n:state.seq++,created:today(),title:"Nueva tarea",status:"sin",due:"",area:areas[0]||"",resp:"",obj:"",url:"",file:null,detail:"",recur:"",subs:[]}; state.tasks.unshift(t); saveTaskNow(t.id); render(); openModal(t.id); }

/* ---------- Vencimientos ---------- */
function nextVencDate(due,per){ const d=due?new Date(due+"T00:00"):new Date(); switch(per){ case 'mensual':d.setMonth(d.getMonth()+1);break; case 'bimestral':d.setMonth(d.getMonth()+2);break; case 'trimestral':d.setMonth(d.getMonth()+3);break; case 'cuatrimestral':d.setMonth(d.getMonth()+4);break; case 'semestral':d.setMonth(d.getMonth()+6);break; case 'anual':d.setFullYear(d.getFullYear()+1);break; default:return null; } return d.toISOString().slice(0,10); }
function addVenc(secId){ const v={id:crypto.randomUUID(),area:secId,concepto:"",tipo:"Impuesto",due:"",periodicidad:"mensual",resp:"",status:"pend",url:"",nota:""}; state.vencimientos.push(v); saveVencNow(v.id); render(); }
function toggleVenc(id){ const v=getVenc(id); if(!v)return;
  if(v.status!=='ok'){ v.status='ok';
    if(v.periodicidad&&v.periodicidad!=='unica'){ const nd=nextVencDate(v.due,v.periodicidad); if(nd){ const nv={id:crypto.randomUUID(),area:v.area,concepto:v.concepto,tipo:v.tipo,due:nd,periodicidad:v.periodicidad,resp:v.resp,status:'pend',url:v.url,nota:v.nota}; state.vencimientos.push(nv); saveVencNow(nv.id); toast("Próximo vencimiento generado: "+fmt(nd)); } }
  } else v.status='pend';
  scheduleSaveVenc(id); render();
}
function vencRow(v){
  const dueCls=v.status==='ok'?'':dueClass(v.due);
  const estado=v.status==='ok'
    ? `<button class="status-pill st-comp" data-act="vencToggle" data-id="${v.id}">Cumplido</button>`
    : `<button class="status-pill st-proc" data-act="vencToggle" data-id="${v.id}">Pendiente</button>`;
  return `<tr>
    <td><input class="cell-edit" style="min-width:160px" value="${esc(v.concepto)}" data-act="vencF" data-id="${v.id}" data-f="concepto" placeholder="Qué vence"></td>
    <td><select class="cell-edit" data-act="vencF" data-id="${v.id}" data-f="tipo">${VENC_TIPO.map(t=>`<option ${t===v.tipo?'selected':''}>${t}</option>`).join("")}</select></td>
    <td><input type="date" class="cell-edit ${dueCls}" value="${esc(v.due)}" data-act="vencF" data-id="${v.id}" data-f="due"></td>
    <td><select class="cell-edit" data-act="vencF" data-id="${v.id}" data-f="periodicidad">${PERIODICIDAD.map(p=>`<option value="${p[0]}" ${p[0]===v.periodicidad?'selected':''}>${p[1]}</option>`).join("")}</select></td>
    <td><select class="cell-edit" data-act="vencF" data-id="${v.id}" data-f="resp">${optionList(state.responsables,v.resp,"—")}</select></td>
    <td><input class="cell-edit" style="min-width:150px" value="${esc(v.nota)}" data-act="vencF" data-id="${v.id}" data-f="nota" placeholder="Nota / link"></td>
    <td style="text-align:center">${estado}</td>
    <td style="text-align:center"><button class="row-del" data-act="vencDel" data-id="${v.id}">🗑</button></td></tr>`;
}
function sectionVenc(secId){
  const all=state.vencimientos.filter(v=>v.area===secId);
  const f=state.vencFilter;
  let list=all.filter(v=>(!f.tipo||v.tipo===f.tipo)&&(!f.status||v.status===f.status));
  list=[...list].sort((a,b)=>{ const av=a.status==='ok'?1:0,bv=b.status==='ok'?1:0; if(av!==bv)return av-bv; return (a.due||'9999-99-99')<(b.due||'9999-99-99')?-1:1; });
  const t0=today(), in30=new Date(Date.now()+30*864e5).toISOString().slice(0,10);
  const nVenc=all.filter(v=>v.status!=='ok'&&v.due&&v.due<t0).length;
  const nProx=all.filter(v=>v.status!=='ok'&&v.due&&v.due>=t0&&v.due<=in30).length;
  const chip=(txt,bg,fg)=>`<span style="background:${bg};color:${fg};border-radius:20px;padding:3px 11px;font-size:.84em;font-weight:600">${txt}</span>`;
  const rows=list.map(vencRow).join("");
  return `<div style="display:flex;gap:9px;align-items:center;margin-bottom:13px;flex-wrap:wrap">
      ${chip(nVenc+' vencidas','#fdecec','#c2353a')}${chip(nProx+' en 30 días','#fdf3e2','#b4760a')}${chip(all.length+' en total','var(--line-2)','var(--tx-dim)')}
      <div style="flex:1"></div>
      <select class="inp" data-act="vencFilter" data-id="tipo"><option value="">Todos los tipos</option>${VENC_TIPO.map(t=>`<option ${f.tipo===t?'selected':''}>${t}</option>`).join("")}</select>
      <select class="inp" data-act="vencFilter" data-id="status"><option value="">Todos</option><option value="pend" ${f.status==='pend'?'selected':''}>Pendientes</option><option value="ok" ${f.status==='ok'?'selected':''}>Cumplidos</option></select>
      <button class="btn-primary" data-act="vencAdd" data-id="${secId}">＋ Nuevo vencimiento</button>
    </div>
    <div class="table-wrap"><table class="tasks" style="min-width:920px"><thead><tr><th>Concepto</th><th>Tipo</th><th>Vence</th><th>Periodicidad</th><th>Responsable</th><th>Nota / link</th><th style="text-align:center">Estado</th><th></th></tr></thead>
    <tbody>${rows||'<tr><td colspan="8"><div class="empty">Sin vencimientos cargados. Agregá impuestos, contratos, licencias, seguros, certificaciones…</div></td></tr>'}</tbody></table></div>
    <p style="color:var(--tx-faint);font-size:.8em;margin-top:10px">Al marcar como <b>Cumplido</b> uno que se repite, se genera solo el próximo con la fecha corrida.</p>`;
}

/* ---------- Reuniones ---------- */
function addReunion(secId){ const r={id:crypto.randomUUID(),area:secId,fecha:today(),titulo:"",participantes:"",temas:"",decisiones:"",compromisos:[],proxima:""}; state.reuniones.unshift(r); saveReuNow(r.id); state.reuSel=r.id; render(); }
function readReuForm(r){ const g=id=>{const e=$("#"+id);return e?e.value:undefined;}; const map={reu_titulo:'titulo',reu_fecha:'fecha',reu_part:'participantes',reu_temas:'temas',reu_dec:'decisiones',reu_prox:'proxima'}; for(const[el,fld] of Object.entries(map)){ const v=g(el); if(v!==undefined)r[fld]=v; } }
function taskFromCompromiso(i){ const r=getReu(state.reuSel); if(!r)return; const c=r.compromisos[i]; if(!c||!c.t.trim()){toast("Escribí el compromiso primero");return;} const areas=SECTION_AREAS[r.area]||[]; const t={id:crypto.randomUUID(),n:state.seq++,created:today(),title:c.t.trim(),status:"sin",due:"",area:areas[0]||"",resp:"",obj:"",url:"",file:null,detail:"Compromiso de reunión: "+(r.titulo||fmt(r.fecha)),recur:"",subs:[]}; state.tasks.unshift(t); saveTaskNow(t.id); c.taskId=t.id; readReuForm(r); scheduleSaveReu(r.id); render(); toast("Tarea creada en Seguimiento"); }
function sectionReuniones(secId){
  if(state.reuSel) return reunionEditor(secId,getReu(state.reuSel));
  const list=state.reuniones.filter(r=>r.area===secId).sort((a,b)=>(a.fecha||'')<(b.fecha||'')?1:-1);
  const cards=list.map(r=>{ const nC=r.compromisos.length,nD=r.compromisos.filter(c=>c.done).length;
    return `<button class="card" style="min-height:auto" data-act="reuOpen" data-id="${r.id}">
      <div style="display:flex;justify-content:space-between;align-items:center;width:100%;gap:8px"><h4>${esc(r.titulo||'(sin título)')}</h4><span style="font-size:.82em;color:var(--tx-dim);white-space:nowrap">${r.fecha?fmt(r.fecha):'—'}</span></div>
      <div class="stat" style="margin-top:2px">${r.participantes?esc(r.participantes):'<span style="color:var(--tx-faint)">Sin participantes</span>'}</div>
      ${nC?`<div style="font-size:.82em;color:var(--tx-dim)">☑ ${nD}/${nC} compromisos</div>`:''}</button>`;
  }).join("");
  return `<div style="display:flex;margin-bottom:13px"><div style="flex:1"></div><button class="btn-primary" data-act="reuNew" data-id="${secId}">＋ Registrar reunión</button></div>
    ${list.length?`<div class="cards">${cards}</div>`:'<div class="table-wrap"><div class="empty">Todavía no registraste reuniones en esta área.</div></div>'}`;
}
function reunionEditor(secId,r){
  if(!r){ state.reuSel=null; return sectionReuniones(secId); }
  const comps=r.compromisos.map((c,i)=>`<div class="sub ${c.done?'done':''}"><input type="checkbox" ${c.done?'checked':''} data-act="reuCompChk" data-i="${i}"><input class="sx" value="${esc(c.t)}" data-act="reuCompTxt" data-i="${i}"><button class="btn-ghost" style="padding:2px 8px;font-size:.76em" data-act="reuCompTask" data-i="${i}" title="Crear tarea en Seguimiento">${c.taskId?'✓ tarea':'＋ tarea'}</button><button class="del" data-act="reuCompDel" data-i="${i}" style="opacity:1">🗑</button></div>`).join("");
  return `<button class="btn-ghost" data-act="reuBack" style="margin-bottom:14px">← Volver a reuniones</button>
  <div class="scard">
    <div class="m-grid" style="grid-template-columns:1fr 170px">
      <div class="m-field"><label>Título / motivo</label><input id="reu_titulo" value="${esc(r.titulo)}" data-act="reuF" data-f="titulo" placeholder="Ej. Revisión semanal de operaciones"></div>
      <div class="m-field"><label>Fecha</label><input id="reu_fecha" type="date" value="${esc(r.fecha)}" data-act="reuF" data-f="fecha"></div>
    </div>
    <div class="m-field" style="margin-top:11px"><label>Participantes</label><input id="reu_part" value="${esc(r.participantes)}" data-act="reuF" data-f="participantes" placeholder="Nombres separados por coma"></div>
    <div class="m-field" style="margin-top:11px"><label>Temas tratados</label><textarea id="reu_temas" class="m-detail" data-act="reuF" data-f="temas" placeholder="Orden del día / lo conversado">${esc(r.temas)}</textarea></div>
    <div class="m-field" style="margin-top:11px"><label>Decisiones</label><textarea id="reu_dec" class="m-detail" data-act="reuF" data-f="decisiones" placeholder="Qué se decidió">${esc(r.decisiones)}</textarea></div>
    <div style="margin-top:14px"><div class="m-block-h"><span>Compromisos / acciones</span><span class="sub-prog">${r.compromisos.filter(c=>c.done).length}/${r.compromisos.length}</span></div>
      <div class="subs">${comps||'<p style="color:var(--tx-faint);font-size:.84em;margin:0">Sin compromisos. Agregá abajo.</p>'}</div>
      <div class="sub-add"><input id="reu_newcomp" placeholder="Agregar compromiso y Enter…" data-act="reuCompAdd" data-ev="keydown"></div>
      <p style="color:var(--tx-faint);font-size:.78em;margin:6px 0 0">“＋ tarea” crea una tarea en Seguimiento, en el área de esta sección.</p></div>
    <div class="m-field" style="margin-top:14px;max-width:200px"><label>Próxima reunión</label><input id="reu_prox" type="date" value="${esc(r.proxima)}" data-act="reuF" data-f="proxima"></div>
    <div class="modal-foot" style="margin:16px -18px -16px;border-radius:0"><button class="link-danger" data-act="reuDel" data-id="${r.id}">Eliminar reunión</button><button class="btn-primary" data-act="reuBack">Listo</button></div>
  </div>`;
}

/* ============================================================
   CONFIG
   ============================================================ */
function viewConfig(){
  const chips=(arr,kind)=>arr.map((a,i)=>`<span class="chip">${esc(a)}<button data-act="cfgDel" data-kind="${kind}" data-i="${i}">✕</button></span>`).join("");
  const objChips=state.objetivos.map((o,i)=>`<span class="chip">${esc(o.tag)} · ${esc(o.name)}<button data-act="cfgDel" data-kind="obj" data-i="${i}">✕</button></span>`).join("");
  const scSecOpts=(sel)=>{ const all=[["dashboard","Dashboard"]].concat(SECTIONS.filter(s=>s.id!=="dashboard").map(s=>[s.id,s.label])); return all.map(([v,l])=>`<option value="${v}" ${ (sel||"dashboard")===v?'selected':''}>${esc(l)}</option>`).join(""); };
  const scRows=state.shortcuts.map((s,i)=>`<div class="sc-edit"><input class="inp" style="width:46px;text-align:center" value="${esc(s.ic)}" data-act="scF" data-i="${i}" data-f="ic"><input class="inp" style="flex:0 0 140px" value="${esc(s.label)}" data-act="scF" data-i="${i}" data-f="label" placeholder="Nombre"><input class="inp" style="flex:1;min-width:120px" value="${esc(s.url)}" data-act="scF" data-i="${i}" data-f="url" placeholder="https://…"><select class="inp" style="flex:0 0 150px" data-act="scF" data-i="${i}" data-f="section">${scSecOpts(s.section)}</select><button class="row-del" data-act="scDel" data-i="${i}">🗑</button></div>`).join("");
  const sw=Object.entries(PALETTES).map(([k,p])=>`<button class="swatch ${state.theme===k?'on':''}" data-act="theme" data-k="${k}"><div class="prev"><i style="background:${p.vars['--sidebar']}"></i><i style="background:${p.vars['--accent']}"></i><i style="background:${p.vars['--bg']}"></i><i style="background:${p.vars['--panel']}"></i></div><div class="nm">${p.name}</div></button>`).join("");
  return `<div class="cfg-grid">
    <div class="cfg-card"><h3>Áreas</h3><div class="chip-list">${chips(state.areas,'area')}</div><div class="cfg-add"><input id="cfgArea" placeholder="Nueva área…" data-act="cfgAddKey" data-ev="keydown" data-kind="area"><button data-act="cfgAdd" data-kind="area">＋</button></div></div>
    <div class="cfg-card"><h3>Responsables</h3><div class="chip-list">${chips(state.responsables,'resp')}</div><div class="cfg-add"><input id="cfgResp" placeholder="Nuevo responsable…" data-act="cfgAddKey" data-ev="keydown" data-kind="resp"><button data-act="cfgAdd" data-kind="resp">＋</button></div></div>
    <div class="cfg-card"><h3>Objetivos (tags)</h3><div class="chip-list">${objChips}</div><div class="cfg-add"><input id="cfgObjTag" placeholder="TAG" style="max-width:90px"><input id="cfgObjName" placeholder="Nombre del objetivo…"><button data-act="cfgAdd" data-kind="obj">＋</button></div></div>
  </div>
  <div class="scard" style="margin-top:16px"><h3 style="font-size:.92em;color:var(--tx);text-transform:none;letter-spacing:0">Paleta de colores</h3><div class="swatches">${sw}</div></div>
  <div class="scard"><h3 style="font-size:.92em;color:var(--tx);text-transform:none;letter-spacing:0">Accesos directos</h3>
    ${scRows||'<p style="color:var(--tx-faint);font-size:.86em">Sin accesos directos.</p>'}
    <button class="btn-ghost add-row" data-act="scAdd">＋ Agregar acceso directo</button>
    <p style="color:var(--tx-faint);font-size:.8em;margin:10px 0 0">El primer campo es el ícono (podés pegar un emoji). Con el último menú elegís en qué sección aparece (Dashboard, Administración, Calidad, etc.).</p></div>
  <p style="color:var(--tx-faint);font-size:.82em;margin-top:14px">Las áreas y responsables alimentan los menús de tareas y objetivos.</p>`;
}

/* ============================================================
   ACTIONS (event delegation)
   ============================================================ */
const ACTIONS = {
  goCard:(el)=>go(el.dataset.id),
  taskView:(el)=>{ state.taskView=el.dataset.id; render(); },
  filter:(el)=>{ state.filters[el.dataset.id]=el.value; paintTasks(); },
  group:(el)=>{ state.group=el.value; paintTasks(); },
  toggleDone:()=>{ state.showDone=!state.showDone; render(); },
  addTask:()=>addTask(),
  sort:(el)=>{ const c=el.dataset.id,s=state.sort; if(s.col===c)s.dir=s.dir==='asc'?'desc':'asc'; else{s.col=c;s.dir='asc';} paintTasks(); },
  open:(el)=>openModal(el.dataset.id),
  setF:(el)=>setField(el.dataset.id,el.dataset.f,el.value),
  // objetivos
  openObj:(el)=>openObj(el.dataset.id),
  backObj:()=>{ state.objSel=null; render(); },
  addObj:()=>addObjetivo(),
  objArea:(el)=>{ state.objFilterArea=el.value; render(); },
  objF:(el)=>{ const o=getObjById(state.objSel); o[el.dataset.f]=el.value; scheduleSaveObj(o.id); if(el.dataset.f==='name'){} else render(); },
  ind:(el)=>{ const o=getObjById(state.objSel); o.indicators[+el.dataset.i][el.dataset.f]=el.value; scheduleSaveObj(o.id); },
  addInd:()=>{ const o=getObjById(state.objSel); o.indicators.push({name:"",unit:"",base:"",target:"",current:""}); scheduleSaveObj(o.id); render(); },
  delInd:(el)=>{ const o=getObjById(state.objSel); o.indicators.splice(+el.dataset.i,1); scheduleSaveObj(o.id); render(); },
  planName:(el)=>{ const o=getObjById(state.objSel); o.plan[+el.dataset.i].name=el.value; scheduleSaveObj(o.id); },
  planResp:(el)=>{ const o=getObjById(state.objSel); o.plan[+el.dataset.i].resp=el.value; scheduleSaveObj(o.id); },
  addPlan:()=>{ const o=getObjById(state.objSel); o.plan.push({name:"",resp:"",months:{}}); scheduleSaveObj(o.id); render(); },
  delPlan:(el)=>{ const o=getObjById(state.objSel); o.plan.splice(+el.dataset.i,1); scheduleSaveObj(o.id); render(); },
  cycle:(el)=>{ const o=getObjById(state.objSel),i=+el.dataset.i,m=el.dataset.m,order=["","pend","proc","cump"]; const cur=o.plan[i].months[m]||""; const nx=order[(order.indexOf(cur)+1)%order.length]; if(nx)o.plan[i].months[m]=nx; else delete o.plan[i].months[m]; scheduleSaveObj(o.id); render(); },
  newTaskObj:(el)=>newTaskForObj(el.dataset.id),
  revMonth:(el)=>{ state.objReviewMonth=el.value; state.justSavedReview=null; render(); },
  loadRev:(el)=>{ state.objReviewMonth=el.dataset.m; state.justSavedReview=null; render(); },
  delRev:(el,e)=>{ e.stopPropagation(); const o=getObjById(state.objSel); o.reviews=o.reviews.filter(r=>r.month!==el.dataset.m); scheduleSaveObj(o.id); render(); },
  saveRev:()=>saveReview(),
  taskFromNext:()=>taskFromNextStep(),
  // secciones operativas
  secTab:(el)=>{ state.secTab=el.dataset.id; state.reuSel=null; render(); },
  addTaskSec:(el)=>addTaskForSection(el.dataset.id),
  vencAdd:(el)=>addVenc(el.dataset.id),
  vencF:(el)=>{ const v=getVenc(el.dataset.id); if(!v)return; v[el.dataset.f]=el.value; scheduleSaveVenc(v.id); if(el.tagName==='SELECT'||el.type==='date')render(); },
  vencToggle:(el)=>toggleVenc(el.dataset.id),
  vencDel:(el)=>{ const id=el.dataset.id; state.vencimientos=state.vencimientos.filter(v=>v.id!==id); deleteVencDb(id); render(); },
  vencFilter:(el)=>{ state.vencFilter[el.dataset.id]=el.value; render(); },
  reuNew:(el)=>addReunion(el.dataset.id),
  reuOpen:(el)=>{ state.reuSel=el.dataset.id; render(); },
  reuBack:()=>{ state.reuSel=null; render(); },
  reuDel:(el)=>{ const id=el.dataset.id; state.reuniones=state.reuniones.filter(x=>x.id!==id); deleteReuDb(id); state.reuSel=null; render(); },
  reuF:(el)=>{ const r=getReu(state.reuSel); if(!r)return; r[el.dataset.f]=el.value; scheduleSaveReu(r.id); },
  reuCompTxt:(el)=>{ const r=getReu(state.reuSel); if(!r)return; r.compromisos[+el.dataset.i].t=el.value; scheduleSaveReu(r.id); },
  reuCompChk:(el)=>{ const r=getReu(state.reuSel); if(!r)return; readReuForm(r); r.compromisos[+el.dataset.i].done=el.checked; scheduleSaveReu(r.id); render(); },
  reuCompDel:(el)=>{ const r=getReu(state.reuSel); if(!r)return; readReuForm(r); r.compromisos.splice(+el.dataset.i,1); scheduleSaveReu(r.id); render(); },
  reuCompAdd:(el,e)=>{ if(e.key!=='Enter')return; const v=el.value.trim(); if(!v)return; const r=getReu(state.reuSel); if(!r)return; readReuForm(r); r.compromisos.push({t:v,done:false,taskId:null}); saveReuNow(r.id); render(); setTimeout(()=>{const n=$("#reu_newcomp"); if(n)n.focus();},10); },
  reuCompTask:(el)=>taskFromCompromiso(+el.dataset.i),
  // config
  cfgAdd:(el)=>cfgAdd(el.dataset.kind),
  cfgAddKey:(el,e)=>{ if(e.key==='Enter')cfgAdd(el.dataset.kind); },
  cfgDel:(el)=>cfgDel(el.dataset.kind,+el.dataset.i),
  scF:(el)=>{ state.shortcuts[+el.dataset.i][el.dataset.f]=el.value; scheduleSaveSettings(); },
  scAdd:()=>{ state.shortcuts.push({ic:"🔗",label:"Nuevo acceso",url:"#",section:"dashboard"}); scheduleSaveSettings(); render(); },
  scDel:(el)=>{ state.shortcuts.splice(+el.dataset.i,1); scheduleSaveSettings(); render(); },
  theme:(el)=>{ applyTheme(el.dataset.k); scheduleSaveSettings(); render(); },
};
/* fix: objF for name should not re-render (perdería foco). Re-render solo para selects. */
ACTIONS.objF=(el)=>{ const o=getObjById(state.objSel); o[el.dataset.f]=el.value; scheduleSaveObj(o.id); if(el.tagName==="SELECT")render(); };

function openObj(id){ state.view='objetivos'; state.objSel=id; state.objReviewMonth=CUR; state.justSavedReview=null; render(); }
function addObjetivo(){ const o=newObjetivo("OBJ"+(state.objetivos.length+1),"Nuevo objetivo"); state.objetivos.push(o); saveObjNow(o.id); openObj(o.id); }
function saveReview(){
  const o=getObjById(state.objSel); const ym=state.objReviewMonth||CUR;
  const r={ month:ym, estado:$("#rv_estado").value, logros:$("#rv_logros").value, problemas:$("#rv_problemas").value, ejecucion:$("#rv_ejecucion").value, proximo:$("#rv_proximo").value, fecha:$("#rv_fecha").value, respProximo:$("#rv_respProximo").value, decisiones:$("#rv_decisiones").value, hechaPor:$("#rv_hechaPor").value };
  const idx=o.reviews.findIndex(x=>x.month===ym); if(idx>=0)o.reviews[idx]=r; else o.reviews.push(r);
  o.status=r.estado; state.justSavedReview=ym; saveObjNow(o.id); render(); toast("Revisión guardada");
}
function taskFromNextStep(){
  const o=getObjById(state.objSel); const titulo=$("#rv_proximo").value.trim(); if(!titulo){ toast("Escribí el próximo paso primero"); return; }
  const t={id:crypto.randomUUID(),n:state.seq++,created:today(),title:titulo,status:"sin",due:$("#rv_fecha").value||"",area:o.area||"",resp:$("#rv_respProximo").value||"",obj:o.tag,url:"",file:null,detail:"",recur:"",subs:[]};
  state.tasks.unshift(t); saveTaskNow(t.id); render(); toast("Tarea creada");
}
function cfgAdd(kind){
  if(kind==='area'){ const v=$("#cfgArea").value.trim(); if(v&&!state.areas.includes(v)){ state.areas.push(v); scheduleSaveSettings(); } }
  if(kind==='resp'){ const v=$("#cfgResp").value.trim(); if(v&&!state.responsables.includes(v)){ state.responsables.push(v); scheduleSaveSettings(); } }
  if(kind==='obj'){ const tag=$("#cfgObjTag").value.trim().toUpperCase(); const nm=$("#cfgObjName").value.trim(); if(tag&&nm){ const o=newObjetivo(tag,nm); state.objetivos.push(o); saveObjNow(o.id); } }
  render();
}
function cfgDel(kind,i){
  if(kind==='area'){ state.areas.splice(i,1); scheduleSaveSettings(); }
  if(kind==='resp'){ state.responsables.splice(i,1); scheduleSaveSettings(); }
  if(kind==='obj'){ const o=state.objetivos[i]; state.objetivos.splice(i,1); if(o)deleteObjDb(o.id); }
  render();
}

/* ============================================================
   Autenticación / arranque
   ============================================================ */
let signupMode=false;
function authMsg(text,kind){ const m=$("#authMsg"); m.className="auth-msg "+(kind||""); m.textContent=text||""; }
function refreshAuthUI(){
  $("#authBtn").textContent = signupMode ? "Crear cuenta" : "Iniciar sesión";
  $("#authSub").textContent = signupMode ? "Creá tu cuenta para empezar" : "Iniciá sesión para continuar";
  $("#authAlt").innerHTML = signupMode
    ? '¿Ya tenés cuenta? <a id="authToggle">Iniciar sesión</a>'
    : '¿No tenés cuenta? <a id="authToggle">Crear una</a>';
  $("#authToggle").onclick=()=>{ signupMode=!signupMode; authMsg(""); refreshAuthUI(); };
}
function setupAuthUI(){
  refreshAuthUI();
  $("#authBtn").onclick=doAuth;
  $("#authPass").onkeydown=e=>{ if(e.key==='Enter')doAuth(); };
}
async function doAuth(){
  if(!CONFIGURED){ authMsg("Falta configurar config.js con tu proyecto de Supabase.","err"); return; }
  const email=$("#authEmail").value.trim(), password=$("#authPass").value;
  if(!email||!password){ authMsg("Completá email y contraseña.","err"); return; }
  authMsg("Procesando…");
  if(signupMode){
    const {error}=await sb.auth.signUp({email,password});
    if(error){ authMsg(error.message,"err"); return; }
    authMsg("Cuenta creada. Si pide confirmar por email, revisá tu casilla. Si no, ya podés iniciar sesión.","ok");
  } else {
    const {error}=await sb.auth.signInWithPassword({email,password});
    if(error){ authMsg(error.message,"err"); return; }
  }
}
function showAuth(){ booted=false; $("#app").style.display="none"; $("#auth").style.display="flex"; }
async function enterApp(){
  $("#auth").style.display="none"; $("#app").style.display="flex";
  if(booted) return; booted=true;
  try{ await loadAll(); }catch(err){ toast("Error cargando datos: "+err.message); }
  render();
}
function updateSideFoot(email){ $("#sideFoot").innerHTML=`<span class="who" title="${esc(email)}">${esc(email)}</span><button id="logout">Cerrar sesión</button>`; $("#logout").onclick=()=>sb.auth.signOut(); }

function setupShell(){
  $("#fsDown").onclick=()=>setScale(-1); $("#fsReset").onclick=()=>setScale(0); $("#fsUp").onclick=()=>setScale(1);
  $("#overlay").onclick=e=>{ if(e.target.id==="overlay")closeModal(); };
}

/* init */
applyTheme("grafito");
setupAuthUI();
setupShell();
if(!CONFIGURED){
  showAuth();
  authMsg("Para empezar: completá config.js con la URL y la anon key de tu proyecto Supabase, y volvé a abrir la página.","err");
} else {
  sb.auth.onAuthStateChange((event,session)=>{
    if(session && session.user){ UID=session.user.id; updateSideFoot(session.user.email||""); enterApp(); }
    else { UID=null; showAuth(); }
  });
  sb.auth.getSession().then(({data})=>{
    if(data.session && data.session.user){ UID=data.session.user.id; updateSideFoot(data.session.user.email||""); enterApp(); }
    else showAuth();
  });
}

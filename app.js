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

const SECTIONS = [{id:"dashboard",label:"Dashboard",ic:"▦"},{id:"objetivos",label:"Objetivos",ic:"◎"},{id:"tareas",label:"Seguimiento de Tareas",ic:"☑"},{id:"admin",label:"Administración · Finanzas",ic:"$"},{id:"calidad",label:"Calidad",ic:"✦"},{id:"logistica",label:"Logística · Compras",ic:"⛟"},{id:"sistemas",label:"Sistemas",ic:"⚙"},{id:"leex",label:"LEEX",ic:"◈"}];
const CARD_STYLE = {objetivos:{bg:"#eef1ff",fg:"#4453c4"},tareas:{bg:"#e8f6ee",fg:"#15803d"},admin:{bg:"#fdf3e2",fg:"#b4760a"},calidad:{bg:"#f3eefe",fg:"#7b4fd0"},logistica:{bg:"#e6f3fb",fg:"#1f7bb6"},sistemas:{bg:"#eef0f3",fg:"#5b6471"},leex:{bg:"#e9f7f3",fg:"#0f8a6e"}};

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
  leex:["LEEX"],
};
const OPS_ENABLED = ["admin","calidad","logistica","sistemas","leex"]; // secciones operativas activas
const REPO_SECTIONS = ["admin","calidad"]; // secciones con pestaña Repositorio
const VENC_TIPO = ["Impuesto","Contrato","Licencia","Seguro","Certificación","Servicio","Pago","Habilitación","Auditoría","Otro"];
const PERIODICIDAD = [["unica","Única vez"],["mensual","Mensual"],["bimestral","Bimestral"],["trimestral","Trimestral"],["cuatrimestral","Cuatrimestral"],["semestral","Semestral"],["anual","Anual"]];
const perLabel = k => (PERIODICIDAD.find(p=>p[0]===k)||["","Única vez"])[1];

/* ============================================================
   Estado
   ============================================================ */
const DEFAULTS = {
  areas:["Administración","Contabilidad","Finanzas","Marketing","Calidad","Logística","Compras","Sistemas","LEEX"],
  responsables:["Alejandro","Diego","Leandro","Claudio"],
  shortcuts:[{ic:"📅",label:"Notion Calendar",url:"#",section:"dashboard"},{ic:"✉️",label:"Correo",url:"#",section:"dashboard"},{ic:"🗂️",label:"Notion",url:"#",section:"dashboard"},{ic:"📊",label:"Odoo",url:"#",section:"dashboard"}],
  theme:"grafito",
};
const state = {
  view:"dashboard", taskView:"tabla", scale:1, seq:1,
  sort:{col:"n",dir:"asc"}, group:"", showDone:false,
  objSel:null, objReviewMonth:null, objFilterArea:"", justSavedReview:null,
  secTab:"tareas", vencFilter:{tipo:"",status:""}, reuSel:null, secScEdit:false, reuView:"lista",
  areas:[], responsables:[], objetivos:[], shortcuts:[], theme:"grafito",
  filters:{estado:"",area:"",resp:"",venc:"",q:""},
  tasks:[], vencimientos:[], reuniones:[], documentos:[], bloques:[],
  blocksDate:null, blockPick:null, blkView:"agenda", blkOpen:null, weekReview:null,
  cal:{}, calLoaded:false, calLoading:false, calError:null,
  adm:{}, admLoaded:false, admLoading:false, admError:null, admCierreSel:null,
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
function serTask(t){ return {id:t.id,user_id:UID,n:t.n,created:t.created||null,title:t.title||"",status:t.status||"sin",due:t.due||null,area:t.area||null,resp:t.resp||null,obj:t.obj||null,url:t.url||null,file:t.file||null,files:t.files||[],detail:t.detail||null,recur:t.recur||null,subs:t.subs||[]}; }
function serObj(o){ return {id:o.id,user_id:UID,tag:o.tag||"",name:o.name||"",area:o.area||null,owner:o.owner||null,status:o.status||"En curso",indicators:o.indicators||[],plan:o.plan||[],reviews:o.reviews||[]}; }
function deTask(r){ return {id:r.id,n:r.n,created:r.created||"",title:r.title||"",status:r.status||"sin",due:r.due||"",area:r.area||"",resp:r.resp||"",obj:r.obj||"",url:r.url||"",file:r.file||null,files:r.files||[],detail:r.detail||"",recur:r.recur||"",subs:r.subs||[]}; }
function deObj(r){ return {id:r.id,tag:r.tag||"",name:r.name||"",area:r.area||"",owner:r.owner||"",status:r.status||"En curso",indicators:r.indicators||[],plan:r.plan||[],reviews:r.reviews||[]}; }
function serVenc(v){ return {id:v.id,user_id:UID,area:v.area||null,concepto:v.concepto||"",tipo:v.tipo||null,due:v.due||null,periodicidad:v.periodicidad||"unica",resp:v.resp||null,status:v.status||"pend",url:v.url||null,nota:v.nota||null}; }
function deVenc(r){ return {id:r.id,area:r.area||"",concepto:r.concepto||"",tipo:r.tipo||"",due:r.due||"",periodicidad:r.periodicidad||"unica",resp:r.resp||"",status:r.status||"pend",url:r.url||"",nota:r.nota||""}; }
function serReu(r){ return {id:r.id,user_id:UID,area:r.area||null,fecha:r.fecha||null,titulo:r.titulo||"",participantes:r.participantes||"",temas:r.temas||"",decisiones:r.decisiones||"",compromisos:r.compromisos||[],urls:r.urls||[],archivos:r.archivos||[],proxima:r.proxima||null}; }
function deReu(r){ return {id:r.id,area:r.area||"",fecha:r.fecha||"",titulo:r.titulo||"",participantes:r.participantes||"",temas:r.temas||"",decisiones:r.decisiones||"",compromisos:r.compromisos||[],urls:r.urls||[],archivos:r.archivos||[],proxima:r.proxima||""}; }
function serDoc(d){ return {id:d.id,user_id:UID,area:d.area||null,titulo:d.titulo||"",categoria:d.categoria||null,url:d.url||null,files:d.files||[],nota:d.nota||null,fecha:d.fecha||null}; }
function deDoc(r){ return {id:r.id,area:r.area||"",titulo:r.titulo||"",categoria:r.categoria||"",url:r.url||"",files:r.files||[],nota:r.nota||"",fecha:r.fecha||""}; }
function serBloque(b){ return {id:b.id,user_id:UID,fecha:b.fecha||null,nombre:b.nombre||"",inicio:b.inicio||null,fin:b.fin||null,orden:b.orden||0,tareas:b.tareas||[]}; }
function deBloque(r){ return {id:r.id,fecha:r.fecha||"",nombre:r.nombre||"",inicio:r.inicio||"",fin:r.fin||"",orden:r.orden||0,tareas:r.tareas||[]}; }

const timers = {};
function db(){ return sb && UID; }
function scheduleSaveTask(id){ if(!db())return; clearTimeout(timers["t"+id]); timers["t"+id]=setTimeout(()=>saveTaskNow(id),500); }
async function saveTaskNow(id){ if(!db())return; const t=state.tasks.find(x=>x.id===id); if(!t)return; const {error}=await sb.from("tasks").upsert(serTask(t)); if(error)toast("No se pudo guardar: "+error.message); }
async function deleteTaskDb(id){ if(!db())return; const {error}=await sb.from("tasks").delete().eq("id",id); if(error)toast("No se pudo borrar: "+error.message); }
function scheduleSaveObj(id){ if(!db())return; clearTimeout(timers["o"+id]); timers["o"+id]=setTimeout(()=>saveObjNow(id),500); }
async function saveObjNow(id){ if(!db())return; const o=getObjById(id); if(!o)return; const {error}=await sb.from("objetivos").upsert(serObj(o)); if(error)toast("No se pudo guardar: "+error.message); }
async function deleteObjDb(id){ if(!db())return; const {error}=await sb.from("objetivos").delete().eq("id",id); if(error)toast("No se pudo borrar: "+error.message); }
function scheduleSaveSettings(){ if(!db())return; clearTimeout(timers.settings); timers.settings=setTimeout(saveSettingsNow,500); }
async function saveSettingsNow(){ if(!db())return; const {error}=await sb.from("settings").upsert({user_id:UID,areas:state.areas,responsables:state.responsables,shortcuts:state.shortcuts,theme:state.theme,prefs:{blkView:state.blkView},updated_at:new Date().toISOString()}); if(error){ if(/prefs/.test(error.message)){ const {error:e2}=await sb.from("settings").upsert({user_id:UID,areas:state.areas,responsables:state.responsables,shortcuts:state.shortcuts,theme:state.theme,updated_at:new Date().toISOString()}); if(e2)toast("No se pudo guardar config: "+e2.message); } else toast("No se pudo guardar config: "+error.message); } }
function getVenc(id){ return state.vencimientos.find(v=>v.id===id); }
function scheduleSaveVenc(id){ if(!db())return; clearTimeout(timers["v"+id]); timers["v"+id]=setTimeout(()=>saveVencNow(id),500); }
async function saveVencNow(id){ if(!db())return; const v=getVenc(id); if(!v)return; const {error}=await sb.from("vencimientos").upsert(serVenc(v)); if(error)toast("No se pudo guardar: "+error.message); }
async function deleteVencDb(id){ if(!db())return; const {error}=await sb.from("vencimientos").delete().eq("id",id); if(error)toast("No se pudo borrar: "+error.message); }
function getReu(id){ return state.reuniones.find(r=>r.id===id); }
function scheduleSaveReu(id){ if(!db())return; clearTimeout(timers["r"+id]); timers["r"+id]=setTimeout(()=>saveReuNow(id),500); }
async function saveReuNow(id){ if(!db())return; const r=getReu(id); if(!r)return; const {error}=await sb.from("reuniones").upsert(serReu(r)); if(error)toast("No se pudo guardar: "+error.message); }
async function deleteReuDb(id){ if(!db())return; const {error}=await sb.from("reuniones").delete().eq("id",id); if(error)toast("No se pudo borrar: "+error.message); }
function getDoc(id){ return state.documentos.find(d=>d.id===id); }
function scheduleSaveDoc(id){ if(!db())return; clearTimeout(timers["d"+id]); timers["d"+id]=setTimeout(()=>saveDocNow(id),500); }
async function saveDocNow(id){ if(!db())return; const d=getDoc(id); if(!d)return; const {error}=await sb.from("documentos").upsert(serDoc(d)); if(error)toast("No se pudo guardar: "+error.message); }
async function deleteDocDb(id){ if(!db())return; const {error}=await sb.from("documentos").delete().eq("id",id); if(error)toast("No se pudo borrar: "+error.message); }
function getBloque(id){ return state.bloques.find(b=>b.id===id); }
function scheduleSaveBloque(id){ if(!db())return; clearTimeout(timers["b"+id]); timers["b"+id]=setTimeout(()=>saveBloqueNow(id),500); }
async function saveBloqueNow(id){ if(!db())return; const b=getBloque(id); if(!b)return; const {error}=await sb.from("bloques_dia").upsert(serBloque(b)); if(error)toast("No se pudo guardar: "+error.message); }
async function deleteBloqueDb(id){ if(!db())return; const {error}=await sb.from("bloques_dia").delete().eq("id",id); if(error)toast("No se pudo borrar: "+error.message); }

/* ---------- Storage (bucket "archivos") ---------- */
async function uploadFile(file){
  if(!db()){ toast("Iniciá sesión para subir archivos"); return null; }
  const safe=file.name.replace(/[^\w.\-]+/g,"_");
  const path=`${UID}/${crypto.randomUUID()}-${safe}`;
  const {error}=await sb.storage.from("archivos").upload(path,file,{upsert:false});
  if(error){ toast("Error al subir: "+error.message); return null; }
  return {name:file.name,path};
}
async function openFile(path){
  if(!db())return;
  const {data,error}=await sb.storage.from("archivos").createSignedUrl(path,3600);
  if(error){ toast("No se pudo abrir: "+error.message); return; }
  window.open(data.signedUrl,"_blank");
}
async function removeStorage(path){ if(!db()||!path)return; try{ await sb.storage.from("archivos").remove([path]); }catch(e){} }

async function loadAll(){
  // settings
  let st=null;
  { const {data}=await sb.from("settings").select("*").eq("user_id",UID).maybeSingle(); st=data; }
  if(!st){ state.areas=[...DEFAULTS.areas]; state.responsables=[...DEFAULTS.responsables]; state.shortcuts=DEFAULTS.shortcuts.map(s=>({...s})); state.theme=DEFAULTS.theme; await saveSettingsNow(); }
  else { state.areas=st.areas||[]; state.responsables=st.responsables||[]; state.shortcuts=st.shortcuts||[]; state.theme=st.theme||"grafito"; if(st.prefs&&st.prefs.blkView)state.blkView=st.prefs.blkView; }
  applyTheme(state.theme);
  // tasks
  { const {data}=await sb.from("tasks").select("*").eq("user_id",UID).order("n",{ascending:true}); state.tasks=(data||[]).map(deTask); }
  // objetivos
  { const {data}=await sb.from("objetivos").select("*").eq("user_id",UID).order("inserted_at",{ascending:true}); state.objetivos=(data||[]).map(deObj); }
  // vencimientos
  { const {data,error}=await sb.from("vencimientos").select("*").eq("user_id",UID).order("due",{ascending:true}); if(error&&/relation|does not exist/i.test(error.message))toast("Falta correr la migración de Vencimientos en Supabase."); state.vencimientos=(data||[]).map(deVenc); }
  // reuniones
  { const {data}=await sb.from("reuniones").select("*").eq("user_id",UID).order("fecha",{ascending:false}); state.reuniones=(data||[]).map(deReu); }
  // documentos
  { const {data,error}=await sb.from("documentos").select("*").eq("user_id",UID).order("inserted_at",{ascending:false}); if(error&&/relation|does not exist/i.test(error.message))toast("Falta correr la migración v3 (Repositorio) en Supabase."); state.documentos=(data||[]).map(deDoc); }
  // bloques del día
  { const {data,error}=await sb.from("bloques_dia").select("*").eq("user_id",UID).order("orden",{ascending:true}); if(error&&/relation|does not exist/i.test(error.message))toast("Falta correr la migración de Bloques del día en Supabase."); state.bloques=(data||[]).map(deBloque); }
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
function go(id){ state.view=id; state.objSel=null; state.secTab="tareas"; state.reuSel=null; state.secScEdit=false; render(); }
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
    <div class="widget"><h3>Accesos directos</h3><div class="shortcuts">${sc}</div><button class="btn-ghost" data-act="revSemanal" style="margin-top:12px;width:100%">✓ Revisión semanal</button></div>
  </div><div class="section-h">Secciones</div><div class="cards">${cards}</div>`;
}
function viewPlaceholder(sec){ return `<div class="placeholder"><div class="pico">${sec?sec.ic:'•'}</div><h2>${esc(sec?sec.label:'')}</h2><p>Esta sección todavía no tiene contenido. La armamos cuando definamos qué necesitás acá.</p></div>`; }
function optionList(arr,sel,empty){ return `<option value="">${empty}</option>`+arr.map(a=>`<option value="${esc(a)}" ${a===sel?'selected':''}>${esc(a)}</option>`).join(""); }

/* ============================================================
   TAREAS
   ============================================================ */
function statusCards(list){
  const c={sin:0,proc:0,urg:0,comp:0};
  list.forEach(t=>{ if(c[t.status]!==undefined)c[t.status]++; });
  const card=(cls,label,n)=>`<div class="sumcard ${cls}"><span class="sc-label">${label}</span><span class="sc-num">${n}</span></div>`;
  return `<div class="sumcards">
    ${card('sc-sin','Sin iniciar',c.sin)}
    ${card('sc-proc','En proceso',c.proc)}
    ${card('sc-urg','Urgentes',c.urg)}
    ${card('sc-comp','Completado',c.comp)}
  </div>`;
}
function viewTasks(){
  const f=state.filters;
  const seg=`<div class="seg"><button class="${state.taskView==='tabla'?'on':''}" data-act="taskView" data-id="tabla">▤ Tabla</button><button class="${state.taskView==='kanban'?'on':''}" data-act="taskView" data-id="kanban">▥ Kanban</button><button class="${state.taskView==='bloques'?'on':''}" data-act="taskView" data-id="bloques">🗓 Bloques del día</button></div>`;
  if(state.taskView==='bloques'){
    if(!state.blocksDate) state.blocksDate=today();
    const vseg=`<div class="seg vseg" title="Vista de los bloques">${[["agenda","▭","Agenda"],["compacta","≡","Compacta"],["timeline","⌇","Línea horaria"]].map(v=>`<button class="${state.blkView===v[0]?'on':''}" data-act="blkView" data-id="${v[0]}" title="${v[2]}">${v[1]}</button>`).join("")}</div>`;
    return `<div class="toolbar">${seg}
      ${vseg}
      <div class="spacer"></div>
      <button class="btn-ghost" data-act="blkDay" data-id="prev" title="Día anterior">‹</button>
      <input type="date" class="inp" value="${state.blocksDate}" data-act="blkDate" style="width:auto">
      <button class="btn-ghost" data-act="blkDay" data-id="next" title="Día siguiente">›</button>
      <button class="btn-ghost" data-act="blkDay" data-id="today">Hoy</button>
      <button class="btn-ghost" data-act="blkClose" title="Repasar el día y pasar lo pendiente al día siguiente">✓ Cierre del día</button>
      <button class="btn-primary" data-act="blkAdd">＋ Nuevo bloque</button>
    </div><div id="taskArea"></div>`;
  }
  const cardList=filtered();
  return `${statusCards(cardList)}<div class="toolbar">
    ${seg}
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
  if(state.taskView==='bloques'){ area.innerHTML=bloquesHTML(); bindTaskArea(); wireBloques(); return; }
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
  const nf=(t.files||[]).length; const fileCell=nf?`<span class="attach-mini" title="${nf} archivo(s)">📎 ${nf}</span>`:`<span style="color:var(--tx-faint)">—</span>`;
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
/* ---------- Bloques del día (A timeline + D picker) ---------- */
const BLK_COLORS = ["#534AB7","#1D9E75","#b4760a","#c2353a","#1f7bb6","#0f8a6e","#888780","#7b4fd0"];
function blkColor(i){ return BLK_COLORS[i%BLK_COLORS.length]; }
const longDate = d => d ? new Date(d+"T00:00").toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"}) : "";
function minutes(hhmm){ if(!hhmm||!/^\d{1,2}:\d{2}$/.test(hhmm))return null; const[h,m]=hhmm.split(":").map(Number); return h*60+m; }
function durLabel(ini,fin){ const a=minutes(ini),b=minutes(fin); if(a==null||b==null||b<=a)return ""; const d=b-a,h=Math.floor(d/60),mm=d%60; return (h?h+"h":"")+(mm?(h?" ":"")+mm+"m":(h?"":"0m")); }
function dayBloques(){ return state.bloques.filter(b=>b.fecha===state.blocksDate).sort((a,b)=>{ const am=minutes(a.inicio),bm=minutes(b.inicio); if(am!=null&&bm!=null&&am!==bm)return am-bm; if(am!=null&&bm==null)return -1; if(am==null&&bm!=null)return 1; return (a.orden||0)-(b.orden||0); }); }
function taskById(id){ return state.tasks.find(t=>t.id===id); }
function blocksOverlap(list){
  const out=new Set();
  for(let i=0;i<list.length;i++) for(let j=i+1;j<list.length;j++){
    const a=list[i],b=list[j]; const a1=minutes(a.inicio),a2=minutes(a.fin),b1=minutes(b.inicio),b2=minutes(b.fin);
    if(a1==null||a2==null||b1==null||b2==null)continue;
    if(a1<b2&&b1<a2){ out.add(a.id); out.add(b.id); }
  }
  return out;
}
function blkTaskRow(b,id){
  const t=taskById(id);
  if(!t) return `<div class="blk-task" style="opacity:.6"><span style="flex:1;font-size:.86em;color:var(--tx-faint)">Tarea eliminada</span><button class="del" data-act="blkTaskDel" data-b="${b.id}" data-t="${id}" style="opacity:1">🗑</button></div>`;
  const st=stMeta(t.status);
  return `<div class="blk-task"><button class="task-title" data-act="open" data-id="${t.id}" style="flex:1;text-align:left">${esc(t.title)}</button>${t.area?`<span class="tag" style="background:var(--line-2);color:var(--tx-dim);margin-right:2px">${esc(t.area)}</span>`:''}<select class="status-pill ${st.cls}" data-act="setF" data-id="${t.id}" data-f="status">${STATUSES.map(s=>`<option value="${s.key}" ${s.key===t.status?'selected':''}>${s.label}</option>`).join("")}</select><button class="del" data-act="blkTaskDel" data-b="${b.id}" data-t="${t.id}" title="Quitar del bloque" style="opacity:1">✕</button></div>`;
}
function blkHeadHTML(b,over){
  const dur=durLabel(b.inicio,b.fin);
  return `<div class="blk-head">
    <input class="blk-name" value="${esc(b.nombre)}" placeholder="Nombre del bloque" data-act="blkF" data-id="${b.id}" data-f="nombre" data-input>
    <span class="blk-time">
      <input type="time" value="${esc(b.inicio)}" data-act="blkF" data-id="${b.id}" data-f="inicio" title="Inicio"> – <input type="time" value="${esc(b.fin)}" data-act="blkF" data-id="${b.id}" data-f="fin" title="Fin">
      ${dur?`<span class="blk-dur">${dur}</span>`:''}
      ${over?`<span class="blk-warn" title="Se superpone con otro bloque">⚠ se pisa</span>`:''}
    </span>
    <button class="del" data-act="blkDel" data-id="${b.id}" title="Eliminar bloque" style="opacity:1">🗑</button>
  </div>`;
}
function blkAgenda(list,overlap){
  return `<div class="blk-timeline">${list.map((b,i)=>{
    const rows=b.tareas.map(id=>blkTaskRow(b,id)).join("");
    return `<div class="blk-card" style="border-left-color:${blkColor(i)}">
      ${blkHeadHTML(b,overlap.has(b.id))}
      <div class="blk-tasks">${rows||'<div style="color:var(--tx-faint);font-size:.84em;padding:4px 2px">Sin tareas todavía.</div>'}</div>
      <button class="blk-addtask" data-act="blkPick" data-id="${b.id}">＋ Agregar tarea desde el seguimiento</button>
    </div>`;
  }).join("")}</div>`;
}
function blkCompacta(list,overlap){
  return `<div class="blk-compact">${list.map((b,i)=>{
    const open=state.blkOpen===b.id;
    const dur=durLabel(b.inicio,b.fin);
    const nUrg=b.tareas.filter(id=>{ const t=taskById(id); return t&&t.status==='urg'; }).length;
    const rangeTxt=(b.inicio||b.fin)?`${b.inicio||'—'}–${b.fin||'—'}`:'sin horario';
    const badge=nUrg?`<span class="blk-warn" style="font-size:.82em">${nUrg} urg</span>`:`<span style="font-size:.82em;color:var(--tx-faint)">${b.tareas.length} tarea${b.tareas.length===1?'':'s'}</span>`;
    const body=open?`<div class="blk-comp-body">${b.tareas.map(id=>blkTaskRow(b,id)).join("")||'<div style="color:var(--tx-faint);font-size:.84em;padding:4px 2px">Sin tareas todavía.</div>'}<button class="blk-addtask" data-act="blkPick" data-id="${b.id}">＋ Agregar tarea</button></div>`:'';
    return `<div class="blk-comp-item" style="border-left-color:${blkColor(i)}">
      <div class="blk-comp-head" data-act="blkToggle" data-id="${b.id}">
        <span class="chev">${open?'▾':'▸'}</span>
        <span style="flex:1;font-weight:600;font-size:.92em">${esc(b.nombre||'Bloque')}</span>
        <span style="font-size:.82em;color:var(--tx-dim)">${rangeTxt}</span>
        ${dur?`<span class="blk-dur" style="font-size:.82em">${dur}</span>`:''}
        ${overlap.has(b.id)?`<span class="blk-warn" style="font-size:.82em" title="Se pisa con otro">⚠</span>`:''}
        ${badge}
      </div>
      ${body}
    </div>`;
  }).join("")}</div>`;
}
function blkTimeline(list,overlap){
  const withTime=list.filter(b=>minutes(b.inicio)!=null&&minutes(b.fin)!=null&&minutes(b.fin)>minutes(b.inicio));
  const noTime=list.filter(b=>!(minutes(b.inicio)!=null&&minutes(b.fin)!=null&&minutes(b.fin)>minutes(b.inicio)));
  let startH=8,endH=18;
  if(withTime.length){ const mins=withTime.map(b=>minutes(b.inicio)), maxs=withTime.map(b=>minutes(b.fin));
    startH=Math.min(startH,Math.floor(Math.min(...mins)/60)); endH=Math.max(endH,Math.ceil(Math.max(...maxs)/60)); }
  const total=(endH-startH)*60; const PXH=54; const H=(endH-startH)*PXH;
  const hourLines=[]; for(let h=startH;h<=endH;h++){ const top=((h-startH)*60/total)*H; hourLines.push(`<div class="tl-hour" style="top:${top}px"><span>${String(h).padStart(2,'0')}:00</span></div>`); }
  // "ahora"
  let nowLine="";
  if(state.blocksDate===today()){ const n=new Date(); const nm=n.getHours()*60+n.getMinutes(); if(nm>=startH*60&&nm<=endH*60){ const top=((nm-startH*60)/total)*H; nowLine=`<div class="tl-now" style="top:${top}px"><span>ahora</span></div>`; } }
  const bars=withTime.map((b,i)=>{
    const idx=list.indexOf(b); const col=blkColor(idx);
    const a=minutes(b.inicio),f=minutes(b.fin);
    const top=((a-startH*60)/total)*H, hgt=Math.max(22,((f-a)/total)*H);
    const dur=durLabel(b.inicio,b.fin);
    return `<div class="tl-bar" style="top:${top}px;height:${hgt}px;border-left-color:${col};background:${col}14" data-act="blkToggle" data-id="${b.id}" title="${esc(b.nombre)} · ${b.inicio}–${b.fin}">
      <span class="tl-name">${esc(b.nombre||'Bloque')}</span>
      <span class="tl-meta">${b.inicio}–${b.fin}${dur?' · '+dur:''}${b.tareas.length?' · '+b.tareas.length+' tarea'+(b.tareas.length===1?'':'s'):''}${overlap.has(b.id)?' ⚠':''}</span>
    </div>`;
  }).join("");
  const graph=`<div class="tl-wrap"><div class="tl-grid" style="height:${H}px">${hourLines.join("")}${nowLine}<div class="tl-track">${bars}</div></div></div>`;
  const noTimeHTML=noTime.length?`<div class="tl-notime"><div style="font-size:.78em;color:var(--tx-dim);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">Sin horario asignado</div>${blkAgenda(noTime,overlap)}</div>`:"";
  const detail=state.blkOpen?(()=>{ const b=getBloque(state.blkOpen); if(!b||b.fecha!==state.blocksDate)return""; return `<div class="tl-detail">${blkHeadHTML(b,overlap.has(b.id))}<div class="blk-tasks">${b.tareas.map(id=>blkTaskRow(b,id)).join("")||'<div style="color:var(--tx-faint);font-size:.84em;padding:4px 2px">Sin tareas todavía.</div>'}</div><button class="blk-addtask" data-act="blkPick" data-id="${b.id}">＋ Agregar tarea</button></div>`; })():`<div class="tl-hint">Tocá un bloque para ver y editar sus tareas.</div>`;
  return `<div class="tl-layout"><div>${graph}${noTimeHTML}</div><div>${detail}</div></div>`;
}
function bloquesHTML(){
  const list=dayBloques();
  const overlap=blocksOverlap(list);
  let nTasks=0,nUrg=0,planMin=0;
  list.forEach(b=>{ nTasks+=b.tareas.length; b.tareas.forEach(id=>{ const t=taskById(id); if(t&&t.status==='urg')nUrg++; }); const a=minutes(b.inicio),f=minutes(b.fin); if(a!=null&&f!=null&&f>a)planMin+=f-a; });
  const planH=Math.floor(planMin/60),planM=planMin%60;
  const planTxt=planMin?(planH?planH+"h ":"")+(planM?planM+"m":(planH?"":"0m")):"—";
  const overload=planMin>360;
  const resumen=`<div style="display:flex;gap:18px;flex-wrap:wrap;align-items:baseline;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--line)">
    <span style="font-size:1.05em;font-weight:600;text-transform:capitalize">${esc(longDate(state.blocksDate))}</span>
    <span style="font-size:.86em;color:var(--tx-dim)"><b>${list.length}</b> bloque${list.length===1?'':'s'} · <b>${nTasks}</b> tarea${nTasks===1?'':'s'}${nUrg?` · <b style="color:var(--st-urg)">${nUrg}</b> urgente${nUrg===1?'':'s'}`:''} · <b${overload?' style="color:var(--st-proc)"':''}>${planTxt}</b> planificado${overload?' <span title="Más de 6h de foco planificadas — cuidá no sobrecargar el día">⚠</span>':''}</span>
    ${list.length?`<button class="btn-ghost" data-act="blkCopyPrev" style="margin-left:auto;font-size:.82em">⎘ Copiar bloques de ayer</button>`:''}
  </div>`;

  if(!list.length){
    return `${resumen}<div class="table-wrap"><div class="empty" style="padding:30px 20px">No hay bloques para este día.<br><br><button class="btn-primary" data-act="blkAdd">＋ Crear el primer bloque</button> &nbsp; <button class="btn-ghost" data-act="blkCopyPrev">⎘ Copiar bloques de ayer</button></div></div>`;
  }

  let body;
  if(state.blkView==='compacta') body=blkCompacta(list,overlap);
  else if(state.blkView==='timeline') body=blkTimeline(list,overlap);
  else body=blkAgenda(list,overlap);

  return `${resumen}${body}${state.blockPick?pickPanelHTML():''}`;
}
function pickPanelHTML(){
  const b=getBloque(state.blockPick); if(!b)return"";
  const q=(state._blkQ||"").toLowerCase();
  const inBlock=new Set(b.tareas);
  let list=state.tasks.filter(t=>!inBlock.has(t.id)&&t.status!=='comp'&&t.status!=='desc');
  if(q) list=list.filter(t=>t.title.toLowerCase().includes(q)||(t.area||"").toLowerCase().includes(q));
  list=list.slice(0,40);
  const rows=list.map(t=>{ const st=stMeta(t.status); return `<div class="pick-row" data-act="blkPickAdd" data-b="${b.id}" data-t="${t.id}"><span style="flex:1">${esc(t.title)}</span>${t.area?`<span class="tag" style="background:var(--line-2);color:var(--tx-dim)">${esc(t.area)}</span>`:''}<span class="status-pill ${st.cls}" style="cursor:pointer">${st.label}</span></div>`; }).join("");
  return `<div class="overlay show" id="blkOverlay"><div class="modal" id="blkModal" style="max-width:560px">
    <div class="modal-head"><span class="m-title" style="flex:1;font-size:1.12em;font-weight:600">Agregar tarea a “${esc(b.nombre||'bloque')}”</span><button class="modal-close" data-act="blkPickCancel">✕</button></div>
    <div style="padding:16px 18px">
      <input type="search" id="blkPickSearch" placeholder="Buscar tarea del seguimiento…" value="${esc(state._blkQ||'')}" data-act="blkPickSearch" data-input class="inp" style="width:100%;margin:0 0 12px">
      <div class="pick-list">${rows||'<div class="empty" style="padding:18px">No hay tareas que coincidan. Las completadas y descartadas no se muestran.</div>'}</div>
      <p style="font-size:.78em;color:var(--tx-faint);margin:12px 0 0">El estado de cada tarea se maneja desde el seguimiento — acá solo la sumás al bloque.</p>
    </div>
  </div></div>`;
}
function wireBloques(){
  let dragTask=null;
  document.querySelectorAll('.blk-task').forEach(c=>{
    const sel=c.querySelector('[data-act="open"]'); if(!sel)return;
    c.setAttribute('draggable','true');
    c.addEventListener('dragstart',e=>{ dragTask=sel.dataset.id; e.dataTransfer.effectAllowed='move'; setTimeout(()=>c.style.opacity='.4',0); });
    c.addEventListener('dragend',()=>{ c.style.opacity=''; });
  });
  const cards=[...document.querySelectorAll('.blk-card')]; const list=dayBloques();
  cards.forEach((card,idx)=>{
    card.addEventListener('dragover',e=>{ e.preventDefault(); card.classList.add('drag-over'); });
    card.addEventListener('dragleave',()=>card.classList.remove('drag-over'));
    card.addEventListener('drop',e=>{ e.preventDefault(); card.classList.remove('drag-over');
      if(!dragTask)return; const target=list[idx]; if(!target||target.tareas.includes(dragTask)){ dragTask=null; return; }
      state.bloques.forEach(b=>{ if(b.fecha===state.blocksDate){ const k=b.tareas.indexOf(dragTask); if(k>=0){ b.tareas.splice(k,1); scheduleSaveBloque(b.id); } } });
      target.tareas.push(dragTask); scheduleSaveBloque(target.id); dragTask=null; paintTasks();
    });
  });
  const ov=$("#blkOverlay"); if(ov) ov.onclick=e=>{ if(e.target.id==='blkOverlay'){ state.blockPick=null; state._blkQ=""; paintTasks(); } };
  const s=$("#blkPickSearch"); if(s){ s.focus(); s.setSelectionRange(s.value.length,s.value.length); }
}
function addBloque(){
  if(!state.blocksDate) state.blocksDate=today();
  const maxOrden=state.bloques.filter(b=>b.fecha===state.blocksDate).reduce((m,b)=>Math.max(m,b.orden||0),0);
  const b={id:crypto.randomUUID(),fecha:state.blocksDate,nombre:"Nuevo bloque",inicio:"",fin:"",orden:maxOrden+1,tareas:[]};
  state.bloques.push(b); saveBloqueNow(b.id); paintTasks();
}
function copyPrevBloques(){
  if(!state.blocksDate) state.blocksDate=today();
  if(state.bloques.some(b=>b.fecha===state.blocksDate)){ if(!confirm("Este día ya tiene bloques. ¿Agregar igualmente los del día anterior?"))return; }
  const prev=new Date(state.blocksDate+"T00:00"); prev.setDate(prev.getDate()-1); const pd=prev.toISOString().slice(0,10);
  const src=state.bloques.filter(b=>b.fecha===pd);
  if(!src.length){ toast("El día anterior no tiene bloques para copiar."); return; }
  src.forEach(b=>{ const nb={id:crypto.randomUUID(),fecha:state.blocksDate,nombre:b.nombre,inicio:b.inicio,fin:b.fin,orden:b.orden,tareas:[...b.tareas]}; state.bloques.push(nb); saveBloqueNow(nb.id); });
  toast(`Se copiaron ${src.length} bloque${src.length===1?'':'s'} de ayer.`); paintTasks();
}

/* ---------- Modal genérico (reutiliza #overlay/#modal) ---------- */
function openHtmlModal(html){
  $("#modal").innerHTML=html;
  $("#modal").querySelectorAll("[data-act]").forEach(el=>{
    const h=ACTIONS[el.dataset.act]; if(!h)return;
    const ev=el.dataset.ev||(el.tagName==="SELECT"||el.tagName==="INPUT"||el.tagName==="TEXTAREA"?"change":"click");
    el["on"+ev]=e=>h(el,e);
    if(el.dataset.input!==undefined) el.oninput=e=>h(el,e);
  });
  $("#overlay").classList.add("show");
}

/* ---------- Cierre del día ---------- */
function nextDay(dstr){ const d=new Date(dstr+"T00:00"); d.setDate(d.getDate()+1); return d.toISOString().slice(0,10); }
function openCierreDia(){
  const list=dayBloques();
  const items=[]; // {block, task}
  list.forEach(b=>b.tareas.forEach(id=>{ const t=taskById(id); if(t&&t.status!=='comp'&&t.status!=='desc')items.push({b,t}); }));
  const nd=nextDay(state.blocksDate);
  const done=list.reduce((n,b)=>n+b.tareas.filter(id=>{ const t=taskById(id); return t&&t.status==='comp'; }).length,0);
  const totalTasks=list.reduce((n,b)=>n+b.tareas.length,0);
  const body = !items.length
    ? `<div class="empty" style="padding:24px">${totalTasks?'¡Bien! No quedaron tareas pendientes en los bloques de hoy.':'Los bloques de hoy no tienen tareas.'}</div>`
    : `<p style="font-size:.88em;color:var(--tx-dim);margin:0 0 12px">Estas tareas quedaron sin completar. Podés pasarlas a los bloques equivalentes de mañana (${esc(fmt(nd))}). Se crea el bloque en el día siguiente si no existe; las tareas conservan su estado.</p>
       <div class="cierre-list">${items.map(({b,t})=>{ const st=stMeta(t.status); return `<div class="cierre-row"><span style="flex:1">${esc(t.title)}</span><span class="tag" style="background:var(--line-2);color:var(--tx-dim)">${esc(b.nombre||'bloque')}</span><span class="status-pill ${st.cls}">${st.label}</span></div>`; }).join("")}</div>`;
  openHtmlModal(`<div class="modal-head" style="border-bottom:1px solid var(--line);padding:16px 18px;display:flex;align-items:center;gap:12px">
      <span class="m-title" style="flex:1;font-size:1.12em;font-weight:600">Cierre del día · <span style="text-transform:capitalize">${esc(longDate(state.blocksDate))}</span></span>
      <button class="modal-close" data-act="cierreClose">✕</button>
    </div>
    <div style="padding:16px 18px">
      <div style="display:flex;gap:16px;margin-bottom:14px;font-size:.86em;color:var(--tx-dim)"><span><b>${done}</b>/${totalTasks} completadas</span><span><b style="color:var(--st-proc)">${items.length}</b> pendiente${items.length===1?'':'s'}</span></div>
      ${body}
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px">
        <button class="btn-ghost" data-act="cierreClose">Cerrar</button>
        ${items.length?`<button class="btn-primary" data-act="cierreMove">→ Pasar ${items.length} tarea${items.length===1?'':'s'} a mañana</button>`:''}
      </div>
    </div>`);
}
function cierreMoverPendientes(){
  const list=dayBloques(); const nd=nextDay(state.blocksDate);
  let moved=0;
  list.forEach(b=>{
    const pend=b.tareas.filter(id=>{ const t=taskById(id); return t&&t.status!=='comp'&&t.status!=='desc'; });
    if(!pend.length)return;
    let target=state.bloques.find(x=>x.fecha===nd&&x.nombre===b.nombre);
    if(!target){ const maxOrden=state.bloques.filter(x=>x.fecha===nd).reduce((m,x)=>Math.max(m,x.orden||0),0); target={id:crypto.randomUUID(),fecha:nd,nombre:b.nombre,inicio:b.inicio,fin:b.fin,orden:maxOrden+1,tareas:[]}; state.bloques.push(target); }
    pend.forEach(id=>{ if(!target.tareas.includes(id)){ target.tareas.push(id); moved++; } });
    // se van del bloque de hoy (la tarea sigue viva en el seguimiento)
    b.tareas=b.tareas.filter(id=>!pend.includes(id));
    saveBloqueNow(target.id); saveBloqueNow(b.id);
  });
  closeModal();
  toast(moved?`Se pasaron ${moved} tarea${moved===1?'':'s'} a ${fmt(nd)}.`:"No había pendientes para pasar.");
}

/* ---------- Revisión semanal guiada (GTD) ---------- */
function openRevisionSemanal(){
  const t0=today();
  const weekEnd=new Date(Date.now()+7*864e5).toISOString().slice(0,10);
  const old=new Date(Date.now()-14*864e5).toISOString().slice(0,10);
  // datos que conectan secciones ya existentes (sin crear datos nuevos)
  const cur=t0.slice(0,7);
  const objSinRev=state.objetivos.filter(o=>!(o.reviews||[]).some(r=>r.month===cur));
  const tareasViejas=state.tasks.filter(t=>t.status!=='comp'&&t.status!=='desc'&&t.created&&t.created<old);
  const urgentes=state.tasks.filter(t=>t.status==='urg');
  const vencProx=state.vencimientos.filter(v=>v.status!=='ok'&&v.due&&v.due>=t0&&v.due<=weekEnd);
  const vencidas=state.vencimientos.filter(v=>v.status!=='ok'&&v.due&&v.due<t0);
  const sinBloque=(()=>{ // tareas urgentes/proc de hoy no asignadas a ningún bloque de hoy
    const hoy=state.bloques.filter(b=>b.fecha===t0); const asignadas=new Set(); hoy.forEach(b=>b.tareas.forEach(id=>asignadas.add(id)));
    return state.tasks.filter(t=>(t.status==='urg'||t.status==='proc')&&!asignadas.has(t.id));
  })();
  const check=(icon,titulo,n,detalle,ok)=>`<div class="rev-item ${ok?'ok':''}">
      <span class="rev-ic">${ok?'✓':icon}</span>
      <div style="flex:1"><div style="font-weight:600;font-size:.94em">${titulo}</div><div style="font-size:.82em;color:var(--tx-dim)">${detalle}</div></div>
      <span class="rev-n ${ok?'':'warn'}">${n}</span>
    </div>`;
  const html=`<div class="modal-head" style="border-bottom:1px solid var(--line);padding:16px 18px;display:flex;align-items:center;gap:12px">
      <span class="m-title" style="flex:1;font-size:1.12em;font-weight:600">Revisión semanal</span>
      <button class="modal-close" data-act="cierreClose">✕</button>
    </div>
    <div style="padding:16px 18px">
      <p style="font-size:.85em;color:var(--tx-dim);margin:0 0 14px">Un repaso rápido para arrancar la semana con todo bajo control. No se crea nada nuevo: son señales de las secciones que ya usás.</p>
      <div class="rev-list">
        ${check('◎','Objetivos al día',objSinRev.length,objSinRev.length?`${objSinRev.length} objetivo${objSinRev.length===1?'':'s'} sin revisión este mes`:'Todos tienen revisión del mes',objSinRev.length===0)}
        ${check('☑','Tareas viejas sin tocar',tareasViejas.length,tareasViejas.length?`${tareasViejas.length} tarea${tareasViejas.length===1?'':'s'} creada${tareasViejas.length===1?'':'s'} hace +2 semanas y sin cerrar`:'Nada estancado',tareasViejas.length===0)}
        ${check('◆','Urgentes abiertas',urgentes.length,urgentes.length?`${urgentes.length} marcada${urgentes.length===1?'':'s'} como urgente`:'Sin urgentes pendientes',urgentes.length===0)}
        ${check('⚠','Vencimientos próximos',vencProx.length+vencidas.length,vencidas.length?`${vencidas.length} vencida${vencidas.length===1?'':'s'}${vencProx.length?` · ${vencProx.length} esta semana`:''}`:(vencProx.length?`${vencProx.length} esta semana`:'Nada a la vista'),vencProx.length+vencidas.length===0)}
        ${check('🗓','Foco de hoy sin planificar',sinBloque.length,sinBloque.length?`${sinBloque.length} tarea${sinBloque.length===1?'':'s'} urgente/en proceso fuera de los bloques de hoy`:'Lo importante está en bloques',sinBloque.length===0)}
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px">
        <button class="btn-primary" data-act="cierreClose">Listo</button>
      </div>
    </div>`;
  openHtmlModal(html);
}


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
      <div><div class="m-block-h"><span>Adjuntos (PDF / foto / Excel)</span></div><div class="attach-row" style="flex-wrap:wrap">${(t.files||[]).map((f,i)=>`<span class="file-pill">📎 <button class="lnk" data-mfile="open" data-i="${i}" style="border:0;background:none;color:var(--accent);cursor:pointer;font:inherit;padding:0;text-decoration:underline">${esc(f.name)}</button> <button class="del" data-mfile="del" data-i="${i}" style="opacity:1">✕</button></span>`).join("")}<label class="btn-ghost" style="cursor:pointer">＋ Subir archivo<input type="file" id="mFile" style="display:none" accept=".pdf,.xlsx,.xls,.doc,.docx,image/*"></label><span id="mFileBusy" style="font-size:.8em;color:var(--tx-faint);display:none">Subiendo…</span></div></div>
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
  const tk2=()=>state.tasks.find(x=>x.id===id);
  $("#modal").querySelectorAll("[data-mfile]").forEach(el=>{ const i=+el.dataset.i,kind=el.dataset.mfile;
    if(kind==="open") el.onclick=()=>{ const f=tk2().files[i]; if(f&&f.path)openFile(f.path); };
    if(kind==="del") el.onclick=async()=>{ const f=tk2().files[i]; if(f&&f.path)await removeStorage(f.path); tk2().files.splice(i,1); scheduleSaveTask(id); openModal(id); };
  });
  $("#mFile").onchange=async e=>{ const f=e.target.files[0]; if(!f)return; const busy=$("#mFileBusy"); if(busy)busy.style.display="inline"; const up=await uploadFile(f); if(busy)busy.style.display="none"; if(up){ const tt=tk2(); tt.files=tt.files||[]; tt.files.push(up); scheduleSaveTask(id); openModal(id); } };
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
function sectionShortcuts(secId){
  const items=state.shortcuts.map((s,gi)=>({s,gi})).filter(x=>(x.s.section||"dashboard")===secId);
  const strip = items.length
    ? `<div class="shortcuts" style="margin-bottom:10px">${items.map(({s})=>`<a class="sc-btn" href="${esc(s.url||'#')}" target="_blank"><span class="ic">${esc(s.ic)}</span>${esc(s.label)}</a>`).join("")}</div>`
    : `<p style="color:var(--tx-faint);font-size:.82em;margin:0 0 10px">Sin accesos directos en esta sección todavía.</p>`;
  const toggle=`<button class="btn-ghost ${state.secScEdit?'on':''}" style="font-size:.78em;padding:4px 10px" data-act="secScEdit">${state.secScEdit?'✓ Listo':'✎ Administrar accesos'}</button>`;
  let editor="";
  if(state.secScEdit){
    const rows=items.map(({s,gi})=>`<div class="sc-edit"><input class="inp" style="width:46px;text-align:center" value="${esc(s.ic)}" data-act="scF" data-i="${gi}" data-f="ic"><input class="inp" style="flex:0 0 150px" value="${esc(s.label)}" data-act="scF" data-i="${gi}" data-f="label" placeholder="Nombre"><input class="inp" style="flex:1;min-width:120px" value="${esc(s.url)}" data-act="scF" data-i="${gi}" data-f="url" placeholder="https://…"><button class="row-del" data-act="scDel" data-i="${gi}">🗑</button></div>`).join("");
    editor=`<div class="scard" style="margin:0 0 14px;padding:13px 15px">${rows||'<p style="color:var(--tx-faint);font-size:.84em;margin:0 0 8px">Sin accesos. Agregá el primero.</p>'}<button class="btn-ghost add-row" data-act="scAddSec" data-id="${secId}">＋ Agregar acceso a esta sección</button></div>`;
  }
  return `<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:14px"><div style="flex:1">${strip}${editor}</div>${toggle}</div>`;
}
function sectionView(secId){
  const tab=state.secTab;
  const repoTab = REPO_SECTIONS.includes(secId) ? `<button class="${tab==='repo'?'on':''}" data-act="secTab" data-id="repo">📁 Repositorio</button>` : '';
  const sgcTab = secId==='calidad' ? `<button class="${tab==='sgc'?'on':''}" data-act="secTab" data-id="sgc">✦ Sistema de Calidad</button>` : '';
  const cierTab = secId==='admin' ? `<button class="${tab==='cierres'?'on':''}" data-act="secTab" data-id="cierres">$ Cierres contables</button>` : '';
  const tabs=`<div class="seg"><button class="${tab==='tareas'?'on':''}" data-act="secTab" data-id="tareas">☑ Tareas del área</button><button class="${tab==='venc'?'on':''}" data-act="secTab" data-id="venc">⏰ Vencimientos</button><button class="${tab==='reu'?'on':''}" data-act="secTab" data-id="reu">🗓 Reuniones</button>${repoTab}${sgcTab}${cierTab}</div>`;
  let body;
  if(tab==='venc') body=sectionVenc(secId);
  else if(tab==='reu') body=sectionReuniones(secId);
  else if(tab==='repo' && REPO_SECTIONS.includes(secId)) body=sectionRepo(secId);
  else if(tab==='sgc' && secId==='calidad') body=sectionSGC();
  else if(tab==='cierres' && secId==='admin') body=sectionCierres();
  else body=sectionTasks(secId);
  return `${sectionShortcuts(secId)}<div class="toolbar">${tabs}</div>${body}`;
}

/* ---------- Tareas del área ---------- */
function sectionTasks(secId){
  const areas=SECTION_AREAS[secId]||[];
  const allInArea=state.tasks.filter(t=>areas.includes(t.area));
  let list=allInArea;
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
  return `${statusCards(allInArea)}<div style="display:flex;gap:10px;margin-bottom:12px;align-items:center;flex-wrap:wrap">
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
  const view=state.reuView||"lista";
  const toolbar=`<div class="toolbar"><div class="seg"><button class="${view==='lista'?'on':''}" data-act="reuView" data-id="lista">▤ Lista</button><button class="${view==='cards'?'on':''}" data-act="reuView" data-id="cards">▦ Tarjetas</button></div><div class="spacer"></div><button class="btn-primary" data-act="reuNew" data-id="${secId}">＋ Registrar reunión</button></div>`;
  if(!list.length) return `${toolbar}<div class="table-wrap"><div class="empty">Todavía no registraste reuniones en esta área.</div></div>`;
  if(view==='cards'){
    const cards=list.map(r=>{ const nC=r.compromisos.length,nD=r.compromisos.filter(c=>c.done).length;
      return `<button class="card" style="min-height:auto" data-act="reuOpen" data-id="${r.id}">
        <div style="display:flex;justify-content:space-between;align-items:center;width:100%;gap:8px"><h4>${esc(r.titulo||'(sin título)')}</h4><span style="font-size:.82em;color:var(--tx-dim);white-space:nowrap">${r.fecha?fmt(r.fecha):'—'}</span></div>
        <div class="stat" style="margin-top:2px">${r.participantes?esc(r.participantes):'<span style="color:var(--tx-faint)">Sin participantes</span>'}</div>
        ${nC?`<div style="font-size:.82em;color:var(--tx-dim)">☑ ${nD}/${nC} compromisos</div>`:''}</button>`;
    }).join("");
    return `${toolbar}<div class="cards">${cards}</div>`;
  }
  const rows=list.map(r=>{ const nC=r.compromisos.length,nD=r.compromisos.filter(c=>c.done).length;
    return `<tr>
      <td class="date" style="white-space:nowrap">${r.fecha?fmt(r.fecha):'—'}</td>
      <td><button class="task-title" data-act="reuOpen" data-id="${r.id}">${esc(r.titulo||'(sin título)')}</button></td>
      <td style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.participantes?esc(r.participantes):'<span style="color:var(--tx-faint)">—</span>'}</td>
      <td style="text-align:center">${nC?`${nD}/${nC}`:'<span style="color:var(--tx-faint)">—</span>'}</td>
      <td class="date" style="white-space:nowrap">${r.proxima?fmt(r.proxima):'<span style="color:var(--tx-faint)">—</span>'}</td></tr>`;
  }).join("");
  return `${toolbar}<div class="table-wrap"><table class="tasks" style="min-width:720px"><thead><tr><th>Fecha</th><th>Reunión</th><th>Participantes</th><th style="text-align:center">Compromisos</th><th>Próxima</th></tr></thead><tbody>${rows}</tbody></table></div>`;
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
    <div style="margin-top:14px"><div class="m-block-h"><span>Referencias (links)</span></div>
      <div class="subs">${(r.urls||[]).map((u,i)=>`<div class="sub"><span style="font-size:.95em">🔗</span><a class="sx" href="${esc(u.url)}" target="_blank" style="color:var(--accent);text-decoration:underline;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(u.label||u.url)}</a><button class="del" data-act="reuUrlDel" data-i="${i}" style="opacity:1">🗑</button></div>`).join("")||'<p style="color:var(--tx-faint);font-size:.84em;margin:0">Sin links. Pegá uno abajo.</p>'}</div>
      <div class="sub-add"><input id="reu_newurl" placeholder="Pegá una URL y Enter (Drive, Notion, etc.)…" data-act="reuUrlAdd" data-ev="keydown"></div></div>
    <div style="margin-top:14px"><div class="m-block-h"><span>Adjuntos (acta, minuta, PDF…)</span></div>
      <div class="attach-row" style="flex-wrap:wrap">${(r.archivos||[]).map((f,i)=>`<span class="file-pill">📎 <button class="lnk" data-act="reuFileOpen" data-i="${i}" style="border:0;background:none;color:var(--accent);cursor:pointer;font:inherit;padding:0;text-decoration:underline">${esc(f.name)}</button> <button class="del" data-act="reuFileDel" data-i="${i}" style="opacity:1">✕</button></span>`).join("")}<label class="btn-ghost" style="cursor:pointer">＋ Subir archivo<input type="file" id="reu_file" data-act="reuFileUp" style="display:none" accept=".pdf,.xlsx,.xls,.doc,.docx,image/*"></label><span id="reu_busy" style="font-size:.8em;color:var(--tx-faint);display:none">Subiendo…</span></div></div>
    <div class="m-field" style="margin-top:14px;max-width:200px"><label>Próxima reunión</label><input id="reu_prox" type="date" value="${esc(r.proxima)}" data-act="reuF" data-f="proxima"></div>
    <div class="modal-foot" style="margin:16px -18px -16px;border-radius:0"><button class="link-danger" data-act="reuDel" data-id="${r.id}">Eliminar reunión</button><button class="btn-primary" data-act="reuBack">Listo</button></div>
  </div>`;
}

/* ---------- Repositorio ---------- */
function docRow(d){
  const files=(d.files||[]).map((f,i)=>`<span class="file-pill" style="margin:1px">📎 <button data-act="docFileOpen" data-id="${d.id}" data-i="${i}" style="border:0;background:none;color:var(--accent);cursor:pointer;font:inherit;padding:0;text-decoration:underline">${esc(f.name)}</button> <button class="del" data-act="docFileDel" data-id="${d.id}" data-i="${i}" style="opacity:1">✕</button></span>`).join("");
  return `<tr>
    <td><input class="cell-edit" style="min-width:150px" value="${esc(d.titulo)}" data-act="docF" data-id="${d.id}" data-f="titulo" placeholder="Título"></td>
    <td><input class="cell-edit" style="min-width:110px" value="${esc(d.categoria)}" data-act="docF" data-id="${d.id}" data-f="categoria" placeholder="Categoría"></td>
    <td><input type="date" class="cell-edit" value="${esc(d.fecha)}" data-act="docF" data-id="${d.id}" data-f="fecha"></td>
    <td><div style="display:flex;align-items:center;gap:4px"><input class="cell-edit" style="min-width:130px" value="${esc(d.url)}" data-act="docF" data-id="${d.id}" data-f="url" placeholder="https://…">${d.url?`<a class="icon-link" href="${esc(d.url)}" target="_blank">🔗</a>`:''}</div></td>
    <td>${files}<label class="btn-ghost" style="cursor:pointer;padding:2px 8px;font-size:.76em">＋<input type="file" data-act="docFileUp" data-id="${d.id}" style="display:none" accept=".pdf,.xlsx,.xls,.doc,.docx,image/*"></label></td>
    <td><input class="cell-edit" style="min-width:120px" value="${esc(d.nota)}" data-act="docF" data-id="${d.id}" data-f="nota" placeholder="Nota"></td>
    <td style="text-align:center"><button class="row-del" data-act="docDel" data-id="${d.id}">🗑</button></td></tr>`;
}
function sectionRepo(secId){
  const list=state.documentos.filter(d=>d.area===secId);
  const rows=list.map(docRow).join("");
  return `<div style="display:flex;margin-bottom:13px;align-items:center"><span style="font-size:.82em;color:var(--tx-faint)">Procedimientos, manuales, certificados, contratos: link o archivo subido.</span><div style="flex:1"></div><button class="btn-primary" data-act="docAdd" data-id="${secId}">＋ Nuevo documento</button></div>
  <div class="table-wrap"><table class="tasks" style="min-width:980px"><thead><tr><th>Título</th><th>Categoría</th><th>Fecha</th><th>Link</th><th>Archivos</th><th>Nota</th><th></th></tr></thead>
  <tbody>${rows||'<tr><td colspan="7"><div class="empty">Sin documentos cargados todavía.</div></td></tr>'}</tbody></table></div>`;
}
function addDoc(secId){ const d={id:crypto.randomUUID(),area:secId,titulo:"",categoria:"",url:"",files:[],nota:"",fecha:today()}; state.documentos.unshift(d); saveDocNow(d.id); render(); }

/* ---------- Sistema de Calidad (reflejado desde la otra app, solo lectura) ---------- */
async function loadCalidad(){
  state.calLoading=true; state.calError=null; render();
  try{
    const h=await sb.from("cal_hallazgos").select("*"); if(h.error) throw h.error;
    const m=await sb.from("cal_mejoras").select("*"); if(m.error) throw m.error;
    const p=await sb.from("cal_procedimientos").select("*"); if(p.error) throw p.error;
    state.cal={hallazgos:h.data||[],mejoras:m.data||[],procedimientos:p.data||[]};
    state.calLoaded=true;
  }catch(e){ state.calError=(e&&e.message)||String(e); }
  state.calLoading=false; render();
}
function sectionSGC(){
  if(state.calLoading) return `<div class="table-wrap"><div class="empty">Cargando datos de la app de Calidad…</div></div>`;
  if(state.calError){
    return `<div class="scard"><h3 style="color:var(--tx);text-transform:none;letter-spacing:0;font-size:.95em">Conexión con la app de Calidad</h3>
      <p style="font-size:.88em;color:var(--tx-dim);margin:0 0 8px">Todavía no se pueden leer los datos. Es normal si aún no corriste el archivo <b>calidad-fdw-conexion.sql</b> en Supabase (con tus datos de conexión completados).</p>
      <p style="font-size:.8em;color:var(--st-urg);margin:0 0 12px">Detalle técnico: ${esc(state.calError)}</p>
      <button class="btn-ghost" data-act="calReload">Reintentar</button></div>`;
  }
  const c=state.cal||{}; const H=c.hallazgos||[],M=c.mejoras||[],P=c.procedimientos||[];
  const sevPill=s=>{ const t=(s||"").toLowerCase(); const col=/alt|crit|may/.test(t)?'st-urg':/med/.test(t)?'st-proc':'st-sin'; return `<span class="status-pill ${col}" style="cursor:default">${esc(s||'—')}</span>`; };
  const hRows=H.map(r=>`<tr><td class="date" style="white-space:nowrap">${r.fecha_deteccion?fmt(r.fecha_deteccion):'—'}</td><td>${r.area?esc(r.area):'—'}</td><td style="max-width:320px">${esc(r.resumen||'—')}</td><td>${sevPill(r.severidad)}</td><td>${r.estado?esc(r.estado):'—'}</td><td>${r.responsable?esc(r.responsable):'—'}</td></tr>`).join("");
  const mRows=M.map(r=>`<tr><td class="date" style="white-space:nowrap">${r.fecha?fmt(r.fecha):'—'}</td><td>${r.area?esc(r.area):'—'}</td><td style="max-width:320px">${esc(r.mejora_realizada||r.notas||'—')}</td><td>${r.estado?esc(r.estado):'—'}</td><td>${r.responsable?esc(r.responsable):'—'}</td></tr>`).join("");
  const pRows=P.map(r=>`<tr><td>${esc(r.procedimiento||'—')}</td><td>${r.area?esc(r.area):'—'}</td><td style="text-align:center">${r.version?esc(r.version):'—'}</td><td>${r.estado?esc(r.estado):'—'}</td><td class="date" style="white-space:nowrap">${r.fecha_proxima_revision?fmt(r.fecha_proxima_revision):'—'}</td><td style="text-align:center">${r.link?`<a class="icon-link" href="${esc(r.link)}" target="_blank">🔗</a>`:'—'}</td></tr>`).join("");
  const block=(title,n,head,rows,empty)=>`<div class="scard"><h3 style="color:var(--tx);text-transform:none;letter-spacing:0;font-size:.95em">${title} <span style="color:var(--tx-faint);font-weight:400">· ${n}</span></h3><div class="table-wrap" style="box-shadow:none;border:1px solid var(--line)"><table class="tasks" style="min-width:640px"><thead><tr>${head}</tr></thead><tbody>${rows||`<tr><td colspan="6"><div class="empty" style="padding:22px">${empty}</div></td></tr>`}</tbody></table></div></div>`;
  return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><span style="font-size:.82em;color:var(--tx-faint)">Datos en vivo desde tu app de Calidad · solo lectura (se editan en esa app).</span><div style="flex:1"></div><button class="btn-ghost" data-act="calReload">↻ Actualizar</button></div>
    ${block("Hallazgos sin cerrar",H.length,"<th>Detección</th><th>Área</th><th>Resumen</th><th>Severidad</th><th>Estado</th><th>Responsable</th>",hRows,"Sin hallazgos abiertos.")}
    ${block("Mejoras en curso",M.length,"<th>Fecha</th><th>Área</th><th>Mejora</th><th>Estado</th><th>Responsable</th>",mRows,"Sin mejoras pendientes.")}
    ${block("Procedimientos en revisión",P.length,"<th>Procedimiento</th><th>Área</th><th>Versión</th><th>Estado</th><th>Próx. revisión</th><th>Link</th>",pRows,"Sin procedimientos en revisión.")}`;
}

/* ---------- Cierres contables (reflejado desde app de Administración) ---------- */
async function loadAdmin(){
  state.admLoading=true; state.admError=null; render();
  try{
    const c=await sb.from("adm_cierres").select("*"); if(c.error) throw c.error;
    const t=await sb.from("adm_cierre_tareas").select("*"); if(t.error) throw t.error;
    state.adm={cierres:c.data||[],tareas:t.data||[]};
    state.admLoaded=true;
    if(!state.admCierreSel && state.adm.cierres.length) state.admCierreSel=state.adm.cierres[0].id;
  }catch(e){ state.admError=(e&&e.message)||String(e); }
  state.admLoading=false; render();
}
function estPill(s){ const t=(s||"").toLowerCase(); const col=/cerr|complet|finaliz|aprob|ok/.test(t)?'st-comp':/proc|curso|revis/.test(t)?'st-proc':/pend|abiert|inici/.test(t)?'st-sin':'st-sin'; return `<span class="status-pill ${col}" style="cursor:default">${esc(s||'—')}</span>`; }
function cierreLabel(c){ const m=(c.mes>=1&&c.mes<=12)?Cap(MONTHS_ES[c.mes-1]):('Mes '+c.mes); return m+' '+c.anio; }
function sectionCierres(){
  if(state.admLoading) return `<div class="table-wrap"><div class="empty">Cargando cierres contables…</div></div>`;
  if(state.admError){
    return `<div class="scard"><h3 style="color:var(--tx);text-transform:none;letter-spacing:0;font-size:.95em">Conexión con la app de Administración</h3>
      <p style="font-size:.88em;color:var(--tx-dim);margin:0 0 8px">Todavía no se pueden leer los datos. Es normal si aún no corriste <b>admin-fdw-conexion.sql</b> en Supabase (con tus datos de conexión completados).</p>
      <p style="font-size:.8em;color:var(--st-urg);margin:0 0 12px">Detalle técnico: ${esc(state.admError)}</p>
      <button class="btn-ghost" data-act="admReload">Reintentar</button></div>`;
  }
  const cierres=(state.adm&&state.adm.cierres)||[]; const tareas=(state.adm&&state.adm.tareas)||[];
  if(!cierres.length) return `<div style="display:flex;margin-bottom:12px"><div style="flex:1"></div><button class="btn-ghost" data-act="admReload">↻ Actualizar</button></div><div class="table-wrap"><div class="empty">No hay cierres contables cargados en la app de Administración.</div></div>`;
  const sel=state.admCierreSel || cierres[0].id;
  const selObj=cierres.find(c=>c.id===sel)||cierres[0];
  const cRows=cierres.map(c=>{
    const ts=tareas.filter(t=>t.closing_id===c.id); const done=ts.filter(t=>t.fecha_real_finalizacion).length;
    const prog=ts.length?Math.round(done/ts.length*100):0;
    return `<tr class="${c.id===selObj.id?'':''}" style="cursor:pointer;${c.id===selObj.id?'background:var(--accent-soft)':''}" data-act="admPick" data-id="${c.id}">
      <td><b>${esc(cierreLabel(c))}</b></td>
      <td>${estPill(c.estado)}</td>
      <td class="date" style="white-space:nowrap">${c.fecha_estimada_cierre?fmt(c.fecha_estimada_cierre):'—'}</td>
      <td>${ts.length?`<div class="subprog"><span class="bar"><i style="width:${prog}%"></i></span>${done}/${ts.length}</div>`:'<span style="color:var(--tx-faint)">sin tareas</span>'}</td>
      <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--tx-dim)">${c.observaciones?esc(c.observaciones):''}</td></tr>`;
  }).join("");
  const selTasks=tareas.filter(t=>t.closing_id===selObj.id).sort((a,b)=>(a.orden||0)-(b.orden||0));
  const tRows=selTasks.map(t=>`<tr>
      <td>${esc(t.nombre||'—')}</td>
      <td>${estPill(t.estado)}</td>
      <td class="date" style="white-space:nowrap">${t.fecha_estimada?fmt(t.fecha_estimada):'—'}</td>
      <td class="date" style="white-space:nowrap">${t.fecha_real_finalizacion?fmt(t.fecha_real_finalizacion):'<span style="color:var(--tx-faint)">pendiente</span>'}</td>
      <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--tx-dim)">${t.observaciones?esc(t.observaciones):''}</td></tr>`).join("");
  return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><span style="font-size:.82em;color:var(--tx-faint)">Datos en vivo desde tu app de Administración · solo lectura.</span><div style="flex:1"></div><button class="btn-ghost" data-act="admReload">↻ Actualizar</button></div>
    <div class="scard"><h3 style="color:var(--tx);text-transform:none;letter-spacing:0;font-size:.95em">Cierres mensuales <span style="color:var(--tx-faint);font-weight:400">· clic en uno para ver sus tareas</span></h3>
      <div class="table-wrap" style="box-shadow:none;border:1px solid var(--line)"><table class="tasks" style="min-width:640px"><thead><tr><th>Período</th><th>Estado</th><th>Fecha estimada</th><th>Avance</th><th>Observaciones</th></tr></thead><tbody>${cRows}</tbody></table></div></div>
    <div class="scard"><h3 style="color:var(--tx);text-transform:none;letter-spacing:0;font-size:.95em">Tareas del cierre · ${esc(cierreLabel(selObj))} <span style="color:var(--tx-faint);font-weight:400">· ${selTasks.length}</span></h3>
      <div class="table-wrap" style="box-shadow:none;border:1px solid var(--line)"><table class="tasks" style="min-width:640px"><thead><tr><th>Tarea</th><th>Estado</th><th>Fecha estimada</th><th>Finalizada</th><th>Observaciones</th></tr></thead><tbody>${tRows||`<tr><td colspan="5"><div class="empty" style="padding:22px">Este cierre no tiene tareas.</div></td></tr>`}</tbody></table></div></div>`;
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
  secTab:(el)=>{ state.secTab=el.dataset.id; state.reuSel=null; state.secScEdit=false; render(); if(el.dataset.id==='sgc' && !state.calLoaded && !state.calLoading) loadCalidad(); if(el.dataset.id==='cierres' && !state.admLoaded && !state.admLoading) loadAdmin(); },
  calReload:()=>loadCalidad(),
  admReload:()=>loadAdmin(),
  admPick:(el)=>{ state.admCierreSel=el.dataset.id; render(); },
  secScEdit:()=>{ state.secScEdit=!state.secScEdit; render(); },
  scAddSec:(el)=>{ state.shortcuts.push({ic:"🔗",label:"Nuevo acceso",url:"#",section:el.dataset.id}); scheduleSaveSettings(); render(); },
  reuView:(el)=>{ state.reuView=el.dataset.id; render(); },
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
  reuUrlAdd:(el,e)=>{ if(e.key!=='Enter')return; const v=el.value.trim(); if(!v)return; const r=getReu(state.reuSel); if(!r)return; readReuForm(r); r.urls=r.urls||[]; r.urls.push({label:v,url:v}); saveReuNow(r.id); render(); setTimeout(()=>{const n=$("#reu_newurl"); if(n)n.focus();},10); },
  reuUrlDel:(el)=>{ const r=getReu(state.reuSel); if(!r)return; readReuForm(r); r.urls.splice(+el.dataset.i,1); scheduleSaveReu(r.id); render(); },
  reuFileOpen:(el)=>{ const r=getReu(state.reuSel); if(!r)return; const f=r.archivos[+el.dataset.i]; if(f&&f.path)openFile(f.path); },
  reuFileDel:async(el)=>{ const r=getReu(state.reuSel); if(!r)return; readReuForm(r); const f=r.archivos[+el.dataset.i]; if(f&&f.path)await removeStorage(f.path); r.archivos.splice(+el.dataset.i,1); scheduleSaveReu(r.id); render(); },
  reuFileUp:async(el)=>{ const f=el.files&&el.files[0]; if(!f)return; const r=getReu(state.reuSel); if(!r)return; readReuForm(r); const busy=$("#reu_busy"); if(busy)busy.style.display="inline"; const up=await uploadFile(f); if(busy)busy.style.display="none"; if(up){ r.archivos=r.archivos||[]; r.archivos.push(up); scheduleSaveReu(r.id); render(); } },
  docAdd:(el)=>addDoc(el.dataset.id),
  docF:(el)=>{ const d=getDoc(el.dataset.id); if(!d)return; d[el.dataset.f]=el.value; scheduleSaveDoc(d.id); if(el.type==='date')render(); },
  docDel:async(el)=>{ const d=getDoc(el.dataset.id); if(d){ for(const f of (d.files||[])) await removeStorage(f.path); } state.documentos=state.documentos.filter(x=>x.id!==el.dataset.id); deleteDocDb(el.dataset.id); render(); },
  docFileOpen:(el)=>{ const d=getDoc(el.dataset.id); if(!d)return; const f=d.files[+el.dataset.i]; if(f&&f.path)openFile(f.path); },
  docFileDel:async(el)=>{ const d=getDoc(el.dataset.id); if(!d)return; const f=d.files[+el.dataset.i]; if(f&&f.path)await removeStorage(f.path); d.files.splice(+el.dataset.i,1); scheduleSaveDoc(d.id); render(); },
  docFileUp:async(el)=>{ const f=el.files&&el.files[0]; if(!f)return; const d=getDoc(el.dataset.id); if(!d)return; const up=await uploadFile(f); if(up){ d.files=d.files||[]; d.files.push(up); scheduleSaveDoc(d.id); render(); } },
  // config
  cfgAdd:(el)=>cfgAdd(el.dataset.kind),
  cfgAddKey:(el,e)=>{ if(e.key==='Enter')cfgAdd(el.dataset.kind); },
  cfgDel:(el)=>cfgDel(el.dataset.kind,+el.dataset.i),
  scF:(el)=>{ state.shortcuts[+el.dataset.i][el.dataset.f]=el.value; scheduleSaveSettings(); },
  scAdd:()=>{ state.shortcuts.push({ic:"🔗",label:"Nuevo acceso",url:"#",section:"dashboard"}); scheduleSaveSettings(); render(); },
  scDel:(el)=>{ state.shortcuts.splice(+el.dataset.i,1); scheduleSaveSettings(); render(); },
  theme:(el)=>{ applyTheme(el.dataset.k); scheduleSaveSettings(); render(); },
  // bloques del día
  blkAdd:()=>addBloque(),
  blkView:(el)=>{ state.blkView=el.dataset.id; state.blkOpen=null; scheduleSaveSettings(); paintTasks(); },
  blkToggle:(el)=>{ state.blkOpen=state.blkOpen===el.dataset.id?null:el.dataset.id; paintTasks(); },
  blkClose:()=>openCierreDia(),
  cierreMove:()=>cierreMoverPendientes(),
  cierreClose:()=>{ closeModal(); },
  revSemanal:()=>openRevisionSemanal(),
  blkDate:(el)=>{ state.blocksDate=el.value||today(); state.blockPick=null; paintTasks(); },
  blkDay:(el)=>{ if(!state.blocksDate)state.blocksDate=today(); if(el.dataset.id==='today'){ state.blocksDate=today(); } else { const d=new Date(state.blocksDate+"T00:00"); d.setDate(d.getDate()+(el.dataset.id==='next'?1:-1)); state.blocksDate=d.toISOString().slice(0,10); } state.blockPick=null; render(); },
  blkF:(el)=>{ const b=getBloque(el.dataset.id); if(!b)return; b[el.dataset.f]=el.value; scheduleSaveBloque(b.id); if(el.type==='time')paintTasks(); },
  blkDel:(el)=>{ const id=el.dataset.id; const b=getBloque(id); if(b&&(b.tareas.length||b.nombre&&b.nombre!=='Nuevo bloque')){ if(!confirm("¿Eliminar este bloque? Las tareas no se borran, solo salen del bloque."))return; } state.bloques=state.bloques.filter(x=>x.id!==id); deleteBloqueDb(id); if(state.blockPick===id)state.blockPick=null; paintTasks(); },
  blkCopyPrev:()=>copyPrevBloques(),
  blkPick:(el)=>{ state.blockPick=el.dataset.id; state._blkQ=""; paintTasks(); },
  blkPickCancel:()=>{ state.blockPick=null; state._blkQ=""; paintTasks(); },
  blkPickSearch:(el)=>{ state._blkQ=el.value; paintTasks(); },
  blkPickAdd:(el)=>{ const b=getBloque(el.dataset.b); if(!b)return; if(!b.tareas.includes(el.dataset.t))b.tareas.push(el.dataset.t); scheduleSaveBloque(b.id); state._blkQ=""; paintTasks(); },
  blkTaskDel:(el)=>{ const b=getBloque(el.dataset.b); if(!b)return; b.tareas=b.tareas.filter(x=>x!==el.dataset.t); scheduleSaveBloque(b.id); paintTasks(); },
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

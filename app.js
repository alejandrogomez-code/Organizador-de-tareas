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

const SECTIONS = [{id:"dashboard",label:"Dashboard",ic:"▦"},{id:"objetivos",label:"Objetivos",ic:"◎"},{id:"tareas",label:"Seguimiento de Tareas",ic:"☑"},{id:"mesa",label:"Mesa Ejecutiva",ic:"⚑"},{id:"calendario",label:"Calendario",ic:"◷"},{id:"admin",label:"Administración · Finanzas",ic:"$"},{id:"calidad",label:"Calidad",ic:"✦"},{id:"logistica",label:"Logística · Compras",ic:"⛟"},{id:"sistemas",label:"Sistemas",ic:"⚙"},{id:"leex",label:"LEEX",ic:"◈"}];
const CARD_STYLE = {
  objetivos:{bg:"#eef1ff",fg:"#4453c4",solid:"#534AB7",tint:"#CECBF6",bar:"#7F77DD"},
  tareas:   {bg:"#e8f6ee",fg:"#15803d",solid:"#0F6E56",tint:"#9FE1CB",bar:"#1D9E75"},
  mesa:     {bg:"#fbeaf0",fg:"#993556",solid:"#993556",tint:"#F4C0D1",bar:"#D4537E"},
  calendario:{bg:"#e6f1fb",fg:"#0C447C",solid:"#185FA5",tint:"#B5D4F4",bar:"#378ADD"},
  admin:    {bg:"#fdf3e2",fg:"#b4760a",solid:"#185FA5",tint:"#B5D4F4",bar:"#378ADD"},
  calidad:  {bg:"#f3eefe",fg:"#7b4fd0",solid:"#0F6E56",tint:"#9FE1CB",bar:"#1D9E75"},
  logistica:{bg:"#e6f3fb",fg:"#1f7bb6",solid:"#BA7517",tint:"#FAC775",bar:"#BA7517"},
  sistemas: {bg:"#eef0f3",fg:"#5b6471",solid:"#534AB7",tint:"#CECBF6",bar:"#7F77DD"},
  leex:     {bg:"#e9f7f3",fg:"#0f8a6e",solid:"#0C447C",tint:"#85B7EB",bar:"#378ADD"},
};
const FOROS_DEFAULT = [
  {id:"diego", label:"1:1 Diego (CEO)", col:"#534AB7"},
  {id:"cesar", label:"1:1 César (Dueño)", col:"#185FA5"},
  {id:"mesa",  label:"Mesa ejecutiva", col:"#0F6E56"},
];
function foros(){ return (state.foros&&state.foros.length)?state.foros:FOROS_DEFAULT; }
function foroById(id){ return foros().find(f=>f.id===id)||null; }

/* ---------- Paletas ---------- */
const PALETTES = {
  grafito:{ name:"Grafito", vars:{"--bg":"#f4f5f7","--panel":"#ffffff","--panel-2":"#fafbfc","--hover":"#fafbfd","--sidebar":"#21262e","--sidebar-2":"#2a313b","--sidebar-tx":"#b8c0cc","--sidebar-tx-dim":"#79828f","--line":"#e4e7eb","--line-2":"#eef0f3","--tx":"#1f2430","--tx-dim":"#6b7280","--tx-faint":"#9aa1ac","--accent":"#4c5bd4","--accent-soft":"#eceefb"} },
  indigo:{ name:"Índigo claro", vars:{"--bg":"#f3f4fb","--panel":"#ffffff","--panel-2":"#f7f8fe","--hover":"#f6f7fe","--sidebar":"#2b2f6b","--sidebar-2":"#363b80","--sidebar-tx":"#c3c8f0","--sidebar-tx-dim":"#878dc4","--line":"#e3e5f3","--line-2":"#edeefa","--tx":"#1e2140","--tx-dim":"#5d6184","--tx-faint":"#9a9ec0","--accent":"#5b5bd6","--accent-soft":"#e9e9fb"} },
  bosque:{ name:"Bosque", vars:{"--bg":"#f2f6f4","--panel":"#ffffff","--panel-2":"#f7faf8","--hover":"#f4faf7","--sidebar":"#04342C","--sidebar-2":"#0F6E56","--sidebar-tx":"#9FE1CB","--sidebar-tx-dim":"#5DCAA5","--line":"#e0e8e3","--line-2":"#eaf1ed","--tx":"#1c2722","--tx-dim":"#5b6b62","--tx-faint":"#97a59d","--accent":"#1D9E75","--accent-soft":"#E1F5EE"} },
  arena:{ name:"Arena", vars:{"--bg":"#f6f3ee","--panel":"#fffdf9","--panel-2":"#f9f5ef","--hover":"#f8f4ed","--sidebar":"#34302a","--sidebar-2":"#403a32","--sidebar-tx":"#cbc2b4","--sidebar-tx-dim":"#8f8676","--line":"#e8e1d6","--line-2":"#f0ebe2","--tx":"#2c2820","--tx-dim":"#6b6457","--tx-faint":"#a59d8e","--accent":"#b06a3c","--accent-soft":"#f5e7da"} },
  pizarra:{ name:"Pizarra (oscuro)", vars:{"--bg":"#161a20","--panel":"#1e232b","--panel-2":"#242a33","--hover":"#232932","--sidebar":"#12151a","--sidebar-2":"#1c212a","--sidebar-tx":"#aeb6c2","--sidebar-tx-dim":"#6b7480","--line":"#2c333d","--line-2":"#262c35","--tx":"#e7eaef","--tx-dim":"#a6adb8","--tx-faint":"#7a828d","--accent":"#6f7ce6","--accent-soft":"#272d4a"} },
};
PALETTES.pizarra.vars = Object.assign(PALETTES.pizarra.vars,{
  "--p-sin-fg":"#aeb6c2","--p-sin-bg":"#2b323c","--p-urg-fg":"#ff8a8f","--p-urg-bg":"#3d2529",
  "--p-proc-fg":"#f0b849","--p-proc-bg":"#3a3122","--p-comp-fg":"#6ddba0","--p-comp-bg":"#1f3a2c",
  "--p-desc-fg":"#98a0ab","--p-desc-bg":"#282e37"});
const ALL_VARS = [...new Set(Object.values(PALETTES).flatMap(p=>Object.keys(p.vars)))];
function applyTheme(key){
  const p = PALETTES[key] || PALETTES.bosque;
  ALL_VARS.forEach(k=>{ if(!(k in p.vars)) document.documentElement.style.removeProperty(k); });
  for(const[k,v] of Object.entries(p.vars)) document.documentElement.style.setProperty(k,v);
  state.theme = PALETTES[key]?key:"bosque";
}
const BACKGROUNDS = {
  banda:{name:"Banda", hint:"Franja de color arriba"},
  bruma:{name:"Bruma", hint:"Degradé suave en las esquinas"},
  curvas:{name:"Curvas", hint:"Líneas finas tipo mapa"},
  cuaderno:{name:"Cuaderno", hint:"Grilla de puntos"},
  vidrio:{name:"Vidrio", hint:"Paneles translúcidos"},
  plano:{name:"Plano", hint:"Fondo liso, sin textura"},
};
function applyBg(key){
  state.bg = BACKGROUNDS[key] ? key : "banda";
  document.body.classList.forEach(c=>{ if(c.startsWith("bg-")) document.body.classList.remove(c); });
  if(state.bg!=="plano") document.body.classList.add("bg-"+state.bg);
}
function applyDensity(d){ state.density = d==="dense"?"dense":"normal"; document.body.classList.toggle("dense", state.density==="dense"); }
/* colores estables por área y por responsable */
const TAG_COLORS = ["#378ADD","#7F77DD","#1D9E75","#BA7517","#D4537E","#0C447C","#0f8a6e","#b06a3c","#7b4fd0","#c2353a"];
function hashIdx(str,n){ let h=0; for(let i=0;i<str.length;i++) h=(h*31+str.charCodeAt(i))>>>0; return h%n; }
const tagColor = s => TAG_COLORS[hashIdx(s||"",TAG_COLORS.length)];
const ICONS = {
  link:`<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>`,
  clip:`<svg viewBox="0 0 24 24"><path d="m21 11-8.6 8.6a6 6 0 0 1-8.5-8.5l8.6-8.6a4 4 0 0 1 5.7 5.7l-8.6 8.6a2 2 0 0 1-2.8-2.8l8-8"/></svg>`,
};

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
const PAGO_ESTADOS = [{key:"pend",label:"Pendiente",cls:"st-sin"},{key:"proc",label:"En proceso",cls:"st-proc"},{key:"comp",label:"Completado",cls:"st-comp"}];
const pagoEstMeta = k => PAGO_ESTADOS.find(s=>s.key===k) || PAGO_ESTADOS[0];
const money = n => (Number(n)||0).toLocaleString("es-AR",{minimumFractionDigits:2,maximumFractionDigits:2});
const finUsd = p => { const ars=Number(p&&p.importeArs)||0, tc=Number(p&&p.tc)||0; return tc?ars/tc:0; };
function parseArsNumber(str){
  if(str==null) return 0;
  let s=String(str).trim().replace(/\$/g,"").replace(/\s/g,"");
  if(!s) return 0;
  if(s.includes(",")){ s=s.replace(/\./g,"").replace(",","."); }
  else{ const parts=s.split("."); if(!(parts.length===2&&parts[1].length<=2)) s=s.replace(/\./g,""); }
  const n=parseFloat(s);
  return isNaN(n)?0:n;
}

/* ============================================================
   Estado
   ============================================================ */
const DEFAULTS = {
  areas:["Administración","Contabilidad","Finanzas","Marketing","Calidad","Logística","Compras","Sistemas","LEEX"],
  responsables:["Alejandro","Diego","Leandro","Claudio"],
  finConceptos:["Sueldos","VEP Nacionalización","Comex Pago Exterior","Préstamo"],
  shortcuts:[{ic:"📅",label:"Notion Calendar",url:"#",section:"dashboard"},{ic:"✉️",label:"Correo",url:"#",section:"dashboard"},{ic:"🗂️",label:"Notion",url:"#",section:"dashboard"},{ic:"📊",label:"Odoo",url:"#",section:"dashboard"}],
  theme:"bosque",
};
const state = {
  view:"dashboard", taskView:"tabla", scale:1, seq:1,
  sort:{col:"due",dir:"asc"}, group:"", showDone:false,
  objSel:null, objReviewMonth:null, objFilterArea:"", justSavedReview:null,
  secTab:"tareas", vencFilter:{tipo:"",status:""}, reuSel:null, secScEdit:false, reuView:"lista",
  areas:[], responsables:[], objetivos:[], shortcuts:[], theme:"bosque", bg:"banda", density:"normal",
  filters:{estado:"",area:"",resp:"",venc:"",q:""},
  tasks:[], vencimientos:[], reuniones:[], documentos:[], bloques:[],
  blocksDate:null, blockPick:null, blkView:"agenda", blkOpen:null, weekReview:null, weekRef:null, wkQ:"", freeOpen:false, wkFold:{},
  foros:[], mesaFiltro:"", mesaTab:"reuniones",
  calUrls:[], calView:"mes", calCursor:null, calEvents:[], calLoading:false, calError:"", calLoaded:false, calEditing:false,
  eventos:[], calLayers:{bloques:true,reuniones:true,vencimientos:true,tareas:true,eventos:true,google:true}, calDaySel:null, evtSel:null,
  cal:{}, calLoaded:false, calLoading:false, calError:null,
  adm:{}, admLoaded:false, admLoading:false, admError:null, admCierreSel:null,
  finPagos:[], finConceptos:[], finTC:0, finFilters:{concepto:"",estado:"",desde:"",hasta:"",q:""}, finGroup:"semana",
};

/* ============================================================
   Helpers
   ============================================================ */
const $ = (s,el=document)=>el.querySelector(s);
const esc = s => (s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt = d => d ? new Date(d+"T00:00").toLocaleDateString("es-AR",{day:"2-digit",month:"short"}) : "—";
const today = () => new Date().toISOString().slice(0,10);
function dueClass(d){ if(!d)return""; if(d<today())return"due-over"; const diff=(new Date(d)-new Date(today()))/864e5; return diff<=3?"due-soon":""; }
const daysUntil = d => Math.round((new Date(d+"T00:00")-new Date(today()+"T00:00"))/864e5);
const isOpen = t => t.status!=='comp'&&t.status!=='desc';
function dueBucket(t){ if(!isOpen(t))return 5; if(!t.due)return 4; const n=daysUntil(t.due); if(n<0)return 0; if(n===0)return 1; if(n<=7)return 2; return 3; }
const DUE_BUCKETS=["Vencidas","Hoy","Próximos 7 días","Más adelante","Sin fecha","Cerradas"];
function dueRel(t){
  if(!t.due||!isOpen(t))return "";
  const n=daysUntil(t.due);
  if(n<0)return `Venció hace ${-n} d`;
  if(n===0)return "Vence hoy";
  if(n===1)return "Mañana";
  if(n<=7)return `En ${n} días`;
  return "";
}
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
function serTask(t){ return {id:t.id,user_id:UID,n:t.n,created:t.created||null,title:t.title||"",status:t.status||"sin",due:t.due||null,area:t.area||null,resp:t.resp||null,obj:t.obj||null,url:t.url||null,file:t.file||null,files:t.files||[],detail:t.detail||null,recur:t.recur||null,cuad:t.cuad||null,subs:t.subs||[]}; }
function serObj(o){ return {id:o.id,user_id:UID,tag:o.tag||"",name:o.name||"",area:o.area||null,owner:o.owner||null,status:o.status||"En curso",indicators:o.indicators||[],plan:o.plan||[],reviews:o.reviews||[]}; }
function deTask(r){ return {id:r.id,n:r.n,created:r.created||"",title:r.title||"",status:r.status||"sin",due:r.due||"",area:r.area||"",resp:r.resp||"",obj:r.obj||"",url:r.url||"",file:r.file||null,files:r.files||[],detail:r.detail||"",recur:r.recur||"",cuad:r.cuad||"",subs:r.subs||[]}; }
function deObj(r){ return {id:r.id,tag:r.tag||"",name:r.name||"",area:r.area||"",owner:r.owner||"",status:r.status||"En curso",indicators:r.indicators||[],plan:r.plan||[],reviews:r.reviews||[]}; }
function serVenc(v){ return {id:v.id,user_id:UID,area:v.area||null,concepto:v.concepto||"",tipo:v.tipo||null,due:v.due||null,periodicidad:v.periodicidad||"unica",resp:v.resp||null,status:v.status||"pend",url:v.url||null,nota:v.nota||null}; }
function deVenc(r){ return {id:r.id,area:r.area||"",concepto:r.concepto||"",tipo:r.tipo||"",due:r.due||"",periodicidad:r.periodicidad||"unica",resp:r.resp||"",status:r.status||"pend",url:r.url||"",nota:r.nota||""}; }
function serFinPago(p){ return {id:p.id,user_id:UID,fecha:p.fecha||null,concepto:p.concepto||null,detalle:p.detalle||null,importe_ars:p.importeArs!=null&&p.importeArs!==""?Number(p.importeArs):null,tc:p.tc!=null&&p.tc!==""?Number(p.tc):null,estado:p.estado||"pend"}; }
function deFinPago(r){ return {id:r.id,fecha:r.fecha||"",concepto:r.concepto||"",detalle:r.detalle||"",importeArs:r.importe_ars!=null?Number(r.importe_ars):0,tc:r.tc!=null?Number(r.tc):0,estado:r.estado||"pend"}; }
function serReu(r){ return {id:r.id,user_id:UID,area:r.area||null,tipo:r.tipo||null,fecha:r.fecha||null,titulo:r.titulo||"",participantes:r.participantes||"",temas:r.temas||"",decisiones:r.decisiones||"",pend:r.pend||"",compromisos:r.compromisos||[],urls:r.urls||[],archivos:r.archivos||[],proxima:r.proxima||null}; }
function deReu(r){ return {id:r.id,area:r.area||"",tipo:r.tipo||"",fecha:r.fecha||"",titulo:r.titulo||"",participantes:r.participantes||"",temas:r.temas||"",decisiones:r.decisiones||"",pend:r.pend||"",compromisos:(r.compromisos||[]).map(c=>({t:c.t||"",done:!!c.done,taskId:c.taskId||null,resp:c.resp||"",due:c.due||""})),urls:r.urls||[],archivos:r.archivos||[],proxima:r.proxima||""}; }
function serDoc(d){ return {id:d.id,user_id:UID,area:d.area||null,titulo:d.titulo||"",categoria:d.categoria||null,url:d.url||null,files:d.files||[],nota:d.nota||null,fecha:d.fecha||null}; }
function deDoc(r){ return {id:r.id,area:r.area||"",titulo:r.titulo||"",categoria:r.categoria||"",url:r.url||"",files:r.files||[],nota:r.nota||"",fecha:r.fecha||""}; }
function serBloque(b){ return {id:b.id,user_id:UID,fecha:b.fecha||null,nombre:b.nombre||"",inicio:b.inicio||null,fin:b.fin||null,orden:b.orden||0,tareas:b.tareas||[]}; }
function deBloque(r){ return {id:r.id,fecha:r.fecha||"",nombre:r.nombre||"",inicio:r.inicio||"",fin:r.fin||"",orden:r.orden||0,tareas:r.tareas||[]}; }
function serEvento(e){ return {id:e.id,user_id:UID,fecha:e.fecha||null,fin_fecha:e.finFecha||null,inicio:e.inicio||null,fin:e.fin||null,titulo:e.titulo||"",nota:e.nota||null,color:e.color||null}; }
function deEvento(r){ return {id:r.id,fecha:r.fecha||"",finFecha:r.fin_fecha||"",inicio:r.inicio||"",fin:r.fin||"",titulo:r.titulo||"",nota:r.nota||"",color:r.color||""}; }

const timers = {};
function db(){ return sb && UID; }
function scheduleSaveTask(id){ if(!db())return; clearTimeout(timers["t"+id]); timers["t"+id]=setTimeout(()=>saveTaskNow(id),500); }
async function saveTaskNow(id){ if(!db())return; const t=state.tasks.find(x=>x.id===id); if(!t)return; const {error}=await sb.from("tasks").upsert(serTask(t)); if(error)toast("No se pudo guardar: "+error.message); }
async function deleteTaskDb(id){ if(!db())return; const {error}=await sb.from("tasks").delete().eq("id",id); if(error)toast("No se pudo borrar: "+error.message); }
function scheduleSaveObj(id){ if(!db())return; clearTimeout(timers["o"+id]); timers["o"+id]=setTimeout(()=>saveObjNow(id),500); }
async function saveObjNow(id){ if(!db())return; const o=getObjById(id); if(!o)return; const {error}=await sb.from("objetivos").upsert(serObj(o)); if(error)toast("No se pudo guardar: "+error.message); }
async function deleteObjDb(id){ if(!db())return; const {error}=await sb.from("objetivos").delete().eq("id",id); if(error)toast("No se pudo borrar: "+error.message); }
function scheduleSaveSettings(){ if(!db())return; clearTimeout(timers.settings); timers.settings=setTimeout(saveSettingsNow,500); }
async function saveSettingsNow(){ if(!db())return; const {error}=await sb.from("settings").upsert({user_id:UID,areas:state.areas,responsables:state.responsables,shortcuts:state.shortcuts,theme:state.theme,prefs:{blkView:state.blkView,bg:state.bg,density:state.density,foros:state.foros,calUrls:state.calUrls,calLayers:state.calLayers,finConceptos:state.finConceptos,finTC:state.finTC},updated_at:new Date().toISOString()}); if(error){ if(/prefs/.test(error.message)){ const {error:e2}=await sb.from("settings").upsert({user_id:UID,areas:state.areas,responsables:state.responsables,shortcuts:state.shortcuts,theme:state.theme,updated_at:new Date().toISOString()}); if(e2)toast("No se pudo guardar config: "+e2.message); } else toast("No se pudo guardar config: "+error.message); } }
function getVenc(id){ return state.vencimientos.find(v=>v.id===id); }
function scheduleSaveVenc(id){ if(!db())return; clearTimeout(timers["v"+id]); timers["v"+id]=setTimeout(()=>saveVencNow(id),500); }
async function saveVencNow(id){ if(!db())return; const v=getVenc(id); if(!v)return; const {error}=await sb.from("vencimientos").upsert(serVenc(v)); if(error)toast("No se pudo guardar: "+error.message); }
async function deleteVencDb(id){ if(!db())return; const {error}=await sb.from("vencimientos").delete().eq("id",id); if(error)toast("No se pudo borrar: "+error.message); }
function getFinPago(id){ return state.finPagos.find(p=>p.id===id); }
function scheduleSaveFinPago(id){ if(!db())return; clearTimeout(timers["fp"+id]); timers["fp"+id]=setTimeout(()=>saveFinPagoNow(id),500); }
async function saveFinPagoNow(id){ if(!db())return; const p=getFinPago(id); if(!p)return; const {error}=await sb.from("fin_pagos").upsert(serFinPago(p)); if(error)toast("No se pudo guardar: "+error.message); }
async function deleteFinPagoDb(id){ if(!db())return; const {error}=await sb.from("fin_pagos").delete().eq("id",id); if(error)toast("No se pudo borrar: "+error.message); }
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
function getEvento(id){ return state.eventos.find(e=>e.id===id); }
function scheduleSaveEvento(id){ if(!db())return; clearTimeout(timers["e"+id]); timers["e"+id]=setTimeout(()=>saveEventoNow(id),500); }
async function saveEventoNow(id){ if(!db())return; const e=getEvento(id); if(!e)return; const {error}=await sb.from("eventos_cal").upsert(serEvento(e)); if(error)toast("No se pudo guardar: "+error.message); }
async function deleteEventoDb(id){ if(!db())return; const {error}=await sb.from("eventos_cal").delete().eq("id",id); if(error)toast("No se pudo borrar: "+error.message); }

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
  if(!st){ state.areas=[...DEFAULTS.areas]; state.responsables=[...DEFAULTS.responsables]; state.finConceptos=[...DEFAULTS.finConceptos]; state.finTC=0; state.shortcuts=DEFAULTS.shortcuts.map(s=>({...s})); state.theme=DEFAULTS.theme; await saveSettingsNow(); }
  else { state.areas=st.areas||[]; state.responsables=st.responsables||[]; state.shortcuts=st.shortcuts||[]; state.theme=st.theme||"bosque"; if(st.prefs&&st.prefs.blkView)state.blkView=st.prefs.blkView; if(st.prefs&&st.prefs.bg)state.bg=st.prefs.bg; if(st.prefs&&st.prefs.density)state.density=st.prefs.density; if(st.prefs&&Array.isArray(st.prefs.foros))state.foros=st.prefs.foros; if(st.prefs&&Array.isArray(st.prefs.calUrls))state.calUrls=st.prefs.calUrls; if(st.prefs&&st.prefs.calLayers)state.calLayers={...state.calLayers,...st.prefs.calLayers}; state.finConceptos=(st.prefs&&Array.isArray(st.prefs.finConceptos)&&st.prefs.finConceptos.length)?st.prefs.finConceptos:[...DEFAULTS.finConceptos]; state.finTC=(st.prefs&&typeof st.prefs.finTC==='number')?st.prefs.finTC:0; }
  applyTheme(state.theme); applyBg(state.bg); applyDensity(state.density);
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
  { const {data,error}=await sb.from("eventos_cal").select("*").eq("user_id",UID); if(error&&/relation|does not exist/i.test(error.message))toast("Falta correr la migración del Calendario (eventos_cal) en Supabase."); state.eventos=(data||[]).map(deEvento); }
  // planificación financiera
  { const {data,error}=await sb.from("fin_pagos").select("*").eq("user_id",UID).order("fecha",{ascending:true}); if(error&&/relation|does not exist/i.test(error.message))toast("Falta correr la migración de Planificación Financiera en Supabase."); state.finPagos=(data||[]).map(deFinPago); }
  state.seq = state.tasks.reduce((m,t)=>Math.max(m,t.n||0),0)+1;
}

/* ============================================================
   Navegación / render raíz
   ============================================================ */
function crumbSub(){
  const h=$("#crumb"); if(!h)return;
  const fecha=Cap(new Date().toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"}));
  let extra="";
  const urg=state.tasks.filter(t=>isOpen(t)&&t.due&&t.due<=today()).length;
  if(urg) extra=` · ${urg} tarea${urg===1?'':'s'} vencida${urg===1?'':'s'} o para hoy`;
  h.insertAdjacentHTML("beforeend",`<small>${fecha}${extra}</small>`);
}
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
  else $("#crumb").innerHTML=`${esc(sec?sec.label:'')}`;
  crumbSub();
  const c=$("#content");
  if(state.view==="dashboard") c.innerHTML=viewDashboard();
  else if(state.view==="tareas"){ c.innerHTML=viewTasks(); paintTasks(); }
  else if(state.view==="objetivos") c.innerHTML=state.objSel?objDetail(getObjById(state.objSel)):objList();
  else if(state.view==="config") c.innerHTML=viewConfig();
  else if(state.view==="mesa") c.innerHTML=viewMesa();
  else if(state.view==="calendario"){ c.innerHTML=viewCalendario(); if(!state.calEditing)paintCalendar(); }
  else if(OPS_ENABLED.includes(state.view)) c.innerHTML=sectionView(state.view);
  else c.innerHTML=viewPlaceholder(sec);
  bindContent();
  animateCounters(c);
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
    const cs=CARD_STYLE[s.id]||{bg:"#eef0f3",fg:"#5b6471",solid:"#5F5E5A",tint:"#D3D1C7",bar:"#888780"};
    let sub="En construcción", pct=null, urg=0;
    if(s.id==="tareas"){
      const done=state.tasks.filter(t=>t.status==='comp').length, tot=state.tasks.length;
      urg=state.tasks.filter(t=>t.status==='urg').length;
      sub=`${pend} pendientes`; pct=tot?Math.round(done/tot*100):0;
    } else if(s.id==="objetivos"){
      const os=state.objetivos; const avg=os.length?Math.round(os.reduce((a,o)=>a+objAvance(o),0)/os.length):0;
      sub=`${os.length} en seguimiento`; pct=avg;
    } else if(s.id==="calendario"){
      const nEv=state.eventos.length; const g=state.calUrls.length;
      sub=nEv?`${nEv} evento${nEv===1?'':'s'} propio${nEv===1?'':'s'}${g?' · Google conectado':''}`:(g?"Google conectado":"Vista unificada"); pct=null;
    } else if(s.id==="mesa"){
      const ab=mesaOpenComps(); const vz=ab.filter(x=>compVencido(x.c)).length;
      const total=mesaReuniones().reduce((n,r)=>n+(r.compromisos||[]).length,0);
      const done=mesaReuniones().reduce((n,r)=>n+(r.compromisos||[]).filter(c=>c.done).length,0);
      urg=vz;
      sub=total?`${done} de ${total} compromisos`:`${mesaReuniones().length} reuniones`;
      pct=total?Math.round(done/total*100):0;
    } else if(OPS_ENABLED.includes(s.id)){
      const areas=SECTION_AREAS[s.id]||[];
      const all=state.tasks.filter(t=>areas.includes(t.area));
      const done=all.filter(t=>t.status==='comp').length;
      urg=all.filter(t=>t.status==='urg').length;
      const tp=all.filter(t=>!["comp","desc"].includes(t.status)).length;
      sub=`${done} de ${all.length} completadas`; pct=all.length?Math.round(done/all.length*100):0;
      if(!all.length)sub=`${tp} tareas`;
    }
    const bar=pct===null?"":`<div class="cbar"><i style="width:${pct}%;background:${cs.bar}"></i></div>`;
    const uw=s.id==='mesa'?'vencido':'urgente';
    const badge=urg?`<span class="curg">${urg} ${uw}${urg===1?'':'s'}</span>`:'';
    return `<button class="card" data-act="goCard" data-id="${s.id}">
      <div class="chead" style="background:${cs.solid}">
        <span class="cblob cblob-1"></span><span class="cblob cblob-2"></span>
        <span class="cico" style="color:${cs.tint}">${s.ic}</span>
      </div>
      <div class="cbody">
        <div class="ctitle"><h4>${esc(s.label)}</h4>${badge}</div>
        <div class="stat">${sub}</div>
        ${bar}
      </div>
    </button>`;
  }).join("");
  const nUrg=state.tasks.filter(t=>t.status==='urg').length;
  const hh=new Date().getHours();
  const saludo=hh<13?"Buenos días":(hh<20?"Buenas tardes":"Buenas noches");
  const hoyTxt=new Date().toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"});
  const hero=`<div class="dash-hero">
    <p class="dh-t">${saludo}</p>
    <p class="dh-s">${esc(Cap(hoyTxt))}${nUrg?` · <b style="color:var(--st-urg)">${nUrg}</b> tarea${nUrg===1?'':'s'} urgente${nUrg===1?'':'s'}`:' · sin urgencias'}</p>
  </div>`;
  return `${hero}<div class="dash-top">
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
  const card=(cls,label,n,i)=>`<div class="sumcard ${cls}" style="animation-delay:${i*70}ms"><span class="sc-label">${label}</span><span class="sc-num" data-count="${n}">0</span></div>`;
  return `<div class="sumcards">
    ${card('sc-sin','Sin iniciar',c.sin,0)}
    ${card('sc-proc','En proceso',c.proc,1)}
    ${card('sc-urg','Urgentes',c.urg,2)}
    ${card('sc-comp','Completado',c.comp,3)}
  </div>`;
}
function animateCounters(root){
  const R=root||document;
  const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduce){
    R.querySelectorAll("[data-count]").forEach(el=>el.textContent=el.dataset.count);
    R.querySelectorAll(".ar-fg[data-off]").forEach(c=>c.setAttribute("stroke-dashoffset",c.dataset.off));
    return;
  }
  R.querySelectorAll("[data-count]").forEach(el=>{
    const to=parseInt(el.dataset.count,10)||0; if(!to){ el.textContent="0"; return; }
    let start=null; const dur=750;
    const step=ts=>{ if(!start)start=ts; const p=Math.min((ts-start)/dur,1); const e=1-Math.pow(1-p,3); el.textContent=Math.round(to*e); if(p<1)requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
  R.querySelectorAll(".ar-fg[data-off]").forEach(c=>{
    requestAnimationFrame(()=>requestAnimationFrame(()=>c.setAttribute("stroke-dashoffset",c.dataset.off)));
  });
}
function viewTasks(){
  const f=state.filters;
  const seg=`<div class="seg"><button class="${state.taskView==='tabla'?'on':''}" data-act="taskView" data-id="tabla">▤ Tabla</button><button class="${state.taskView==='kanban'?'on':''}" data-act="taskView" data-id="kanban">▥ Kanban</button><button class="${state.taskView==='bloques'?'on':''}" data-act="taskView" data-id="bloques">🗓 Bloques del día</button><button class="${state.taskView==='semana'?'on':''}" data-act="taskView" data-id="semana">▦ Semana</button></div>`;
  if(state.taskView==='semana'){
    if(!state.weekRef) state.weekRef=today();
    return `<div class="toolbar">${seg}
      <div class="spacer"></div>
      <button class="btn-ghost" data-act="wkNav" data-id="prev" title="Semana anterior">‹</button>
      <span style="font-size:.9em;font-weight:600;min-width:150px;text-align:center">${esc(weekLabel())}</span>
      <button class="btn-ghost" data-act="wkNav" data-id="next" title="Semana siguiente">›</button>
      <button class="btn-ghost" data-act="wkNav" data-id="today">Esta semana</button>
      <button class="btn-ghost" data-act="wkFoldAll" data-k="${Object.keys(state.wkFold||{}).some(d=>state.wkFold[d])?'unfold':'fold'}" title="Plegar o desplegar todos los días">${Object.keys(state.wkFold||{}).some(d=>state.wkFold[d])?'⤢ Desplegar todo':'⤡ Plegar todo'}</button>
    </div><div id="taskArea"></div>`;
  }
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
      ${dayLocked(state.blocksDate)?'':`<button class="btn-ghost" data-act="blkClose" title="Repasar el día y pasar lo pendiente al día siguiente">✓ Cierre del día</button>`}
      <button class="btn-ghost" data-act="blkExportXlsx" title="Descargar el día en Excel">⬇ Excel</button>
      <button class="btn-ghost" data-act="blkExportPdf" title="Descargar el día en PDF">⬇ PDF</button>
      ${dayLocked(state.blocksDate)?'':`<button class="btn-primary" data-act="blkAdd">＋ Nuevo bloque</button>`}
    </div><div id="taskArea"></div>`;
  }
  return `<div id="taskCards">${taskCards(true)}</div><div class="toolbar tb-tasks">
    ${seg}
    <select class="inp tb-group" data-act="group"><option value="">Sin agrupar</option><option value="area" ${state.group==='area'?'selected':''}>Agrupar por área</option><option value="resp" ${state.group==='resp'?'selected':''}>Agrupar por responsable</option></select>
    <button class="btn-ghost ${state.showDone?'on':''}" data-act="toggleDone">${state.showDone?'Ocultar':'Ver'} completadas</button>
    <button class="btn-primary tb-new" data-act="addTask">＋ Nueva tarea</button>
    <div class="filters">
      <select data-act="filter" data-id="estado"><option value="">Todos los estados</option>${STATUSES.map(s=>`<option value="${s.key}" ${f.estado===s.key?'selected':''}>${s.label}</option>`).join("")}</select>
      <select data-act="filter" data-id="area">${optionList(state.areas,f.area,"Todas las áreas")}</select>
      <select data-act="filter" data-id="resp">${optionList(state.responsables,f.resp,"Todos los responsables")}</select>
      <select data-act="filter" data-id="venc"><option value="">Cualquier vencimiento</option><option value="over" ${f.venc==='over'?'selected':''}>Vencidas</option><option value="today" ${f.venc==='today'?'selected':''}>Vence hoy</option><option value="week" ${f.venc==='week'?'selected':''}>Esta semana</option><option value="none" ${f.venc==='none'?'selected':''}>Sin fecha</option></select>
      <input type="search" placeholder="Buscar tarea…" value="${esc(f.q)}" data-act="filter" data-id="q" data-input>
    </div>
    </div>
  </div><div class="task-meta" id="taskMeta"></div><div id="taskArea"></div>`;
}
function taskCards(anim){
  const base=filtered(["estado","venc"]);
  const over=base.filter(t=>isOpen(t)&&t.due&&t.due<today()).length;
  const n=k=>base.filter(t=>t.status===k).length;
  const f=state.filters;
  const opens=base.filter(isOpen);
  const oldest=opens.filter(t=>t.due&&t.due<today()).sort((a,b)=>a.due.localeCompare(b.due))[0];
  const week=opens.filter(t=>t.due&&t.due>=today()&&daysUntil(t.due)<=7).length;
  const nodate=opens.filter(t=>!t.due).length;
  const defs=[
    ["sc-over","Vencidas",over,"venc","over", oldest?`La más atrasada, hace ${-daysUntil(oldest.due)} días`:"Ninguna atrasada"],
    ["sc-urg","Urgentes",n("urg"),"estado","urg", "Marcadas como prioridad"],
    ["sc-proc","En proceso",n("proc"),"estado","proc", week?`${week} vence${week===1?'':'n'} esta semana`:"Nada vence esta semana"],
    ["sc-sin","Sin iniciar",n("sin"),"estado","sin", nodate?`${nodate} sin fecha de vencimiento`:"Todas con fecha"],
    ["sc-comp","Completadas",n("comp"),"estado","comp", "Se ocultan con el botón Completadas"],
  ];
  return `<div class="sumcards">${defs.map(([cls,label,num,key,val,sub],i)=>{
    const on=f[key]===val;
    return `<button class="sumcard sc-click ${cls} ${on?'on':''} ${!anim?'noanim':''}" data-act="cardFilter" data-k="${key}" data-v="${val}" aria-pressed="${on}" title="${on?'Quitar filtro':'Ver solo: '+label.toLowerCase()}" style="animation-delay:${i*60}ms"><span class="sc-label">${label}</span><span class="sc-num" ${anim?`data-count="${num}"`:''}>${anim?0:num}</span><span class="sc-sub">${sub}</span></button>`;
  }).join("")}</div>`;
}
function taskMetaHTML(shown){
  const f=state.filters; const active=Object.values(f).some(v=>v);
  const hidden=(state.taskView==='tabla'&&!state.showDone&&!f.estado)?filtered().filter(t=>!isOpen(t)).length:0;
  return `<span>${shown} de ${state.tasks.length} tareas${hidden?` · ${hidden} cerrada${hidden===1?'':'s'} oculta${hidden===1?'':'s'}`:''}</span>${active?`<button class="link-btn" data-act="clearFilters">Limpiar filtros</button>`:''}`;
}
function filtered(ignore=[]){
  const f={...state.filters}; ignore.forEach(k=>f[k]="");
  const t0=today(),weekEnd=new Date(Date.now()+7*864e5).toISOString().slice(0,10);
  return state.tasks.filter(t=>{
    if(f.estado&&t.status!==f.estado)return false;
    if(f.area&&t.area!==f.area)return false;
    if(f.resp&&t.resp!==f.resp)return false;
    if(f.q&&!t.title.toLowerCase().includes(f.q.toLowerCase()))return false;
    if(f.venc==='over'&&!(t.due&&t.due<t0&&isOpen(t)))return false;
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
  const prio=t=>({urg:0,proc:1,sin:2,comp:3,desc:4}[t.status]??5);
  return [...list].sort((a,b)=>{ if(s.col==='due'){ const ca=!isOpen(a),cb=!isOpen(b); if(ca!==cb)return ca?1:-1; } const va=val(a),vb=val(b); if(va<vb)return -1*dir; if(va>vb)return 1*dir; return (prio(a)-prio(b))||(a.n-b.n); });
}
function paintTasks(){
  const area=$("#taskArea"); if(!area)return;
  if(state.taskView==='bloques'){ area.innerHTML=bloquesHTML(); bindTaskArea(); wireBloques(); return; }
  if(state.taskView==='semana'){ area.innerHTML=semanaHTML(); bindTaskArea(); wireSemana(); return; }
  const list=filtered();
  refreshSumCards();
  const meta=$("#taskMeta");
  if(state.taskView==='kanban'){ if(meta){ meta.innerHTML=taskMetaHTML(list.length); bindContentArea(meta); } if(!list.length){ area.innerHTML=`<div class="table-wrap">${emptyHTML()}</div>`; return; } area.innerHTML=kanbanHTML(list); bindTaskArea(); wireKanban(); return; }
  const tl=sortList(visibleTable(list));
  if(meta){ meta.innerHTML=taskMetaHTML(tl.length); bindContentArea(meta); }
  if(!tl.length){ area.innerHTML=`<div class="table-wrap">${emptyHTML()}</div>`; return; }
  area.innerHTML=tableHTML(tl); bindTaskArea();
}
function emptyHTML(){
  const f=state.filters, any=Object.values(f).some(v=>v);
  if(f.venc==='over') return `<div class="empty-cta"><span class="big">✅</span><p>No tenés tareas vencidas.</p><button class="btn-ghost" data-act="clearFilters">Ver todas las tareas</button></div>`;
  if(any) return `<div class="empty-cta"><span class="big">🔍</span><p>Ninguna tarea coincide con estos filtros.</p><button class="btn-ghost" data-act="clearFilters">Limpiar filtros</button></div>`;
  if(!state.showDone&&state.tasks.length) return `<div class="empty-cta"><span class="big">🎉</span><p>No queda nada pendiente.</p><button class="btn-ghost" data-act="toggleDone">Ver completadas</button></div>`;
  return `<div class="empty-cta"><span class="big">☑</span><p>Todavía no cargaste ninguna tarea.</p><button class="btn-primary" data-act="addTask">＋ Crear la primera</button></div>`;
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
function pickCell(t,field,view,opts){
  return `<div class="cell-pick">${view}<select data-act="setF" data-id="${t.id}" data-f="${field}" aria-label="${field==='area'?'Área':'Responsable'}">${opts}</select></div>`;
}
function rowHTML(t){
  const st=stMeta(t.status); const done=t.subs.filter(s=>s.d).length,tot=t.subs.length,pct=tot?Math.round(done/tot*100):0;
  const sp=tot?`<span class="subprog" title="${done} de ${tot} subtareas"><span class="bar"><i style="width:${pct}%"></i></span>${done}/${tot}</span>`:"";
  const rec=t.recur?`<span class="recur-badge" title="Se repite: ${recurLabel(t.recur)}">↻</span>`:"";
  const nf=(t.files||[]).length;
  const links=(t.url?`<a class="icon-link" href="${esc(t.url)}" target="_blank" rel="noopener" title="${esc(t.url)}">${ICONS.link}</a>`:"")+(nf?`<span class="attach-mini" title="${nf} archivo(s)">${ICONS.clip}${nf>1?' '+nf:''}</span>`:"");
  const areaView=t.area?`<span class="cv area-chip"><i style="background:${tagColor(t.area)}"></i>${esc(t.area)}</span>`:`<span class="cv none">Sin área</span>`;
  const respView=t.resp?`<span class="cv resp-cell"><b style="background:${tagColor(t.resp)}">${esc((t.resp[0]||"?").toUpperCase())}</b>${esc(t.resp)}</span>`:`<span class="cv none">Sin asignar</span>`;
  const op=isOpen(t), bkt=dueBucket(t), rel=dueRel(t);
  const rowCls=!op?'row-closed':bkt===0?'row-over':bkt===1?'row-today':'';
  return `<tr class="${rowCls}"><td class="num">${t.n}</td>
    <td><div class="title-wrap"><button class="task-title" data-act="open" data-id="${t.id}">${esc(t.title)}${rec}</button>${sp}</div></td>
    <td><select class="status-pill ${st.cls}" data-act="setF" data-id="${t.id}" data-f="status" aria-label="Estado">${STATUSES.map(x=>`<option value="${x.key}" ${x.key===t.status?'selected':''}>${x.label}</option>`).join("")}</select></td>
    <td class="due-cell ${op?dueClass(t.due):''}"><div class="due-pick"><button class="due-txt ${t.due?'':'is-empty'}" data-act="duePick" data-id="${t.id}" title="Cambiar el vencimiento">${t.due?fmt(t.due):'Sin fecha'}</button><input type="date" class="due-h" id="due_${t.id}" value="${esc(t.due||'')}" data-act="setF" data-id="${t.id}" data-f="due" aria-label="Vencimiento" tabindex="-1">${rel?`<span class="due-rel">${rel}</span>`:''}</div></td>
    <td>${pickCell(t,'area',areaView,optionList(state.areas,t.area,"— sin área —"))}</td>
    <td>${pickCell(t,'resp',respView,optionList(state.responsables,t.resp,"— sin asignar —"))}</td>
    <td class="date dim">${fmt(t.created)}</td>
    <td class="links">${links||'<span class="none">—</span>'}</td></tr>`;
}
const TASK_COLS=8;
function tableHTML(list){
  let body;
  const s=state.sort;
  if(state.group){ const groups={}; list.forEach(t=>{ const g=t[state.group]||"(sin asignar)"; (groups[g]=groups[g]||[]).push(t); }); body=Object.keys(groups).sort().map(g=>`<tr class="group-row"><td colspan="${TASK_COLS}">${esc(g)} <span class="gcount">${groups[g].length}</span></td></tr>${groups[g].map(rowHTML).join("")}`).join(""); }
  else if(s.col==='due'&&s.dir==='asc'){
    // separadores según qué tan cerca está el vencimiento
    const counts={}; list.forEach(t=>{ const b=dueBucket(t); counts[b]=(counts[b]||0)+1; });
    let last=-1;
    body=list.map(t=>{ const b=dueBucket(t); let h=""; if(b!==last){ last=b; h=`<tr class="group-row due-g g${b}"><td colspan="${TASK_COLS}">${DUE_BUCKETS[b]} <span class="gcount">${counts[b]}</span></td></tr>`; } return h+rowHTML(t); }).join("");
  }
  else body=list.map(rowHTML).join("");
  return `<div class="table-wrap"><table class="tasks tasks-main"><colgroup><col style="width:52px"><col><col style="width:140px"><col style="width:150px"><col style="width:150px"><col style="width:140px"><col style="width:84px"><col style="width:76px"></colgroup><thead><tr>${th('n','N°')}${th('title','Tarea')}${th('status','Estado')}${th('due','Vence')}${th('area','Área')}${th('resp','Responsable')}${th('created','Creada')}<th>Enlaces</th></tr></thead><tbody>${body}</tbody></table></div>`;
}
function kanbanHTML(list){
  const cols=STATUSES.map(s=>{
    const items=list.filter(t=>t.status===s.key).sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999')||a.n-b.n);
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
  const st=stMeta(t.status); const locked=dayLocked(b.fecha); const pp=postponed(t);
  const chk=locked?'':`<input type="checkbox" class="blk-chk" data-act="blkDone" data-id="${t.id}" ${t.status==='comp'?'checked':''} title="Marcar como completada">`;
  return `<div class="blk-task ${t.status==='comp'?'is-done':''}">${chk}<button class="task-title" data-act="open" data-id="${t.id}" style="flex:1;text-align:left">${esc(t.title)}</button>${pp>1?`<span class="wk-pp" title="Ya se planificó ${pp} días y quedó pendiente">↺ ${pp}</span>`:''}${t.area?`<span class="tag" style="background:var(--line-2);color:var(--tx-dim);margin-right:2px">${esc(t.area)}</span>`:''}<select class="status-pill ${st.cls}" data-act="setF" data-id="${t.id}" data-f="status" ${locked?'disabled':''}>${STATUSES.map(s=>`<option value="${s.key}" ${s.key===t.status?'selected':''}>${s.label}</option>`).join("")}</select>${locked?'':`<button class="del" data-act="blkTaskDel" data-b="${b.id}" data-t="${t.id}" title="Quitar del bloque" style="opacity:1">✕</button>`}</div>`;
}
function blkHeadHTML(b,over){
  const dur=durLabel(b.inicio,b.fin);
  if(dayLocked(b.fecha)) return `<div class="blk-head">
    <span class="blk-name-ro">${esc(b.nombre||'Bloque')}</span>
    <span class="blk-time">${b.inicio||b.fin?`${esc(b.inicio||'—')} – ${esc(b.fin||'—')}`:'sin horario'}${dur?`<span class="blk-dur">${dur}</span>`:''}</span>
  </div>`;
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
      ${dayLocked(b.fecha)?'':`<button class="blk-addtask" data-act="blkPick" data-id="${b.id}">＋ Agregar tarea desde el seguimiento</button>`}
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
    const body=open?`<div class="blk-comp-body">${b.tareas.map(id=>blkTaskRow(b,id)).join("")||'<div style="color:var(--tx-faint);font-size:.84em;padding:4px 2px">Sin tareas todavía.</div>'}${dayLocked(b.fecha)?'':`<button class="blk-addtask" data-act="blkPick" data-id="${b.id}">＋ Agregar tarea</button>`}</div>`:'';
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
  const detail=state.blkOpen?(()=>{ const b=getBloque(state.blkOpen); if(!b||b.fecha!==state.blocksDate)return""; return `<div class="tl-detail">${blkHeadHTML(b,overlap.has(b.id))}<div class="blk-tasks">${b.tareas.map(id=>blkTaskRow(b,id)).join("")||'<div style="color:var(--tx-faint);font-size:.84em;padding:4px 2px">Sin tareas todavía.</div>'}</div>${dayLocked(b.fecha)?'':`<button class="blk-addtask" data-act="blkPick" data-id="${b.id}">＋ Agregar tarea</button>`}</div>`; })():`<div class="tl-hint">Tocá un bloque para ver y editar sus tareas.</div>`;
  return `<div class="tl-layout"><div>${graph}${noTimeHTML}</div><div>${detail}</div></div>`;
}
/* ---------- Planificación: asignaciones vigentes y liberación automática ----------
   Regla: una tarea está "asignada" sólo si figura en un bloque de hoy o de un día futuro.
   Los bloques de días pasados quedan como historial: ya no retienen la tarea. */
const LOOSE = "Sin bloque";
function blocksOn(date){ return state.bloques.filter(b=>b.fecha===date); }
function planBlock(id){ const t0=today(); return state.bloques.find(b=>b.fecha&&b.fecha>=t0&&(b.tareas||[]).includes(id))||null; }
function pastPlanDates(id){ const t0=today(); return [...new Set(state.bloques.filter(b=>b.fecha&&b.fecha<t0&&(b.tareas||[]).includes(id)).map(b=>b.fecha))].sort(); }
function postponed(t){ return isOpen(t)?pastPlanDates(t.id).length:0; }
function isAvailable(t){ return isOpen(t)&&!planBlock(t.id); }
function freedTasks(){ return state.tasks.filter(t=>isAvailable(t)&&pastPlanDates(t.id).length).sort((a,b)=>(a.due||"9999").localeCompare(b.due||"9999")); }
function availableTasks(q){
  const s=(q||"").trim().toLowerCase();
  let l=state.tasks.filter(isAvailable);
  if(s) l=l.filter(t=>t.title.toLowerCase().includes(s)||(t.area||"").toLowerCase().includes(s)||(t.resp||"").toLowerCase().includes(s));
  const prio={urg:0,proc:1,sin:2};
  return l.sort((a,b)=>(a.due||"9999").localeCompare(b.due||"9999")||(prio[a.status]??3)-(prio[b.status]??3)||a.n-b.n);
}
function dayLocked(date){ return (date||state.blocksDate||today()) < today(); }
function looseBlock(date,create){
  let b=state.bloques.find(x=>x.fecha===date&&x.nombre===LOOSE);
  if(!b&&create){ b={id:crypto.randomUUID(),fecha:date,nombre:LOOSE,inicio:"",fin:"",orden:0,tareas:[]}; state.bloques.push(b); saveBloqueNow(b.id); }
  return b||null;
}
function clearAssign(id,onlyDate){
  const t0=today();
  state.bloques.forEach(b=>{
    if(!b.fecha||b.fecha<t0)return;                 // el historial no se toca
    if(onlyDate&&b.fecha!==onlyDate)return;
    const k=(b.tareas||[]).indexOf(id);
    if(k>=0){ b.tareas.splice(k,1); scheduleSaveBloque(b.id); }
  });
}
function assignToDay(id,date,blockId){
  if(!date||date<today())return false;
  const cur=planBlock(id);
  if(cur&&cur.fecha===date&&!blockId)return false;   // ya está ese día
  clearAssign(id);
  const target=blockId?getBloque(blockId):looseBlock(date,true);
  if(!target)return false;
  if(!target.tareas.includes(id)){ target.tareas.push(id); scheduleSaveBloque(target.id); }
  return true;
}

/* ---------- Vista Semana ---------- */
function weekRefDate(){ return new Date((state.weekRef||today())+"T00:00"); }
function weekDays(n){ const s=weekStart(weekRefDate()); return [...Array(n||5)].map((_,i)=>{ const d=new Date(s); d.setDate(d.getDate()+i); return ymd(d); }); }
function weekendDays(){ return weekDays(7).slice(5); }
function weekLabel(){ const d=weekDays(); const a=new Date(d[0]+"T00:00"), b=new Date(d[4]+"T00:00");
  return `${a.getDate()} ${MESES[a.getMonth()].slice(0,3)} – ${b.getDate()} ${MESES[b.getMonth()].slice(0,3)}`; }
function dayPlan(date){
  const out=[];
  blocksOn(date).sort((a,b)=>(minutes(a.inicio)??1e4)-(minutes(b.inicio)??1e4)||(a.orden||0)-(b.orden||0))
    .forEach(b=>(b.tareas||[]).forEach(id=>{ const t=taskById(id); if(t) out.push({t,b}); }));
  return out;
}
function wkCard({t,b},date,locked,inGrp){
  const st=stMeta(t.status);
  const late=t.due&&date>t.due&&isOpen(t);
  const pp=postponed(t);
  const freed=locked&&isOpen(t);
  return `<div class="wk-card ${isOpen(t)?'':'is-done'} ${freed?'is-freed':''}" data-wk="${t.id}" draggable="${locked?'false':'true'}" ${freed?'title="Quedó sin completar: volvió a la bandeja"':''}>
    <button class="wk-title" data-act="open" data-id="${t.id}">${esc(t.title)}</button>
    <div class="wk-meta">
      <span class="status-pill ${st.cls}" style="font-size:.74em;padding:1px 7px">${st.label}</span>
      ${!inGrp&&b.nombre&&b.nombre!==LOOSE?`<span class="wk-blk" title="Bloque: ${esc(b.nombre)}">${esc(b.nombre)}${b.inicio?` · ${esc(b.inicio)}`:''}</span>`:''}
      ${t.due?`<span class="wk-due ${late?'late':''}" title="${late?'La fecha de vencimiento es anterior a este día':'Vence'}">${late?'⚠ ':''}${esc(fmt(t.due))}</span>`:''}
      ${freed?`<span class="wk-pp">liberada</span>`:(pp>1?`<span class="wk-pp" title="Ya se planificó ${pp} días y quedó pendiente">↺ ${pp}</span>`:'')}
    </div>
    ${locked?'':`<button class="wk-x" data-act="wkUnassign" data-t="${t.id}" data-d="${date}" title="Quitar de este día">✕</button>`}
  </div>`;
}
function semanaHTML(){
  const days=weekDays(), t0=today();
  const cols=days.map(d=>{
    const items=dayPlan(d), locked=d<t0;
    const pend=items.filter(x=>isOpen(x.t)).length;
    const dd=new Date(d+"T00:00");
    const bl=blocksOn(d).sort((a,b)=>(minutes(a.inicio)??1e4)-(minutes(b.inicio)??1e4)||(a.orden||0)-(b.orden||0));
    const named=bl.filter(b=>b.nombre!==LOOSE);
    const loose=bl.filter(b=>b.nombre===LOOSE);
    const looseCards=loose.flatMap(b=>(b.tareas||[]).map(id=>{ const t=taskById(id); return t?wkCard({t,b},d,locked):''; })).join("");
    const grupos=named.map(b=>{
      const cards=(b.tareas||[]).map(id=>{ const t=taskById(id); return t?wkCard({t,b},d,locked,true):''; }).join("");
      const rango=(b.inicio||b.fin)?`${b.inicio||'—'}${b.fin?'–'+b.fin:''}`:'';
      return `<div class="wk-grp" data-day="${d}" data-b="${b.id}">
        <div class="wk-grp-h" title="${esc(b.nombre||'Bloque')}${rango?' · '+esc(rango):''}" ${locked?'':`data-act="wkBlockEdit" data-id="${b.id}"`}>
          <span class="wk-grp-n">${esc(b.nombre||'Bloque')}</span>${rango?`<span class="wk-grp-t">${esc(rango)}</span>`:''}
        </div>
        <div class="wk-grp-b">${cards||`<div class="wk-empty sm">${locked?'—':'Soltá acá'}</div>`}</div>
      </div>`;
    }).join("");
    const sueltas=looseCards?`<div class="wk-loose">${named.length?'<div class="wk-grp-h ro"><span class="wk-grp-n">Sin bloque</span></div>':''}${looseCards}</div>`:'';
    const vacio=(!grupos&&!looseCards)?`<div class="wk-empty">${locked?'—':'Soltá una tarea acá'}</div>`:'';
    const fold=!!state.wkFold[d];
    return `<div class="wk-col ${d===t0?'is-today':''} ${locked?'is-past':''} ${[0,6].includes(dd.getDay())?'is-we':''} ${fold?'is-fold':''}" data-day="${d}">
      <div class="wk-head">
        <button class="wk-fold" data-act="wkFold" data-d="${d}" title="${fold?'Desplegar el día':'Plegar el día'}" aria-expanded="${!fold}">${fold?'▸':'▾'}</button>
        <span class="wk-dow">${DIAS[(dd.getDay()+6)%7]} ${dd.getDate()}</span>
        <span class="wk-n" title="${pend} pendiente(s)">${items.length?pend:''}</span>
        ${locked?'':`<button class="wk-add" data-act="wkBlockNew" data-d="${d}" title="Crear un bloque en este día">＋</button>`}
      </div>
      ${fold?`<button class="wk-foldnote" data-act="wkFold" data-d="${d}">${items.length?`${items.length} tarea${items.length===1?'':'s'} · ${named.length} bloque${named.length===1?'':'s'}`:'Sin tareas'}</button>`
            :`<div class="wk-body">${grupos}${sueltas}${vacio}</div>`}
    </div>`;
  }).join("");
  const we=weekendDays().map(d=>({d,items:dayPlan(d)})).filter(x=>x.items.length);
  const weCol=we.length?`<div class="wk-col is-we" data-day="${we[we.length-1].d}">
    <div class="wk-head"><span class="wk-dow">Fin de semana</span><span class="wk-n">${we.reduce((n,x)=>n+x.items.filter(y=>isOpen(y.t)).length,0)}</span></div>
    <div class="wk-body">${we.map(x=>x.items.map(it=>wkCard(it,x.d,x.d<t0)).join("")).join("")}</div>
  </div>`:'';
  return `<div class="wk-stack"><div class="wk-grid">${cols}${weCol}</div>${trayHTML('semana')}</div>`;
}
function trayHTML(mode){
  const t0=today();
  const avail=availableTasks(state.wkQ);
  const freed=freedTasks().length;
  let opts;
  if(mode==='bloques'){
    const bl=blocksOn(state.blocksDate).sort((a,b)=>(minutes(a.inicio)??1e4)-(minutes(b.inicio)??1e4)||(a.orden||0)-(b.orden||0));
    opts=bl.map(b=>`<option value="${b.id}">${esc(b.nombre||'Bloque')}${b.inicio?` · ${esc(b.inicio)}`:''}</option>`).join("")+`<option value="__loose">Sin bloque</option>`;
  } else {
    opts=weekDays().filter(d=>d>=t0).map(d=>{
      const dd=new Date(d+"T00:00");
      const lbl=(d===t0?'Hoy':Cap(DIAS[(dd.getDay()+6)%7]))+' '+dd.getDate();
      const bl=blocksOn(d).filter(b=>b.nombre!==LOOSE).sort((a,b)=>(minutes(a.inicio)??1e4)-(minutes(b.inicio)??1e4)||(a.orden||0)-(b.orden||0));
      const items=[`<option value="${d}|">Sin bloque</option>`,...bl.map(b=>`<option value="${d}|${b.id}">${esc(b.nombre||'Bloque')}${b.inicio?` · ${esc(b.inicio)}`:''}</option>`)];
      return `<optgroup label="${lbl}">${items.join("")}</optgroup>`;
    }).join("");
  }
  const act=mode==='bloques'?'trayToBlock':'wkAssign';
  const rows=avail.slice(0,60).map(t=>{
    const st=stMeta(t.status), pp=postponed(t);
    return `<div class="wk-tray-row" data-wk="${t.id}" draggable="true">
      <div class="wk-tr-main">
        <button class="wk-title" data-act="open" data-id="${t.id}">${esc(t.title)}</button>
        <div class="wk-meta">
          <span class="status-pill ${st.cls}" style="font-size:.72em;padding:1px 6px">${st.label}</span>
          ${t.area?`<span class="wk-blk">${esc(t.area)}</span>`:''}
          ${t.due?`<span class="wk-due ${t.due<t0?'late':''}">${t.due<t0?'⚠ ':''}${esc(fmt(t.due))}</span>`:''}
          ${pp?`<span class="wk-pp" title="Se liberó de ${pp} día(s) anterior(es)">↺ ${pp}</span>`:''}
        </div>
      </div>
      <select class="wk-to" data-act="${act}" data-t="${t.id}" title="${mode==='bloques'?'Agregar a un bloque de este día':'Planificar para…'}"><option value="">→</option>${opts}</select>
    </div>`;
  }).join("");
  const wide=mode!=='bloques';
  return `<div class="wk-tray ${wide?'wide':''}">
    <div class="wk-tray-h">
      <span style="font-weight:600">Bandeja</span><span class="wk-n">${avail.length}</span>
      <span class="wk-tray-sub inline">${mode==='bloques'?'Arrastrá una tarea a un bloque.':'Tareas sin día asignado; arrastralas a un día o a un bloque.'}${freed?` <b>${freed}</b> se liberaron de días pasados.`:''}</span>
      <input type="search" class="inp tray-q" placeholder="Buscar en la bandeja…" value="${esc(state.wkQ||'')}" data-act="wkSearch" data-input>
    </div>
    <div class="wk-tray-body">${rows||'<div class="wk-empty">No hay tareas disponibles.</div>'}</div>
    ${avail.length>60?`<p class="wk-tray-sub">Se muestran 60 de ${avail.length}. Usá el buscador para filtrar.</p>`:''}
  </div>`;
}
function wireSemana(){
  let drag=null;
  document.querySelectorAll('[data-wk][draggable="true"]').forEach(c=>{
    c.addEventListener('dragstart',e=>{ drag=c.dataset.wk; e.dataTransfer.effectAllowed='move'; setTimeout(()=>c.style.opacity='.4',0); });
    c.addEventListener('dragend',()=>{ c.style.opacity=''; });
  });
  document.querySelectorAll('.wk-col:not(.is-past) .wk-grp').forEach(g=>{
    g.addEventListener('dragover',e=>{ e.preventDefault(); e.stopPropagation(); g.classList.add('drag-over'); });
    g.addEventListener('dragleave',()=>g.classList.remove('drag-over'));
    g.addEventListener('drop',e=>{ e.preventDefault(); e.stopPropagation(); g.classList.remove('drag-over');
      if(!drag)return; assignToDay(drag,g.dataset.day,g.dataset.b); drag=null; paintTasks(); });
  });
  document.querySelectorAll('.wk-col:not(.is-past)').forEach(col=>{
    col.addEventListener('dragover',e=>{ e.preventDefault(); col.classList.add('drag-over'); });
    col.addEventListener('dragleave',()=>col.classList.remove('drag-over'));
    col.addEventListener('drop',e=>{ e.preventDefault(); col.classList.remove('drag-over');
      if(!drag)return; assignToDay(drag,col.dataset.day); drag=null; paintTasks(); });
  });
  const tray=document.querySelector('.wk-tray-body');
  if(tray){
    tray.addEventListener('dragover',e=>{ e.preventDefault(); tray.classList.add('drag-over'); });
    tray.addEventListener('dragleave',()=>tray.classList.remove('drag-over'));
    tray.addEventListener('drop',e=>{ e.preventDefault(); tray.classList.remove('drag-over');
      if(!drag)return; clearAssign(drag); drag=null; paintTasks(); });
  }
}

/* ---------- Bloque: alta y edición en ventana flotante ---------- */
function openBlockModal(date,id){
  const b=id?getBloque(id):null;
  const d=b?b.fecha:date;
  const dd=new Date(d+"T00:00");
  const sug=["Foco","Reuniones","Administrativo","Operativo"];
  openHtmlModal(`<div class="modal-head" style="border-bottom:1px solid var(--line);padding:16px 18px;display:flex;align-items:center;gap:12px">
      <span class="m-title" style="flex:1;font-size:1.1em;font-weight:600">${b?'Editar bloque':'Nuevo bloque'} · ${Cap(DIAS[(dd.getDay()+6)%7])} ${dd.getDate()}</span>
      <button class="modal-close" data-act="cierreClose">✕</button>
    </div>
    <div style="padding:16px 18px">
      <div class="m-field"><label>Nombre</label><input class="inp" id="bmNombre" value="${esc(b?b.nombre:'')}" placeholder="Foco, Reuniones, Administrativo…" list="bmSug"></div>
      <datalist id="bmSug">${sug.map(x=>`<option value="${x}">`).join("")}</datalist>
      <div style="display:flex;gap:10px;margin-top:12px">
        <div class="m-field" style="flex:1"><label>Desde</label><input type="time" class="inp" id="bmIni" value="${esc(b?b.inicio:'')}"></div>
        <div class="m-field" style="flex:1"><label>Hasta</label><input type="time" class="inp" id="bmFin" value="${esc(b?b.fin:'')}"></div>
      </div>
      <p style="font-size:.8em;color:var(--tx-faint);margin:10px 0 0">Después arrastrá tareas de la bandeja al bloque, o usá el selector de cada tarea.</p>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px">
        ${b?`<button class="btn-ghost" data-act="wkBlockDel" data-id="${b.id}" style="margin-right:auto;color:var(--st-urg)">Eliminar</button>`:''}
        <button class="btn-ghost" data-act="cierreClose">Cancelar</button>
        <button class="btn-primary" data-act="wkBlockSave" data-d="${d}" data-id="${b?b.id:''}">${b?'Guardar':'Crear bloque'}</button>
      </div>
    </div>`);
  const n=$("#bmNombre"); if(n){ n.focus(); n.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); ACTIONS.wkBlockSave({dataset:{d,id:b?b.id:''}}); } }; }
}
function saveBlockFromModal(d,id){
  const nombre=($("#bmNombre")?.value||"").trim()||"Bloque";
  const inicio=$("#bmIni")?.value||"", fin=$("#bmFin")?.value||"";
  if(nombre===LOOSE){ toast('Ese nombre está reservado. Elegí otro.'); return; }
  let b=id?getBloque(id):null;
  if(b){ b.nombre=nombre; b.inicio=inicio; b.fin=fin; }
  else{
    const maxOrden=state.bloques.filter(x=>x.fecha===d).reduce((m,x)=>Math.max(m,x.orden||0),0);
    b={id:crypto.randomUUID(),fecha:d,nombre,inicio,fin,orden:maxOrden+1,tareas:[]};
    state.bloques.push(b);
  }
  saveBloqueNow(b.id); closeModal(); paintTasks();
}

/* ---------- Tareas liberadas ---------- */
function openLiberadas(){
  const list=freedTasks(), t0=today();
  const blocks=blocksOn(t0).sort((a,b)=>(minutes(a.inicio)??1e4)-(minutes(b.inicio)??1e4));
  const opts=`<option value="">Planificar para hoy…</option>`+blocks.map(b=>`<option value="${b.id}">${esc(b.nombre||'Bloque')}${b.inicio?` · ${esc(b.inicio)}`:''}</option>`).join("")+`<option value="__loose">Hoy, sin bloque</option>`;
  const rows=list.map(t=>{
    const ds=pastPlanDates(t.id), st=stMeta(t.status);
    return `<div class="cierre-row">
      <span style="flex:1">${esc(t.title)}</span>
      <span class="status-pill ${st.cls}" style="font-size:.74em">${st.label}</span>
      <span class="wk-pp" title="Días en los que estuvo planificada">↺ ${ds.length} · último ${esc(fmt(ds[ds.length-1]))}</span>
      <select class="inp" style="width:auto;font-size:.82em" data-act="freeAssign" data-t="${t.id}">${opts}</select>
    </div>`;
  }).join("");
  openHtmlModal(`<div class="modal-head" style="border-bottom:1px solid var(--line);padding:16px 18px;display:flex;align-items:center;gap:12px">
      <span class="m-title" style="flex:1;font-size:1.12em;font-weight:600">Tareas liberadas</span>
      <button class="modal-close" data-act="cierreClose">✕</button>
    </div>
    <div style="padding:16px 18px">
      <p style="font-size:.88em;color:var(--tx-dim);margin:0 0 12px">Quedaron sin completar en días que ya pasaron, así que volvieron a estar disponibles. Podés planificarlas para hoy o dejarlas en la bandeja de la vista Semana.</p>
      ${rows?`<div class="cierre-list">${rows}</div>`:'<div class="empty" style="padding:24px">No hay tareas liberadas.</div>'}
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px"><button class="btn-ghost" data-act="cierreClose">Cerrar</button></div>
    </div>`);
}

function bloquesHTML(){
  const list=dayBloques();
  const overlap=blocksOverlap(list);
  let nTasks=0,nUrg=0,planMin=0;
  list.forEach(b=>{ nTasks+=b.tareas.length; b.tareas.forEach(id=>{ const t=taskById(id); if(t&&t.status==='urg')nUrg++; }); const a=minutes(b.inicio),f=minutes(b.fin); if(a!=null&&f!=null&&f>a)planMin+=f-a; });
  const planH=Math.floor(planMin/60),planM=planMin%60;
  const planTxt=planMin?(planH?planH+"h ":"")+(planM?planM+"m":(planH?"":"0m")):"—";
  const overload=planMin>360;
  const locked=dayLocked(state.blocksDate);
  const nFree=freedTasks().length;
  const aviso=(!locked&&nFree)?`<div class="blk-freed">
    <span>${nFree===1?'<b>1</b> tarea volvió a estar disponible':`<b>${nFree}</b> tareas volvieron a estar disponibles`}: ${nFree===1?'quedó':'quedaron'} sin completar en días que ya pasaron.</span>
    <button class="btn-ghost" data-act="blkFreed">Ver y planificar</button>
    <button class="btn-ghost" data-act="taskView" data-id="semana">Abrir Semana</button>
  </div>`:'';
  const resumen=`<div style="display:flex;gap:18px;flex-wrap:wrap;align-items:baseline;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--line)">
    <span style="font-size:1.05em;font-weight:600">${esc(Cap(longDate(state.blocksDate)))}</span>
    <span style="font-size:.86em;color:var(--tx-dim)"><b>${list.length}</b> bloque${list.length===1?'':'s'} · <b>${nTasks}</b> tarea${nTasks===1?'':'s'}${nUrg?` · <b style="color:var(--st-urg)">${nUrg}</b> urgente${nUrg===1?'':'s'}`:''} · <b${overload?' style="color:var(--st-proc)"':''}>${planTxt}</b> planificado${overload?' <span title="Más de 6h de foco planificadas — cuidá no sobrecargar el día">⚠</span>':''}</span>
    ${locked?`<span class="blk-ro">Día cerrado · solo lectura</span>`:''}
    ${list.length&&!locked?`<button class="btn-ghost" data-act="blkCopyPrev" style="margin-left:auto;font-size:.82em">⎘ Copiar bloques de ayer</button>`:''}
  </div>${aviso}`;

  if(!list.length){
    if(locked) return `${resumen}<div class="table-wrap"><div class="empty" style="padding:30px 20px">Este día no tuvo bloques.</div></div>`;
    return `${resumen}<div class="table-wrap"><div class="empty" style="padding:30px 20px">No hay bloques para este día.<br><br><button class="btn-primary" data-act="blkAdd">＋ Crear el primer bloque</button> &nbsp; <button class="btn-ghost" data-act="blkCopyPrev">⎘ Copiar bloques de ayer</button></div></div>`;
  }

  let body;
  if(state.blkView==='compacta') body=blkCompacta(list,overlap);
  else if(state.blkView==='timeline') body=blkTimeline(list,overlap);
  else body=blkAgenda(list,overlap);

  const withTray=locked?body:`<div class="wk-layout blk-layout"><div>${body}</div>${trayHTML('bloques')}</div>`;
  return `${resumen}${withTray}${state.blockPick?pickPanelHTML():''}`;
}
function pickPanelHTML(){
  const b=getBloque(state.blockPick); if(!b)return"";
  const q=(state._blkQ||"").toLowerCase();
  let list=state.tasks.filter(isAvailable);
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
  if(dayLocked(state.blocksDate)){ const ov=$("#blkOverlay"); if(ov) ov.onclick=e=>{ if(e.target.id==='blkOverlay'){ state.blockPick=null; paintTasks(); } }; return; }
  let dragTask=null;
  document.querySelectorAll('.wk-tray-row[data-wk]').forEach(c=>{
    c.addEventListener('dragstart',e=>{ dragTask=c.dataset.wk; e.dataTransfer.effectAllowed='move'; setTimeout(()=>c.style.opacity='.4',0); });
    c.addEventListener('dragend',()=>{ c.style.opacity=''; });
  });
  const tray=document.querySelector('.wk-tray-body');
  if(tray){
    tray.addEventListener('dragover',e=>{ e.preventDefault(); tray.classList.add('drag-over'); });
    tray.addEventListener('dragleave',()=>tray.classList.remove('drag-over'));
    tray.addEventListener('drop',e=>{ e.preventDefault(); tray.classList.remove('drag-over'); if(!dragTask)return; clearAssign(dragTask); dragTask=null; paintTasks(); });
  }
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
      assignToDay(dragTask,state.blocksDate,target.id); dragTask=null; paintTasks();
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

/* ---------- Exportar el día (Excel + PDF) ---------- */
function dayExportData(){
  const list=dayBloques();
  const fmtRange=b=>{ const i=(b.inicio||"").trim(),f=(b.fin||"").trim(); if(i&&f)return i+" – "+f; if(i)return "desde "+i; if(f)return "hasta "+f; return ""; };
  return list.map(b=>({
    nombre:b.nombre||"Bloque",
    horario:fmtRange(b),
    tareas:(b.tareas||[]).map(id=>{
      const t=taskById(id); if(!t)return null;
      return { title:t.title||"", area:t.area||"", resp:t.resp||"", status:stMeta(t.status).label,
               subs:(t.subs||[]).map(s=>({t:s.t||"",d:!!s.d})) };
    }).filter(Boolean)
  }));
}
function dlBlob(content,mime,filename){
  const blob=new Blob([content],{type:mime}); const url=URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=url; a.download=filename; document.body.appendChild(a); a.click();
  setTimeout(()=>{ document.body.removeChild(a); URL.revokeObjectURL(url); },200);
}
function exportDiaXlsx(){
  const data=dayExportData();
  if(!data.length){ toast("No hay bloques para exportar en este día."); return; }
  const xesc=s=>(s||"").toString().replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));
  const cell=(v,style)=>`<Cell${style?` ss:StyleID="${style}"`:""}><Data ss:Type="String">${xesc(v)}</Data></Cell>`;
  const row=cells=>`<Row>${cells}</Row>`;
  let rows="";
  rows+=row(cell(longDate(state.blocksDate),"sTitle"));
  rows+=row("");
  data.forEach(b=>{
    rows+=row(cell(b.nombre,"sBlock")+cell(b.horario,"sBlock"));
    rows+=row(cell("Tarea","sHead")+cell("Área","sHead")+cell("Responsable","sHead")+cell("Estado","sHead"));
    if(!b.tareas.length){ rows+=row(cell("(sin tareas)","sMuted")); }
    b.tareas.forEach(t=>{
      rows+=row(cell(t.title)+cell(t.area)+cell(t.resp)+cell(t.status));
      t.subs.forEach(s=>{ rows+=row(cell((s.d?"☑ ":"☐ ")+"    · "+s.t,"sSub")); });
    });
    rows+=row("");
  });
  const xml=`<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
<Style ss:ID="sTitle"><Font ss:Bold="1" ss:Size="14"/></Style>
<Style ss:ID="sBlock"><Font ss:Bold="1" ss:Size="11" ss:Color="#FFFFFF"/><Interior ss:Color="#4C5BD4" ss:Pattern="Solid"/></Style>
<Style ss:ID="sHead"><Font ss:Bold="1"/><Interior ss:Color="#ECEEFB" ss:Pattern="Solid"/></Style>
<Style ss:ID="sSub"><Font ss:Color="#6B7280"/></Style>
<Style ss:ID="sMuted"><Font ss:Italic="1" ss:Color="#9AA1AC"/></Style>
</Styles>
<Worksheet ss:Name="Día">
<Table>
<Column ss:Width="320"/><Column ss:Width="140"/><Column ss:Width="120"/><Column ss:Width="100"/>
${rows}
</Table>
</Worksheet>
</Workbook>`;
  dlBlob(xml,"application/vnd.ms-excel","Dia_"+state.blocksDate+".xls");
  toast("Excel descargado.");
}
function exportDiaPdf(){
  const data=dayExportData();
  if(!data.length){ toast("No hay bloques para exportar en este día."); return; }
  const e=esc;
  const blocksHtml=data.map(b=>{
    const tareas=b.tareas.length?b.tareas.map(t=>{
      const subs=t.subs.length?`<ul class="subs">${t.subs.map(s=>`<li class="${s.d?'done':''}">${s.d?'☑':'☐'} ${e(s.t)}</li>`).join("")}</ul>`:"";
      const meta=[t.area,t.resp,t.status].filter(Boolean).map(e).join(" · ");
      return `<div class="task"><div class="tt">${e(t.title)}</div>${meta?`<div class="tm">${meta}</div>`:""}${subs}</div>`;
    }).join(""):`<div class="empty">Sin tareas.</div>`;
    return `<section class="blk"><div class="bh"><span class="bn">${e(b.nombre)}</span>${b.horario?`<span class="br">${e(b.horario)}</span>`:""}</div>${tareas}</section>`;
  }).join("");
  const html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Día ${e(state.blocksDate)}</title>
<style>
  *{box-sizing:border-box;} body{font-family:-apple-system,"Segoe UI",Arial,sans-serif;color:#1f2430;margin:32px;line-height:1.45;}
  h1{font-size:20px;margin:0 0 4px;text-transform:capitalize;} .sub{color:#6b7280;font-size:12px;margin:0 0 20px;}
  .blk{border:1px solid #e4e7eb;border-radius:8px;margin-bottom:14px;overflow:hidden;page-break-inside:avoid;}
  .bh{background:#4c5bd4;color:#fff;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;}
  .bn{font-weight:600;font-size:13px;} .br{font-size:12px;opacity:.9;}
  .task{padding:8px 12px;border-top:1px solid #eef0f3;} .task:first-of-type{border-top:0;}
  .tt{font-weight:600;font-size:13px;} .tm{color:#6b7280;font-size:11px;margin-top:2px;}
  .subs{margin:6px 0 0;padding-left:14px;list-style:none;} .subs li{font-size:12px;color:#4b5563;margin:2px 0;}
  .subs li.done{color:#9aa1ac;text-decoration:line-through;}
  .empty{padding:8px 12px;color:#9aa1ac;font-size:12px;font-style:italic;}
  @media print{body{margin:14mm;} @page{margin:12mm;}}
</style></head><body>
<h1>${e(longDate(state.blocksDate))}</h1>
<p class="sub">${data.length} bloque${data.length===1?'':'s'} · ${data.reduce((n,b)=>n+b.tareas.length,0)} tarea(s)</p>
${blocksHtml}
<script>window.onload=function(){setTimeout(function(){window.print();},250);};<\/script>
</body></html>`;
  const w=window.open("","_blank");
  if(!w){ toast("Permití las ventanas emergentes para exportar el PDF."); return; }
  w.document.open(); w.document.write(html); w.document.close();
  toast("Se abrió la vista de impresión — elegí “Guardar como PDF”.");
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


/* ---------- Matriz de Eisenhower ---------- */
function spawnRecurrence(t){ const nt={id:crypto.randomUUID(),n:state.seq++,created:today(),title:t.title,status:'sin',due:nextDue(t.due||today(),t.recur),area:t.area,resp:t.resp,obj:t.obj,url:t.url,file:null,detail:t.detail,recur:t.recur,subs:t.subs.map(s=>({t:s.t,d:false}))}; state.tasks.unshift(nt); saveTaskNow(nt.id); }
function refreshSumCards(){
  const tc=$("#taskCards");
  if(tc){ if(state.taskView==='bloques'||state.taskView==='semana')return; tc.innerHTML=taskCards(false); bindContentArea(tc); return; }
  const wrap=document.querySelector(".sumcards"); if(!wrap)return;
  if(state.taskView==='bloques'||state.taskView==='semana')return;
  const c={sin:0,proc:0,urg:0,comp:0};
  filtered().forEach(t=>{ if(c[t.status]!==undefined)c[t.status]++; });
  const order=[["sc-sin",c.sin],["sc-proc",c.proc],["sc-urg",c.urg],["sc-comp",c.comp]];
  order.forEach(([cls,n])=>{ const el=wrap.querySelector("."+cls+" .sc-num"); if(el){ el.textContent=n; el.dataset.count=n; } });
}
function syncFilterSelects(){ document.querySelectorAll('.filters [data-act="filter"]').forEach(el=>{ el.value=state.filters[el.dataset.id]||""; }); }
function refreshTasks(){ if(state.view==='tareas'){ paintTasks(); refreshSumCards(); } else render(); }
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
function objAvance(o){ let sched=0,done=0; (o&&o.plan||[]).forEach(a=>Object.values((a&&a.months)||{}).forEach(v=>{ if(v){sched++; if(v==='cump')done++;} })); return sched?Math.round(done/sched*100):0; }
function objStatusBadge(s){ const m=OBJ_STATUS.find(x=>x[0]===s)||OBJ_STATUS[0]; return `<span style="display:inline-flex;align-items:center;gap:6px;background:${m[2]};color:${m[1]};border-radius:20px;padding:3px 10px;font-size:.92em;font-weight:600"><span style="width:7px;height:7px;border-radius:50%;background:currentColor"></span>${s}</span>`; }
function avanceColor(p){ return p>=75?"#1D9E75":(p>=40?"#BA7517":(p>0?"#D85A30":"#b4b2a9")); }
function avanceRing(p){
  const r=18, C=2*Math.PI*r, off=C*(1-Math.max(0,Math.min(100,p))/100), col=avanceColor(p);
  return `<div class="aring" title="${p}% de avance">
    <svg viewBox="0 0 44 44" width="44" height="44" role="img" aria-label="Avance ${p}%">
      <circle class="ar-bg" cx="22" cy="22" r="${r}" fill="none" stroke-width="4"></circle>
      <circle class="ar-fg" cx="22" cy="22" r="${r}" fill="none" stroke="${col}" stroke-width="4" stroke-linecap="round"
        stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}" data-off="${off.toFixed(1)}" transform="rotate(-90 22 22)"></circle>
    </svg>
    <span class="ar-num" style="color:${col}"><b data-count="${p}">0</b><i>%</i></span>
  </div>`;
}

function objList(){
  const list=state.objetivos.filter(o=>!state.objFilterArea||o.area===state.objFilterArea);
  const rows=list.map(o=>`<tr>
    <td>${o.area?esc(o.area):'<span style="color:var(--tx-faint)">—</span>'}</td>
    <td><span class="tag">${esc(o.tag)}</span></td>
    <td><button class="task-title" data-act="openObj" data-id="${o.id}">${esc(o.name)}</button></td>
    <td>${o.owner?esc(o.owner):'<span style="color:var(--tx-faint)">—</span>'}</td>
    <td>${objStatusBadge(o.status)}</td>
    <td>${avanceRing(objAvance(o))}</td></tr>`).join("");
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
  const finTab = secId==='admin' ? `<button class="${tab==='fin'?'on':''}" data-act="secTab" data-id="fin">💰 Planificación Financiera</button>` : '';
  const tabs=`<div class="seg"><button class="${tab==='tareas'?'on':''}" data-act="secTab" data-id="tareas">☑ Tareas del área</button><button class="${tab==='venc'?'on':''}" data-act="secTab" data-id="venc">⏰ Vencimientos</button><button class="${tab==='reu'?'on':''}" data-act="secTab" data-id="reu">🗓 Reuniones</button>${repoTab}${sgcTab}${cierTab}${finTab}</div>`;
  let body;
  if(tab==='venc') body=sectionVenc(secId);
  else if(tab==='reu') body=sectionReuniones(secId);
  else if(tab==='repo' && REPO_SECTIONS.includes(secId)) body=sectionRepo(secId);
  else if(tab==='sgc' && secId==='calidad') body=sectionSGC();
  else if(tab==='cierres' && secId==='admin') body=sectionCierres();
  else if(tab==='fin' && secId==='admin') body=sectionFinanzas();
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
    <td style="text-align:center;white-space:nowrap">${v.due&&v.status!=='ok'?`<a class="row-gcal" href="${esc(gcalLink({title:"Vence: "+(v.concepto||'—'),dstr:v.due,details:(v.tipo?v.tipo:'')+(v.nota?" · "+v.nota:'')}))}" target="_blank" rel="noopener" title="Agendar en Google Calendar">🗓</a> `:''}<button class="row-del" data-act="vencDel" data-id="${v.id}">🗑</button></td></tr>`;
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
function readReuForm(r){ if(r&&r.area==='mesa')return readMesaForm(r); const g=id=>{const e=$("#"+id);return e?e.value:undefined;}; const map={reu_titulo:'titulo',reu_fecha:'fecha',reu_part:'participantes',reu_temas:'temas',reu_dec:'decisiones',reu_prox:'proxima'}; for(const[el,fld] of Object.entries(map)){ const v=g(el); if(v!==undefined)r[fld]=v; } }
function taskFromCompromiso(i){ const r=getReu(state.reuSel); if(!r)return; const c=r.compromisos[i]; if(!c||!c.t.trim()){toast("Escribí el compromiso primero");return;} if(r.area==='mesa'&&!(c.resp&&MY_NAMES.some(n=>c.resp.toLowerCase().includes(n)))){toast("Solo podés crear tareas de tus propios compromisos.");return;} if(c.taskId&&state.tasks.some(t=>t.id===c.taskId)){toast("Ya existe la tarea de este compromiso.");return;} const areas=SECTION_AREAS[r.area]||[]; const foro=r.area==='mesa'?(foroById(r.tipo)||{}).label:''; const t={id:crypto.randomUUID(),n:state.seq++,created:today(),title:c.t.trim(),status:"sin",due:c.due||"",area:areas[0]||"",resp:c.resp||"",obj:"",url:"",file:null,detail:"Compromiso de reunión: "+(r.titulo||fmt(r.fecha))+(foro?" ("+foro+")":""),recur:"",subs:[],cuad:""}; state.tasks.unshift(t); saveTaskNow(t.id); c.taskId=t.id; readReuForm(r); scheduleSaveReu(r.id); render(); toast("Tarea creada en Seguimiento"); }
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

/* ---------- Agendar en Google (link prellenado, sin OAuth) ---------- */
function gcalPad(n){ return String(n).padStart(2,"0"); }
function gcalDate(dstr,timeStr){
  // dstr: 'YYYY-MM-DD'. timeStr opcional 'HH:MM'. Devuelve rango dates= para el link.
  if(!dstr) return "";
  const clean=dstr.replace(/-/g,"");
  if(timeStr && /^\d{1,2}:\d{2}$/.test(timeStr)){
    const [h,m]=timeStr.split(":").map(Number);
    const startD=new Date(dstr+"T00:00"); startD.setHours(h,m,0,0);
    const endD=new Date(startD.getTime()+60*60*1000);
    const f=x=>x.getFullYear()+gcalPad(x.getMonth()+1)+gcalPad(x.getDate())+"T"+gcalPad(x.getHours())+gcalPad(x.getMinutes())+"00";
    return f(startD)+"/"+f(endD);
  }
  // todo el día: la fecha de fin es el día siguiente (regla de Google)
  const d=new Date(dstr+"T00:00"); d.setDate(d.getDate()+1);
  const next=d.getFullYear()+gcalPad(d.getMonth()+1)+gcalPad(d.getDate());
  return clean+"/"+next;
}
function gcalLink({title,dstr,time,details,location}){
  const p=new URLSearchParams();
  p.set("action","TEMPLATE");
  p.set("text",title||"Evento");
  const dr=gcalDate(dstr,time); if(dr)p.set("dates",dr);
  if(details)p.set("details",details);
  if(location)p.set("location",location);
  return "https://calendar.google.com/calendar/render?"+p.toString();
}
function gcalBtn(opts,label){
  const href=gcalLink(opts);
  return `<a class="gcal-btn" href="${esc(href)}" target="_blank" rel="noopener" title="Abre Google Calendar con el evento prellenado"><span class="gcal-ic">🗓</span>${esc(label||"Agendar en Google")}</a>`;
}

/* ---------- Calendario (Google ICS, solo lectura vía proxy) ---------- */
const ICS_PROXY = "/api/ics-proxy";
function calToday(){ return new Date(today()+"T00:00"); }
function calCursorDate(){ return state.calCursor?new Date(state.calCursor+"T00:00"):calToday(); }
function ymd(d){ return d.toISOString().slice(0,10); }
function unfold(text){ return text.replace(/\r\n/g,"\n").replace(/\r/g,"\n").replace(/\n[ \t]/g,""); }
function icsUnescape(v){ return (v||"").replace(/\\n/gi,"\n").replace(/\\,/g,",").replace(/\\;/g,";").replace(/\\\\/g,"\\"); }
function parseIcsDate(val,params){
  // val: 20260708 o 20260708T140000Z o 20260708T140000
  const allDay=/^\d{8}$/.test(val);
  if(allDay){ const y=+val.slice(0,4),m=+val.slice(4,6)-1,d=+val.slice(6,8); return {date:new Date(y,m,d),allDay:true}; }
  const mt=val.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if(!mt)return null;
  const [_,Y,Mo,D,H,Mi,S,Z]=mt;
  if(Z){ return {date:new Date(Date.UTC(+Y,+Mo-1,+D,+H,+Mi,+S)),allDay:false}; }
  return {date:new Date(+Y,+Mo-1,+D,+H,+Mi,+S),allDay:false}; // hora local (aprox, sin TZID estricto)
}
function parseIcs(text,calIdx){
  const out=[]; const lines=unfold(text).split("\n");
  let cur=null;
  for(const ln of lines){
    if(ln==="BEGIN:VEVENT"){ cur={}; continue; }
    if(ln==="END:VEVENT"){ if(cur&&cur.start){ out.push(finishEvent(cur,calIdx)); } cur=null; continue; }
    if(!cur)continue;
    const ci=ln.indexOf(":"); if(ci<0)continue;
    let key=ln.slice(0,ci), val=ln.slice(ci+1);
    const semi=key.indexOf(";"); let params={};
    if(semi>=0){ key.slice(semi+1).split(";").forEach(kv=>{ const [k,v]=kv.split("="); params[k]=v; }); key=key.slice(0,semi); }
    key=key.toUpperCase();
    if(key==="SUMMARY")cur.summary=icsUnescape(val);
    else if(key==="LOCATION")cur.location=icsUnescape(val);
    else if(key==="DTSTART")cur.start=parseIcsDate(val,params);
    else if(key==="DTEND")cur.end=parseIcsDate(val,params);
    else if(key==="RRULE")cur.rrule=val;
  }
  return out;
}
function finishEvent(cur,calIdx){
  return { title:cur.summary||"(sin título)", loc:cur.location||"", start:cur.start.date, end:cur.end?cur.end.date:cur.start.date, allDay:cur.start.allDay, rrule:cur.rrule||"", cal:calIdx };
}
// Expande recurrencias simples (DAILY/WEEKLY/MONTHLY, sin excepciones) dentro del rango visible.
function expandRecurring(ev,rangeStart,rangeEnd){
  if(!ev.rrule) return withinRange(ev,rangeStart,rangeEnd)?[ev]:[];
  const p={}; ev.rrule.split(";").forEach(kv=>{ const[k,v]=kv.split("="); p[k]=v; });
  const freq=p.FREQ; if(!["DAILY","WEEKLY","MONTHLY"].includes(freq)) return withinRange(ev,rangeStart,rangeEnd)?[ev]:[];
  const interval=Math.max(1,+(p.INTERVAL||1));
  const until=p.UNTIL?parseIcsDate(p.UNTIL.replace(/Z$/,"Z"),{})?.date:null;
  const count=p.COUNT?+p.COUNT:null;
  const dur=ev.end-ev.start;
  const out=[]; let d=new Date(ev.start); let n=0; let guard=0;
  while(guard++<800){
    if(d>rangeEnd)break;
    if(until&&d>until)break;
    if(count&&n>=count)break;
    if(d>=rangeStart && d<=rangeEnd){ out.push({...ev,start:new Date(d),end:new Date(d.getTime()+dur),rrule:""}); }
    n++;
    if(freq==="DAILY")d.setDate(d.getDate()+interval);
    else if(freq==="WEEKLY")d.setDate(d.getDate()+7*interval);
    else d.setMonth(d.getMonth()+interval);
  }
  return out;
}
function withinRange(ev,a,b){ return ev.end>=a && ev.start<=b; }
async function loadCalendar(force){
  if(!state.calUrls.length){ state.calEvents=[]; state.calLoaded=true; return; }
  if(state.calLoading)return;
  state.calLoading=true; state.calError=""; if(state.view==='calendario')paintCalendar();
  const all=[];
  try{
    for(let i=0;i<state.calUrls.length;i++){
      const u=state.calUrls[i]; if(!u.trim())continue;
      const res=await fetch(ICS_PROXY,{ method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({url:u.trim()}) });
      if(!res.ok){ let msg="Error "+res.status; try{ const j=await res.json(); if(j.error)msg=j.error; }catch{} throw new Error(msg); }
      const txt=await res.text();
      all.push(...parseIcs(txt,i));
    }
    state.calEvents=all; state.calLoaded=true;
  }catch(e){
    state.calError=String(e.message||e);
  }finally{
    state.calLoading=false; if(state.view==='calendario')paintCalendar();
  }
}
const CAL_COLORS=["#185FA5","#0F6E56","#993556","#BA7517","#534AB7"];
function calColor(i){ return CAL_COLORS[i%CAL_COLORS.length]; }
function hhmm(d){ return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"); }
const LAYERS=[
  {key:"bloques",     label:"Bloques del día", color:"#534AB7"},
  {key:"reuniones",   label:"Reuniones",       color:"#993556"},
  {key:"vencimientos",label:"Vencimientos",    color:"#BA7517"},
  {key:"tareas",      label:"Tareas c/fecha",  color:"#1D9E75"},
  {key:"eventos",     label:"Eventos propios", color:"#0C447C"},
  {key:"google",      label:"Google Calendar", color:"#185FA5"},
];
function layerMeta(k){ return LAYERS.find(l=>l.key===k)||{color:"#888",label:k}; }
function dOnly(dstr){ return new Date(dstr+"T00:00"); }
// Reúne todas las capas activas en un rango, como items normalizados.
function calItems(a,b){
  const L=state.calLayers; const out=[];
  const push=(dstr,o)=>{ if(!dstr)return; const d=dOnly(dstr); if(d<a||d>b)return; out.push({date:d,key:dstr,allDay:!o.time,...o}); };
  if(L.bloques) state.bloques.forEach(bl=>{ if(bl.fecha){ const n=(bl.tareas||[]).length; push(bl.fecha,{layer:"bloques",color:"#534AB7",time:bl.inicio||"",title:(bl.nombre||"Bloque")+(n?` · ${n} tarea${n===1?'':'s'}`:""),ref:{t:"bloque",id:bl.id}}); } });
  if(L.reuniones) state.reuniones.forEach(r=>{ if(r.fecha)push(r.fecha,{layer:"reuniones",color:"#993556",time:"",title:r.titulo||"Reunión",ref:{t:"reu",id:r.id,area:r.area}}); if(r.proxima)push(r.proxima,{layer:"reuniones",color:"#C4708D",time:"",title:"Próx: "+(r.titulo||"Reunión"),ref:{t:"reu",id:r.id,area:r.area}}); });
  if(L.vencimientos) state.vencimientos.forEach(v=>{ if(v.due&&v.status!=='ok')push(v.due,{layer:"vencimientos",color:"#BA7517",time:"",title:"Vence: "+(v.concepto||"—"),ref:{t:"venc",id:v.id,area:v.area}}); });
  if(L.tareas) state.tasks.forEach(t=>{ if(t.due&&!["comp","desc"].includes(t.status))push(t.due,{layer:"tareas",color:"#1D9E75",time:"",title:t.title||"Tarea",ref:{t:"task",id:t.id}}); });
  if(L.eventos) state.eventos.forEach(e=>{ if(e.fecha)push(e.fecha,{layer:"eventos",color:e.color||"#0C447C",time:e.inicio||"",title:e.titulo||"Evento",ref:{t:"evt",id:e.id}}); });
  if(L.google) state.calEvents.forEach(ev=>{ expandRecurring(ev,a,b).forEach(x=>{ out.push({date:new Date(x.start.getFullYear(),x.start.getMonth(),x.start.getDate()),key:ymd(x.start),allDay:x.allDay,layer:"google",color:"#185FA5",time:x.allDay?"":hhmm(x.start),title:x.title,loc:x.loc||"",ref:{t:"google"}}); }); });
  return out.sort((x,y)=>{ if(x.date-y.date)return x.date-y.date; const xt=x.time||"99:99", yt=y.time||"99:99"; return xt<yt?-1:(xt>yt?1:0); });
}
function itemsByDay(a,b){ const m={}; calItems(a,b).forEach(it=>{ (m[ymd(it.date)]=m[ymd(it.date)]||[]).push(it); }); return m; }
function viewCalendario(){
  if(state.calEditing) return calConnectHTML();
  if(state.calLayers.google && state.calUrls.length && !state.calLoaded && !state.calLoading){ setTimeout(()=>loadCalendar(),0); }
  const seg=`<div class="seg">${[["mes","Mes"],["semana","Semana"],["agenda","Agenda"]].map(v=>`<button class="${state.calView===v[0]?'on':''}" data-act="calView" data-id="${v[0]}">${v[1]}</button>`).join("")}</div>`;
  const nav=`<button class="btn-ghost" data-act="calNav" data-id="prev">‹</button><button class="btn-ghost" data-act="calNav" data-id="today">Hoy</button><button class="btn-ghost" data-act="calNav" data-id="next">›</button>`;
  const toolbar=`<div class="toolbar">${seg}<div class="spacer"></div><span id="calTitle" style="font-size:1.02em;font-weight:600;text-transform:capitalize;margin-right:6px"></span>${nav}<button class="btn-primary" data-act="evtNew">＋ Evento</button>${state.calLayers.google?`<button class="btn-ghost" data-act="calRefresh" title="Actualizar desde Google">⟳</button>`:''}<button class="btn-ghost" data-act="calSettings" title="Conectar Google">⚙</button></div>`;
  return `${toolbar}${calLayerBar()}<div id="calArea"></div>`;
}
function calLayerBar(){
  return `<div class="cal-layers">${LAYERS.map(l=>{
    const on=state.calLayers[l.key]!==false;
    const isG=l.key==="google";
    const lab=isG&&!state.calUrls.length?l.label+" (sin conectar)":l.label;
    return `<button class="cal-lchip ${on?'on':''}" data-act="calLayer" data-id="${l.key}" style="--lc:${l.color}"><span class="cal-ldot"></span>${esc(lab)}</button>`;
  }).join("")}</div>`;
}
function calConnectHTML(){
  return `<div class="scard" style="max-width:560px;margin:20px auto">
    ${state.calUrls.length?'<button class="btn-ghost" data-act="calCancelEdit" style="margin-bottom:12px">← Volver al calendario</button>':''}
    <h3 style="font-size:1em;color:var(--tx);text-transform:none;letter-spacing:0;margin:0 0 6px">Conectar Google Calendar</h3>
    <p style="font-size:.86em;color:var(--tx-dim);margin:0 0 14px">Pegá la <b>dirección secreta en formato iCal</b> de tu calendario de Google (una por línea si tenés varios). La encontrás en Google Calendar → Configuración del calendario → Integrar calendario → “Dirección secreta en formato iCal”. Es opcional: el calendario funciona igual con tus datos internos.</p>
    <textarea id="calUrlInput" class="m-detail" placeholder="https://calendar.google.com/calendar/ical/…/basic.ics" style="min-height:90px">${esc(state.calUrls.join("\n"))}</textarea>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">
      ${state.calUrls.length?`<button class="btn-ghost" data-act="calCancelEdit">Cancelar</button>`:''}
      <button class="btn-primary" data-act="calSave">Guardar y conectar</button>
    </div>
  </div>`;
}
function paintCalendar(){
  const area=$("#calArea"); if(!area)return;
  const tEl=$("#calTitle");
  if(state.calLayers.google && state.calLoading){ area.innerHTML=`<div class="table-wrap"><div class="empty" style="padding:30px">Cargando eventos de Google…</div></div>`; return; }
  if(state.calLayers.google && state.calError){ area.innerHTML=`<div class="cal-err">No se pudieron traer los eventos de Google: ${esc(state.calError)} <button class="btn-ghost" data-act="calRefresh">Reintentar</button> <button class="btn-ghost" data-act="calSettings">Revisar</button></div>`; }
  else if(area.querySelector(".cal-err")){ area.innerHTML=""; }
  const errBanner=(state.calLayers.google&&state.calError)?`<div class="cal-err">Google: ${esc(state.calError)} <button class="btn-ghost" data-act="calRefresh">Reintentar</button></div>`:"";
  if(state.calView==="mes"){ if(tEl)tEl.textContent=monthTitle(calCursorDate()); area.innerHTML=errBanner+calMonthHTML()+calDayPanel(); }
  else if(state.calView==="semana"){ if(tEl)tEl.textContent=weekTitle(calCursorDate()); area.innerHTML=errBanner+calWeekHTML()+calDayPanel(); }
  else { if(tEl)tEl.textContent=""; area.innerHTML=errBanner+calAgendaHTML(); }
  bindContentArea(area);
}
function bindContentArea(area){ area.querySelectorAll("[data-act]").forEach(el=>{ const h=ACTIONS[el.dataset.act]; if(!h)return; const ev=el.dataset.ev||(el.tagName==="SELECT"||el.tagName==="INPUT"||el.tagName==="TEXTAREA"?"change":"click"); el["on"+ev]=e=>h(el,e); }); }
const MESES=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const DIAS=["lun","mar","mié","jue","vie","sáb","dom"];
function monthTitle(d){ return MESES[d.getMonth()]+" "+d.getFullYear(); }
function weekTitle(d){ const s=weekStart(d); const e=new Date(s); e.setDate(e.getDate()+6); return `${s.getDate()} ${MESES[s.getMonth()].slice(0,3)} – ${e.getDate()} ${MESES[e.getMonth()].slice(0,3)}`; }
function weekStart(d){ const x=new Date(d); const dow=(x.getDay()+6)%7; x.setDate(x.getDate()-dow); x.setHours(0,0,0,0); return x; }
function evChip(it){
  const t=it.allDay?"":(it.time?it.time+" ":"");
  return `<div class="cal-ev" style="--ec:${it.color}" title="${esc((t||'')+it.title)}"><span class="cal-ev-t">${esc(t)}${esc(it.title)}</span></div>`;
}
function calMonthHTML(){
  const cur=calCursorDate();
  const first=new Date(cur.getFullYear(),cur.getMonth(),1);
  const gridStart=weekStart(first);
  const gridEnd=new Date(gridStart); gridEnd.setDate(gridEnd.getDate()+41); gridEnd.setHours(23,59,59);
  const byDay=itemsByDay(gridStart,gridEnd);
  const t0=ymd(calToday());
  let cells="";
  for(let i=0;i<42;i++){
    const d=new Date(gridStart); d.setDate(d.getDate()+i);
    const k=ymd(d); const inMonth=d.getMonth()===cur.getMonth(); const isToday=k===t0; const isSel=k===state.calDaySel;
    const dayEvs=(byDay[k]||[]);
    const shown=dayEvs.slice(0,3).map(evChip).join("");
    const more=dayEvs.length>3?`<div class="cal-more">+${dayEvs.length-3} más</div>`:"";
    cells+=`<div class="cal-cell${inMonth?'':' out'}${isToday?' today':''}${isSel?' sel':''}" data-act="calDay" data-id="${k}"><div class="cal-daynum">${d.getDate()}</div>${shown}${more}</div>`;
  }
  const heads=DIAS.map(x=>`<div class="cal-dh">${x}</div>`).join("");
  return `<div class="cal-month"><div class="cal-heads">${heads}</div><div class="cal-grid">${cells}</div></div>`;
}
function calWeekHTML(){
  const s=weekStart(calCursorDate());
  const e=new Date(s); e.setDate(e.getDate()+7);
  const byDay=itemsByDay(s,e);
  const t0=ymd(calToday());
  let cols="";
  for(let i=0;i<7;i++){
    const d=new Date(s); d.setDate(d.getDate()+i); const k=ymd(d);
    const dayEvs=byDay[k]||[];
    const items=dayEvs.length?dayEvs.map(evChip).join(""):`<div class="cal-empty-day">—</div>`;
    cols+=`<div class="cal-wcol${k===t0?' today':''}${k===state.calDaySel?' sel':''}" data-act="calDay" data-id="${k}"><div class="cal-wh">${DIAS[i]} ${d.getDate()}</div><div class="cal-wbody">${items}</div></div>`;
  }
  return `<div class="cal-week">${cols}</div>`;
}
function calAgendaHTML(){
  const s=calToday(); const e=new Date(s); e.setDate(e.getDate()+30);
  const byDay=itemsByDay(s,e);
  const keys=Object.keys(byDay).sort();
  if(!keys.length) return `<div class="table-wrap"><div class="empty" style="padding:28px">No hay nada agendado en los próximos 30 días.</div></div>`;
  const rows=keys.map(k=>{
    const d=new Date(k+"T00:00");
    const items=byDay[k].map(it=>`<div class="cal-ag-ev" ${it.ref?`data-act="calGo" data-t="${it.ref.t}" data-id="${it.ref.id||''}" data-area="${it.ref.area||''}"`:''}><span class="cal-ag-time">${it.allDay?'—':it.time}</span><span class="cal-ev-dot" style="--ec:${it.color}"></span><span class="cal-ag-t">${esc(it.title)}</span><span class="cal-ag-layer">${layerMeta(it.layer).label}</span></div>`).join("");
    return `<div class="cal-ag-day"><div class="cal-ag-date">${DIAS[(d.getDay()+6)%7]} ${d.getDate()} ${MESES[d.getMonth()].slice(0,3)}</div><div class="cal-ag-list">${items}</div></div>`;
  }).join("");
  return `<div class="cal-agenda">${rows}</div>`;
}
function calDayPanel(){
  if(!state.calDaySel)return "";
  const d=dOnly(state.calDaySel);
  const items=(itemsByDay(d,d)[state.calDaySel]||[]);
  const title=`${DIAS[(d.getDay()+6)%7]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
  const rows=items.length?items.map(it=>`<div class="cal-dp-ev" ${it.ref?`data-act="calGo" data-t="${it.ref.t}" data-id="${it.ref.id||''}" data-area="${it.ref.area||''}"`:''}>
      <span class="cal-ev-dot" style="--ec:${it.color}"></span>
      <span class="cal-dp-time">${it.allDay?'todo el día':it.time}</span>
      <span class="cal-dp-t">${esc(it.title)}</span>
      <span class="cal-dp-layer">${layerMeta(it.layer).label}</span>
    </div>`).join(""):`<p style="color:var(--tx-faint);font-size:.86em;margin:6px 0">Nada agendado este día.</p>`;
  return `<div class="cal-daypanel">
    <div class="cal-dp-head"><span style="font-weight:600;text-transform:capitalize">${title}</span><div class="spacer"></div><button class="btn-primary" data-act="evtNew" data-id="${state.calDaySel}">＋ Evento este día</button><button class="cal-dp-x" data-act="calDayClose">✕</button></div>
    <div class="cal-dp-list">${rows}</div>
  </div>`;
}
function openEventoEditor(id){
  const e=id?getEvento(id):null;
  const isNew=!e;
  const ev=e||{id:crypto.randomUUID(),fecha:state.calDaySel||today(),inicio:"",fin:"",titulo:"",nota:"",color:"#0C447C"};
  const COLS=["#0C447C","#0F6E56","#993556","#BA7517","#534AB7","#5F5E5A"];
  state.evtSel=ev.id; state._evtDraft=ev; state._evtNew=isNew;
  const swatches=COLS.map(c=>`<button class="evt-sw ${ev.color===c?'on':''}" data-act="evtColor" data-c="${c}" style="background:${c}"></button>`).join("");
  openHtmlModal(`<div class="m-head"><h3>${isNew?'Nuevo evento':'Editar evento'}</h3><button class="m-x" data-act="evtClose">✕</button></div>
    <div class="m-body">
      <div class="m-field"><label>Título</label><input id="evt_tit" value="${esc(ev.titulo)}" data-act="evtF" data-f="titulo" placeholder="Ej. Almuerzo con proveedor"></div>
      <div class="m-grid" style="grid-template-columns:1fr 110px 110px;margin-top:11px">
        <div class="m-field"><label>Fecha</label><input id="evt_fec" type="date" value="${esc(ev.fecha)}" data-act="evtF" data-f="fecha"></div>
        <div class="m-field"><label>Desde (opc.)</label><input id="evt_ini" type="time" value="${esc(ev.inicio)}" data-act="evtF" data-f="inicio"></div>
        <div class="m-field"><label>Hasta (opc.)</label><input id="evt_fin" type="time" value="${esc(ev.fin)}" data-act="evtF" data-f="fin"></div>
      </div>
      <div class="m-field" style="margin-top:11px"><label>Nota</label><textarea id="evt_nota" class="m-detail" data-act="evtF" data-f="nota" placeholder="Detalle opcional">${esc(ev.nota)}</textarea></div>
      <div class="m-field" style="margin-top:11px"><label>Color</label><div class="evt-sws">${swatches}</div></div>
      ${ev.fecha?`<a class="gcal-btn" style="margin-top:12px" href="${esc(gcalLink({title:ev.titulo||'Evento',dstr:ev.fecha,time:ev.inicio,details:ev.nota}))}" target="_blank" rel="noopener"><span class="gcal-ic">🗓</span>Agendar también en Google</a>`:''}
    </div>
    <div class="modal-foot">${isNew?'<span></span>':`<button class="link-danger" data-act="evtDel" data-id="${ev.id}">Eliminar</button>`}<button class="btn-primary" data-act="evtSave">Guardar</button></div>`);
}
function calShift(dir){
  const d=calCursorDate();
  if(dir==="today"){ state.calCursor=null; }
  else{ const s=dir==="next"?1:-1;
    if(state.calView==="mes")d.setMonth(d.getMonth()+s);
    else if(state.calView==="semana")d.setDate(d.getDate()+7*s);
    else d.setDate(d.getDate()+30*s);
    state.calCursor=ymd(d);
  }
  paintCalendar();
}

/* ---------- Mesa Ejecutiva ---------- */
function mesaReuniones(){ return state.reuniones.filter(r=>r.area==='mesa'); }
function compAbierto(c){ return !c.done && (c.t||"").trim(); }
function compVencido(c){ return compAbierto(c) && c.due && c.due < today(); }
function mesaOpenComps(){
  const out=[];
  mesaReuniones().forEach(r=>(r.compromisos||[]).forEach((c,i)=>{ if(compAbierto(c)) out.push({r,c,i}); }));
  return out.sort((a,b)=>{ const ad=a.c.due||"9999-99-99", bd=b.c.due||"9999-99-99"; return ad<bd?-1:(ad>bd?1:0); });
}
function partList(r){ return (r.participantes||"").split(",").map(s=>s.trim()).filter(Boolean); }
function viewMesa(){
  if(state.reuSel && getReu(state.reuSel) && getReu(state.reuSel).area==='mesa') return mesaEditor(getReu(state.reuSel));
  const abiertos=mesaOpenComps();
  const venc=abiertos.filter(x=>compVencido(x.c)).length;
  const pendTemas=mesaReuniones().filter(r=>(r.pend||"").trim()).length;
  const tabs=`<div class="seg"><button class="${state.mesaTab==='reuniones'?'on':''}" data-act="mesaTab" data-id="reuniones">▤ Reuniones</button><button class="${state.mesaTab==='comp'?'on':''}" data-act="mesaTab" data-id="comp">☑ Compromisos abiertos${abiertos.length?` (${abiertos.length})`:''}</button></div>`;
  const head=`<div class="mesa-head">
    <div><p class="mh-t">Mesa Ejecutiva</p>
    <p class="mh-s"><b>${abiertos.length}</b> compromiso${abiertos.length===1?'':'s'} abierto${abiertos.length===1?'':'s'}${venc?` · <b style="color:var(--st-urg)">${venc}</b> vencido${venc===1?'':'s'}`:''}${pendTemas?` · <b>${pendTemas}</b> reunión${pendTemas===1?'':'es'} con temas para la próxima`:''}</p></div>
  </div>`;
  if(state.mesaTab==='comp') return `${head}<div class="toolbar">${tabs}</div>${mesaCompsView(abiertos)}`;
  const fs=foros();
  const chips=`<div class="mesa-chips"><button class="mchip ${!state.mesaFiltro?'on':''}" data-act="mesaFiltro" data-id="">Todas</button>${fs.map(f=>`<button class="mchip ${state.mesaFiltro===f.id?'on':''}" data-act="mesaFiltro" data-id="${esc(f.id)}" style="--mc:${f.col}">${esc(f.label)}</button>`).join("")}</div>`;
  let list=mesaReuniones();
  if(state.mesaFiltro) list=list.filter(r=>r.tipo===state.mesaFiltro);
  list=list.sort((a,b)=>(a.fecha||'')<(b.fecha||'')?1:-1);
  const nuevo=`<div class="spacer"></div><select class="inp" id="mesaNewTipo" style="width:auto">${fs.map(f=>`<option value="${esc(f.id)}">${esc(f.label)}</option>`).join("")}</select><button class="btn-primary" data-act="mesaNew">＋ Nueva reunión</button>`;
  const rows=list.map(r=>{
    const f=foroById(r.tipo); const col=f?f.col:"#888780";
    const comps=r.compromisos||[]; const ab=comps.filter(compAbierto).length; const vz=comps.filter(compVencido).length;
    const badge=vz?`<span class="mbadge red">${vz} vencido${vz===1?'':'s'}</span>`:(ab?`<span class="mbadge amber">${ab} abierto${ab===1?'':'s'}</span>`:`<span class="mbadge green">cerrada</span>`);
    return `<button class="mesa-row" data-act="reuOpen" data-id="${r.id}" style="border-left-color:${col}">
      <div class="mr-main">
        <span class="mr-tipo" style="color:${col}">${esc(f?f.label:'—')}</span>
        <span class="mr-tit">${esc(r.titulo||'(sin título)')}</span>
      </div>
      <span class="mr-part">${partList(r).length?esc(partList(r).join(", ")):'<span style="color:var(--tx-faint)">sin participantes</span>'}</span>
      <span class="mr-date">${r.fecha?fmt(r.fecha):'—'}</span>
      ${badge}
    </button>`;
  }).join("");
  const body=list.length?`<div class="mesa-list">${rows}</div>`:`<div class="table-wrap"><div class="empty" style="padding:28px">No hay reuniones registradas${state.mesaFiltro?' en este foro':''}. Creá la primera.</div></div>`;
  return `${head}<div class="toolbar">${tabs}${nuevo}</div>${chips}${body}`;
}
function mesaCompsView(abiertos){
  if(!abiertos.length) return `<div class="table-wrap"><div class="empty" style="padding:28px">No hay compromisos abiertos. Todo cerrado.</div></div>`;
  const rows=abiertos.map(({r,c,i})=>{
    const f=foroById(r.tipo); const col=f?f.col:"#888780";
    const vz=compVencido(c);
    const due=c.due?`<span class="mbadge ${vz?'red':'gray'}">${fmt(c.due)}</span>`:`<span style="color:var(--tx-faint);font-size:.8em">sin fecha</span>`;
    return `<tr>
      <td><span class="mr-tipo" style="color:${col}">${esc(f?f.label:'—')}</span></td>
      <td><button class="task-title" data-act="reuOpen" data-id="${r.id}">${esc(c.t)}</button></td>
      <td>${c.resp?esc(c.resp):'<span style="color:var(--tx-faint)">—</span>'}</td>
      <td>${due}</td>
      <td class="date" style="white-space:nowrap">${r.fecha?fmt(r.fecha):'—'}</td>
    </tr>`;
  }).join("");
  return `<div class="table-wrap"><table class="tasks" style="min-width:720px"><thead><tr><th>Foro</th><th>Compromiso</th><th>Responsable</th><th>Vence</th><th>Reunión</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function mesaEditor(r){
  const fs=foros();
  const sel=new Set(partList(r));
  const people=state.responsables||[];
  const chips=people.length?people.map(p=>`<button class="pchip ${sel.has(p)?'on':''}" data-act="mesaPart" data-p="${esc(p)}">${esc(p)}</button>`).join(""):'<span style="color:var(--tx-faint);font-size:.84em">No hay responsables cargados. Agregalos en Configuración.</span>';
  const comps=(r.compromisos||[]).map((c,i)=>{
    const vz=compVencido(c);
    const mine=c.resp && MY_NAMES.some(n=>c.resp.toLowerCase().includes(n));
    return `<div class="mcomp ${c.done?'done':''}">
      <input type="checkbox" ${c.done?'checked':''} data-act="reuCompChk" data-i="${i}">
      <input class="mc-t" value="${esc(c.t)}" data-act="reuCompTxt" data-i="${i}" placeholder="Compromiso…">
      <select class="mc-r" data-act="mesaCompResp" data-i="${i}"><option value="">— responsable —</option>${people.map(p=>`<option ${c.resp===p?'selected':''}>${esc(p)}</option>`).join("")}</select>
      <input class="mc-d ${vz?'over':''}" type="date" value="${esc(c.due||'')}" data-act="mesaCompDue" data-i="${i}" title="Vencimiento">
      ${mine?`<button class="btn-ghost mc-task" data-act="reuCompTask" data-i="${i}" title="Crear tarea en Seguimiento">${c.taskId?'✓ tarea':'＋ tarea'}</button>`:`<span class="mc-note" title="Solo se crean tareas de tus propios compromisos">—</span>`}
      <button class="del" data-act="reuCompDel" data-i="${i}" style="opacity:1">🗑</button>
    </div>`;
  }).join("");
  const nD=(r.compromisos||[]).filter(c=>c.done).length, nC=(r.compromisos||[]).length;
  return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><button class="btn-ghost" data-act="mesaBack">← Volver a Mesa Ejecutiva</button><div class="spacer"></div>${gcalBtn({title:r.titulo||(foroById(r.tipo)||{}).label||"Reunión",dstr:r.fecha,details:(r.temas?"Temas: "+r.temas:"")+(r.participantes?"\nParticipantes: "+r.participantes:"")},"Agendar esta reunión")}</div>
  <div class="scard">
    <div class="m-grid" style="grid-template-columns:170px 1fr 170px">
      <div class="m-field"><label>Foro</label><select id="reu_tipo" data-act="reuF" data-f="tipo">${fs.map(f=>`<option value="${esc(f.id)}" ${r.tipo===f.id?'selected':''}>${esc(f.label)}</option>`).join("")}</select></div>
      <div class="m-field"><label>Título / motivo</label><input id="reu_titulo" value="${esc(r.titulo)}" data-act="reuF" data-f="titulo" placeholder="Ej. Mesa semana 27"></div>
      <div class="m-field"><label>Fecha</label><input id="reu_fecha" type="date" value="${esc(r.fecha)}" data-act="reuF" data-f="fecha"></div>
    </div>
    <div class="m-field" style="margin-top:11px"><label>Participantes</label><div class="pchips">${chips}</div><input type="hidden" id="reu_part" value="${esc(r.participantes)}"></div>
    <div class="m-field" style="margin-top:11px"><label>Temas tratados</label><textarea id="reu_temas" class="m-detail" data-act="reuF" data-f="temas" placeholder="Orden del día / lo conversado">${esc(r.temas)}</textarea></div>
    <div class="m-field" style="margin-top:11px"><label>Decisiones</label><textarea id="reu_dec" class="m-detail" data-act="reuF" data-f="decisiones" placeholder="Qué se decidió (una por línea)">${esc(r.decisiones)}</textarea></div>

    <div style="margin-top:14px"><div class="m-block-h"><span>Compromisos</span><span class="sub-prog">${nD}/${nC}</span></div>
      <div class="mcomps">${comps||'<p style="color:var(--tx-faint);font-size:.84em;margin:0">Sin compromisos. Agregá abajo.</p>'}</div>
      <div class="sub-add"><input id="reu_newcomp" placeholder="Agregar compromiso y Enter…" data-act="reuCompAdd" data-ev="keydown"></div>
      <p style="color:var(--tx-faint);font-size:.78em;margin:6px 0 0">Solo los compromisos a tu nombre pueden convertirse en tarea de Seguimiento.</p></div>

    <div class="m-field" style="margin-top:14px"><label>Para la próxima reunión</label><textarea id="reu_pend" class="m-detail" data-act="reuF" data-f="pend" placeholder="Temas que quedaron pendientes">${esc(r.pend||'')}</textarea></div>

    <div style="margin-top:14px"><div class="m-block-h"><span>Referencias (links)</span></div>
      <div class="subs">${(r.urls||[]).map((u,i)=>`<div class="sub"><span style="font-size:.95em">🔗</span><a class="sx" href="${esc(u.url)}" target="_blank" style="color:var(--accent);text-decoration:underline;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(u.label||u.url)}</a><button class="del" data-act="reuUrlDel" data-i="${i}" style="opacity:1">🗑</button></div>`).join("")||'<p style="color:var(--tx-faint);font-size:.84em;margin:0">Sin links.</p>'}</div>
      <div class="sub-add"><input id="reu_newurl" placeholder="Pegá una URL y Enter…" data-act="reuUrlAdd" data-ev="keydown"></div></div>

    <div style="margin-top:14px"><div class="m-block-h"><span>Adjuntos (acta, minuta, PDF…)</span></div>
      <div class="attach-row" style="flex-wrap:wrap">${(r.archivos||[]).map((f,i)=>`<span class="file-pill">📎 <button class="lnk" data-act="reuFileOpen" data-i="${i}" style="border:0;background:none;color:var(--accent);cursor:pointer;font:inherit;padding:0;text-decoration:underline">${esc(f.name)}</button> <button class="del" data-act="reuFileDel" data-i="${i}" style="opacity:1">✕</button></span>`).join("")}<label class="btn-ghost" style="cursor:pointer">＋ Subir archivo<input type="file" id="reu_file" data-act="reuFileUp" style="display:none" accept=".pdf,.xlsx,.xls,.doc,.docx,image/*"></label><span id="reu_busy" style="font-size:.8em;color:var(--tx-faint);display:none">Subiendo…</span></div></div>

    <div style="display:flex;align-items:flex-end;gap:10px;margin-top:14px"><div class="m-field" style="max-width:200px;margin:0"><label>Próxima reunión</label><input id="reu_prox" type="date" value="${esc(r.proxima)}" data-act="reuF" data-f="proxima"></div>${r.proxima?gcalBtn({title:"Seguimiento: "+(r.titulo||(foroById(r.tipo)||{}).label||"Reunión"),dstr:r.proxima,details:r.pend?"Para tratar: "+r.pend:""},"Agendar próxima"):''}</div>
    <div class="modal-foot" style="margin:16px -18px -16px;border-radius:0"><button class="link-danger" data-act="reuDel" data-id="${r.id}">Eliminar reunión</button><button class="btn-primary" data-act="mesaBack">Listo</button></div>
  </div>`;
}
const MY_NAMES=["alejandro","alejandro gomez","alejandro gómez"];
function readMesaForm(r){
  const g=id=>{const e=$("#"+id);return e?e.value:undefined;};
  const map={reu_tipo:'tipo',reu_titulo:'titulo',reu_fecha:'fecha',reu_part:'participantes',reu_temas:'temas',reu_dec:'decisiones',reu_pend:'pend',reu_prox:'proxima'};
  for(const[el,fld] of Object.entries(map)){ const v=g(el); if(v!==undefined)r[fld]=v; }
}
function addMesaReunion(){
  const sel=$("#mesaNewTipo"); const tipo=sel?sel.value:(foros()[0]||{}).id;
  // arrastra temas pendientes de la última reunión del mismo foro
  const prev=mesaReuniones().filter(x=>x.tipo===tipo).sort((a,b)=>(a.fecha||'')<(b.fecha||'')?1:-1)[0];
  const temas=prev&&(prev.pend||"").trim()?prev.pend.trim():"";
  const f=foroById(tipo);
  const r={id:crypto.randomUUID(),area:"mesa",tipo,fecha:today(),titulo:f?f.label:"",participantes:"",temas,decisiones:"",pend:"",compromisos:[],urls:[],archivos:[],proxima:""};
  state.reuniones.unshift(r); saveReuNow(r.id); state.reuSel=r.id; render();
  if(temas)toast("Se cargaron los temas pendientes de la reunión anterior.");
}
function mesaTogglePart(name){
  const r=getReu(state.reuSel); if(!r)return;
  readMesaForm(r);
  const cur=partList(r); const i=cur.indexOf(name);
  if(i>=0)cur.splice(i,1); else cur.push(name);
  r.participantes=cur.join(", ");
  scheduleSaveReu(r.id); render();
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
    syncHallazgosToTasks(state.cal.hallazgos);
  }catch(e){ state.calError=(e&&e.message)||String(e); }
  state.calLoading=false; render();
}
/* ---------- Autocreación de tareas de Seguimiento a partir de hallazgos de Calidad ---------- */
function hallazgoMarker(hid){ return "[[hallazgo:"+hid+"]]"; }
function hallazgoTaskExists(hid){ const mk=hallazgoMarker(hid); return state.tasks.some(t=>t.detail&&t.detail.indexOf(mk)>=0); }
function syncHallazgosToTasks(list){
  // solo hallazgos abiertos o en tratamiento (mismo criterio que la exportación a PDF)
  const abiertos=(list||[]).filter(r=>{ const s=(r.estado||"").toLowerCase(); return !/cerr|complet|finaliz|resuelt|descart|anul|cancel/.test(s); });
  let creadas=0;
  abiertos.forEach(r=>{
    if(!r.id || hallazgoTaskExists(r.id)) return;
    const sev=(r.severidad||"").toLowerCase(), est=(r.estado||"").toLowerCase();
    const status = /alt|crit|may/.test(sev) ? "urg" : (/proc|curso|tratamiento/.test(est) ? "proc" : "sin");
    const detail=[
      hallazgoMarker(r.id),
      "Hallazgo del Sistema de Calidad (creado automáticamente).",
      r.area?("Área del hallazgo: "+r.area):"",
      r.severidad?("Severidad: "+r.severidad):"",
      r.estado?("Estado: "+r.estado):"",
      r.fecha_deteccion?("Fecha de detección: "+fmt(r.fecha_deteccion)):""
    ].filter(Boolean).join("\n");
    const t={id:crypto.randomUUID(),n:state.seq++,created:today(),title:"Hallazgo: "+(r.resumen||"Sin resumen"),status,due:"",area:"Calidad",resp:r.responsable||"",obj:"",url:"",file:null,detail,recur:"",subs:[]};
    state.tasks.push(t); saveTaskNow(t.id);
    creadas++;
  });
  if(creadas>0){ toast(creadas===1?"Se creó 1 tarea nueva desde un hallazgo de Calidad.":("Se crearon "+creadas+" tareas nuevas desde hallazgos de Calidad.")); }
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
  return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><span style="font-size:.82em;color:var(--tx-faint)">Datos en vivo desde tu app de Calidad · solo lectura (se editan en esa app).</span><div style="flex:1"></div><button class="btn-ghost" data-act="calExportPdf" title="Descargar hallazgos abiertos y en tratamiento en PDF">⬇ PDF hallazgos</button><button class="btn-ghost" data-act="calReload">↻ Actualizar</button></div>
    ${block("Hallazgos sin cerrar",H.length,"<th>Detección</th><th>Área</th><th>Resumen</th><th>Severidad</th><th>Estado</th><th>Responsable</th>",hRows,"Sin hallazgos abiertos.")}
    ${block("Mejoras en curso",M.length,"<th>Fecha</th><th>Área</th><th>Mejora</th><th>Estado</th><th>Responsable</th>",mRows,"Sin mejoras pendientes.")}
    ${block("Procedimientos en revisión",P.length,"<th>Procedimiento</th><th>Área</th><th>Versión</th><th>Estado</th><th>Próx. revisión</th><th>Link</th>",pRows,"Sin procedimientos en revisión.")}`;
}
function exportHallazgosPdf(){
  const c=state.cal||{}; const all=c.hallazgos||[];
  // solo abiertos + en tratamiento (excluye cerrados / completados / finalizados / descartados / anulados)
  const H=all.filter(r=>{ const s=(r.estado||"").toLowerCase(); return !/cerr|complet|finaliz|resuelt|descart|anul|cancel/.test(s); });
  if(!H.length){ toast("No hay hallazgos abiertos o en tratamiento para exportar."); return; }
  H.sort((a,b)=>(a.fecha_deteccion||"").localeCompare(b.fecha_deteccion||""));
  const e=esc;
  const sevClass=s=>{ const t=(s||"").toLowerCase(); return /alt|crit|may/.test(t)?'sev-alta':/med|men/.test(t)?'sev-media':'sev-baja'; };
  const rows=H.map(r=>`<tr>
    <td class="nowrap">${r.fecha_deteccion?e(fmt(r.fecha_deteccion)):'—'}</td>
    <td>${r.area?e(r.area):'—'}</td>
    <td class="res">${e(r.resumen||'—')}</td>
    <td class="nowrap"><span class="sev ${sevClass(r.severidad)}">${e(r.severidad||'—')}</span></td>
    <td class="nowrap">${r.estado?e(r.estado):'—'}</td>
    <td class="nowrap">${r.responsable?e(r.responsable):'—'}</td>
  </tr>`).join("");
  const hoy=new Date().toLocaleDateString("es-AR",{day:"2-digit",month:"long",year:"numeric"});
  const html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Hallazgos sin cerrar</title>
<style>
  *{box-sizing:border-box;} body{font-family:-apple-system,"Segoe UI",Arial,sans-serif;color:#1f2430;margin:28px;line-height:1.4;}
  h1{font-size:19px;margin:0 0 2px;} .sub{color:#6b7280;font-size:12px;margin:0 0 18px;}
  table{width:100%;border-collapse:collapse;font-size:11px;}
  thead th{background:#eceefb;color:#1f2430;text-align:left;padding:7px 8px;border-bottom:2px solid #4c5bd4;font-size:10px;text-transform:uppercase;letter-spacing:.4px;}
  tbody td{padding:7px 8px;border-bottom:1px solid #e4e7eb;vertical-align:top;}
  tbody tr:nth-child(even){background:#fafbfc;}
  .nowrap{white-space:nowrap;} .res{max-width:380px;}
  .sev{display:inline-block;padding:1px 8px;border-radius:10px;font-size:10px;font-weight:600;}
  .sev-alta{background:#fdecec;color:#c2353a;} .sev-media{background:#fff4e5;color:#b26a00;} .sev-baja{background:#eef0f3;color:#6b7280;}
  tr{page-break-inside:avoid;}
  @media print{body{margin:12mm;} @page{margin:11mm;}}
</style></head><body>
<h1>Sistema de Calidad — Hallazgos sin cerrar</h1>
<p class="sub">Abiertos y en tratamiento · ${H.length} hallazgo${H.length===1?'':'s'} · Generado el ${e(hoy)}</p>
<table>
  <thead><tr><th>Detección</th><th>Área</th><th>Resumen</th><th>Severidad</th><th>Estado</th><th>Responsable</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<script>window.onload=function(){setTimeout(function(){window.print();},250);};<\/script>
</body></html>`;
  const w=window.open("","_blank");
  if(!w){ toast("Permití las ventanas emergentes para exportar el PDF."); return; }
  w.document.open(); w.document.write(html); w.document.close();
  toast("Se abrió la vista de impresión — elegí “Guardar como PDF”.");
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

/* ---------- Planificación Financiera ---------- */
function addFinPago(){ const p={id:crypto.randomUUID(),fecha:today(),concepto:(state.finConceptos&&state.finConceptos[0])||"",detalle:"",importeArs:0,tc:state.finTC||0,estado:"pend"}; state.finPagos.unshift(p); saveFinPagoNow(p.id); render(); }
function delFinPago(id){ state.finPagos=state.finPagos.filter(p=>p.id!==id); deleteFinPagoDb(id); render(); }
function finFiltered(){
  const f=state.finFilters;
  return state.finPagos.filter(p=>{
    if(f.concepto&&p.concepto!==f.concepto)return false;
    if(f.estado&&p.estado!==f.estado)return false;
    if(f.desde&&(!p.fecha||p.fecha<f.desde))return false;
    if(f.hasta&&(!p.fecha||p.fecha>f.hasta))return false;
    if(f.q&&!(p.detalle||"").toLowerCase().includes(f.q.toLowerCase()))return false;
    return true;
  });
}
function finGroupInfo(fecha,mode){
  if(!fecha) return {key:"zzz-sin",label:"Sin fecha"};
  if(mode==='mes'){ const ym=fecha.slice(0,7); const[y,m]=ym.split("-"); return {key:ym,label:Cap(MESES[+m-1])+" "+y}; }
  if(mode==='semana'){ const ws=weekStart(new Date(fecha+"T00:00")); const we=new Date(ws); we.setDate(we.getDate()+6); const key=ymd(ws); const label="Semana del "+ws.getDate()+" al "+we.getDate()+" "+Cap(MESES[we.getMonth()]).slice(0,3); return {key,label}; }
  const d=new Date(fecha+"T00:00"); return {key:fecha,label:Cap(DIAS[(d.getDay()+6)%7])+" "+d.getDate()+" "+Cap(MESES[d.getMonth()]).slice(0,3)};
}
function finTotals(list,mode){
  const map=new Map();
  list.forEach(p=>{
    const g=finGroupInfo(p.fecha,mode);
    if(!map.has(g.key))map.set(g.key,{key:g.key,label:g.label,ars:0,usd:0,n:0});
    const e=map.get(g.key);
    e.ars+=Number(p.importeArs)||0; e.usd+=finUsd(p); e.n++;
  });
  return [...map.values()].sort((a,b)=>a.key<b.key?-1:1);
}
function finRow(p){
  const st=pagoEstMeta(p.estado);
  const usd=finUsd(p);
  return `<tr>
    <td><input type="date" class="cell-edit" value="${esc(p.fecha)}" data-act="finF" data-id="${p.id}" data-f="fecha"></td>
    <td><select class="cell-edit" data-act="finF" data-id="${p.id}" data-f="concepto">${optionList(state.finConceptos,p.concepto,"— Elegir —")}</select></td>
    <td><input class="cell-edit" style="min-width:160px" value="${esc(p.detalle)}" placeholder="Detalle…" data-act="finF" data-id="${p.id}" data-f="detalle"></td>
    <td><input type="text" inputmode="decimal" class="cell-edit" style="text-align:right" value="${p.importeArs?('$ '+money(p.importeArs)):''}" placeholder="$ 0,00" data-act="finF" data-id="${p.id}" data-f="importeArs"></td>
    <td style="text-align:right;white-space:nowrap;color:var(--tx-dim)">${p.tc?money(p.tc):'—'}</td>
    <td style="text-align:right;white-space:nowrap">US$ ${money(usd)}</td>
    <td style="text-align:center"><select class="status-pill ${st.cls}" data-act="finF" data-id="${p.id}" data-f="estado">${PAGO_ESTADOS.map(s=>`<option value="${s.key}" ${s.key===p.estado?'selected':''}>${s.label}</option>`).join("")}</select></td>
    <td style="text-align:center"><button class="row-del" data-act="finDel" data-id="${p.id}">🗑</button></td>
  </tr>`;
}
function sectionFinanzas(){
  const f=state.finFilters;
  const list=finFiltered();
  const sorted=[...list].sort((a,b)=>(a.fecha||'9999-99-99')<(b.fecha||'9999-99-99')?-1:1);
  const rows=sorted.map(finRow).join("");
  const totalArs=list.reduce((s,p)=>s+(Number(p.importeArs)||0),0);
  const totalUsd=list.reduce((s,p)=>s+finUsd(p),0);
  const groupSeg=`<div class="seg"><button class="${state.finGroup==='dia'?'on':''}" data-act="finGroup" data-id="dia">Día</button><button class="${state.finGroup==='semana'?'on':''}" data-act="finGroup" data-id="semana">Semana</button><button class="${state.finGroup==='mes'?'on':''}" data-act="finGroup" data-id="mes">Mes</button></div>`;
  const totals=finTotals(list,state.finGroup);
  const totalRows=totals.map(t=>`<tr><td>${esc(t.label)}</td><td style="text-align:center">${t.n}</td><td style="text-align:right">$ ${money(t.ars)}</td><td style="text-align:right">US$ ${money(t.usd)}</td></tr>`).join("");
  const filtActivo=f.concepto||f.estado||f.desde||f.hasta||f.q;
  return `<div class="scard" style="margin-bottom:13px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <label style="font-size:.86em;color:var(--tx-dim);font-weight:600">💱 Tipo de cambio del día</label>
      <input type="number" step="0.0001" class="inp" style="width:140px" placeholder="0" value="${state.finTC||''}" data-act="finTCSet">
      <span style="font-size:.8em;color:var(--tx-faint)">Se aplica automáticamente a todos los pagos (los ya cargados y los nuevos).</span>
    </div>
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:13px;flex-wrap:wrap">
      <div class="filters">
        <select class="inp" data-act="finFilter" data-id="concepto">${optionList(state.finConceptos,f.concepto,"Todos los conceptos")}</select>
        <select class="inp" data-act="finFilter" data-id="estado"><option value="">Todos los estados</option>${PAGO_ESTADOS.map(s=>`<option value="${s.key}" ${f.estado===s.key?'selected':''}>${s.label}</option>`).join("")}</select>
        <input type="date" class="inp" style="width:auto" title="Desde" value="${esc(f.desde)}" data-act="finFilter" data-id="desde">
        <input type="date" class="inp" style="width:auto" title="Hasta" value="${esc(f.hasta)}" data-act="finFilter" data-id="hasta">
        <input type="search" class="inp" placeholder="Buscar en detalle…" value="${esc(f.q)}" data-act="finFilter" data-id="q">
        ${filtActivo?'<button class="btn-ghost" data-act="finFilterClear">✕ Limpiar filtros</button>':''}
      </div>
      <div class="spacer"></div>
      <button class="btn-ghost" data-act="finExportXlsx" title="Descargar en Excel">⬇ Excel</button>
      <button class="btn-ghost" data-act="finExportPdf" title="Descargar en PDF">⬇ PDF</button>
      <button class="btn-primary" data-act="finAdd">＋ Nuevo pago</button>
    </div>
    <div class="table-wrap"><table class="tasks" style="min-width:960px"><thead><tr><th>Fecha de pago</th><th>Concepto</th><th>Detalle</th><th>Importe $ (ARS)</th><th>T.C.</th><th>Importe US$</th><th style="text-align:center">Estado</th><th></th></tr></thead>
    <tbody>${rows||'<tr><td colspan="8"><div class="empty">Sin pagos cargados. Agregá sueldos, VEP, pagos al exterior, préstamos…</div></td></tr>'}</tbody></table></div>
    <div class="scard" style="margin-top:16px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap">
        <h3 style="color:var(--tx);text-transform:none;letter-spacing:0;font-size:.95em;margin:0">Totales</h3>
        <div style="flex:1"></div>
        ${groupSeg}
      </div>
      <div class="table-wrap" style="box-shadow:none;border:1px solid var(--line)"><table class="tasks" style="min-width:520px"><thead><tr><th>Período</th><th style="text-align:center">Pagos</th><th style="text-align:right">Total $ (ARS)</th><th style="text-align:right">Total US$</th></tr></thead>
      <tbody>${totalRows||'<tr><td colspan="4"><div class="empty" style="padding:18px">Sin datos para totalizar.</div></td></tr>'}
      <tr style="font-weight:700;border-top:2px solid var(--line)"><td>Total ${filtActivo?'(filtrado)':'general'}</td><td style="text-align:center">${list.length}</td><td style="text-align:right">$ ${money(totalArs)}</td><td style="text-align:right">US$ ${money(totalUsd)}</td></tr>
      </tbody></table></div>
    </div>
    <p style="color:var(--tx-faint);font-size:.8em;margin-top:10px">El importe en dólares se calcula dividiendo el importe en pesos por el tipo de cambio del día. Los conceptos se administran desde Configuración.</p>`;
}
function exportFinXlsx(){
  const list=[...finFiltered()].sort((a,b)=>(a.fecha||'9999-99-99')<(b.fecha||'9999-99-99')?-1:1);
  if(!list.length){ toast("No hay pagos para exportar."); return; }
  const xesc=s=>(s||"").toString().replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));
  const cellS=(v,style)=>`<Cell${style?` ss:StyleID="${style}"`:""}><Data ss:Type="String">${xesc(v)}</Data></Cell>`;
  const cellN=(v,style)=>`<Cell${style?` ss:StyleID="${style}"`:""}><Data ss:Type="Number">${Number(v)||0}</Data></Cell>`;
  const row=cells=>`<Row>${cells}</Row>`;
  let rows="";
  rows+=row(cellS("Planificación Financiera","sTitle"));
  rows+=row("");
  rows+=row(cellS("Fecha de pago","sHead")+cellS("Concepto","sHead")+cellS("Detalle","sHead")+cellS("Importe $ (ARS)","sHead")+cellS("T.C.","sHead")+cellS("Importe US$","sHead")+cellS("Estado","sHead"));
  let totalArs=0,totalUsd=0;
  list.forEach(p=>{
    const usd=finUsd(p); totalArs+=Number(p.importeArs)||0; totalUsd+=usd;
    rows+=row(cellS(p.fecha?fmt(p.fecha):"—")+cellS(p.concepto)+cellS(p.detalle)+cellN(p.importeArs)+cellN(p.tc)+cellN(usd.toFixed(2))+cellS(pagoEstMeta(p.estado).label));
  });
  rows+=row("");
  rows+=row(cellS("Total","sHead")+cellS("")+cellS("")+cellN(totalArs.toFixed(2),"sHead")+cellS("","sHead")+cellN(totalUsd.toFixed(2),"sHead")+cellS(""));
  rows+=row("");
  const totals=finTotals(list,state.finGroup);
  rows+=row(cellS("Totales por "+(state.finGroup==='dia'?'día':state.finGroup==='mes'?'mes':'semana'),"sTitle"));
  rows+=row(cellS("Período","sHead")+cellS("Pagos","sHead")+cellS("Total $ (ARS)","sHead")+cellS("Total US$","sHead"));
  totals.forEach(t=>{ rows+=row(cellS(t.label)+cellN(t.n)+cellN(t.ars.toFixed(2))+cellN(t.usd.toFixed(2))); });
  const xml=`<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
<Style ss:ID="sTitle"><Font ss:Bold="1" ss:Size="14"/></Style>
<Style ss:ID="sHead"><Font ss:Bold="1"/><Interior ss:Color="#ECEEFB" ss:Pattern="Solid"/></Style>
</Styles>
<Worksheet ss:Name="Planificación Financiera">
<Table>
<Column ss:Width="90"/><Column ss:Width="150"/><Column ss:Width="200"/><Column ss:Width="110"/><Column ss:Width="90"/><Column ss:Width="110"/><Column ss:Width="100"/>
${rows}
</Table>
</Worksheet>
</Workbook>`;
  dlBlob(xml,"application/vnd.ms-excel","Planificacion_Financiera_"+today()+".xls");
  toast("Excel descargado.");
}
function exportFinPdf(){
  const list=[...finFiltered()].sort((a,b)=>(a.fecha||'9999-99-99')<(b.fecha||'9999-99-99')?-1:1);
  if(!list.length){ toast("No hay pagos para exportar."); return; }
  const e=esc;
  let totalArs=0,totalUsd=0;
  const rows=list.map(p=>{
    const usd=finUsd(p); totalArs+=Number(p.importeArs)||0; totalUsd+=usd;
    return `<tr>
      <td class="nowrap">${p.fecha?e(fmt(p.fecha)):'—'}</td>
      <td>${e(p.concepto||'—')}</td>
      <td>${e(p.detalle||'')}</td>
      <td class="num">$ ${money(p.importeArs)}</td>
      <td class="num">${p.tc?money(p.tc):'—'}</td>
      <td class="num">US$ ${money(usd)}</td>
      <td class="nowrap">${e(pagoEstMeta(p.estado).label)}</td>
    </tr>`;
  }).join("");
  const totals=finTotals(list,state.finGroup);
  const totalRows=totals.map(t=>`<tr><td>${e(t.label)}</td><td class="num">${t.n}</td><td class="num">$ ${money(t.ars)}</td><td class="num">US$ ${money(t.usd)}</td></tr>`).join("");
  const hoy=new Date().toLocaleDateString("es-AR",{day:"2-digit",month:"long",year:"numeric"});
  const html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Planificación Financiera</title>
<style>
  *{box-sizing:border-box;} body{font-family:-apple-system,"Segoe UI",Arial,sans-serif;color:#1f2430;margin:28px;line-height:1.4;}
  h1{font-size:19px;margin:0 0 2px;} h2{font-size:14px;margin:22px 0 8px;} .sub{color:#6b7280;font-size:12px;margin:0 0 18px;}
  table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px;}
  thead th{background:#eceefb;color:#1f2430;text-align:left;padding:7px 8px;border-bottom:2px solid #4c5bd4;font-size:10px;text-transform:uppercase;letter-spacing:.4px;}
  tbody td{padding:7px 8px;border-bottom:1px solid #e4e7eb;vertical-align:top;}
  tbody tr:nth-child(even){background:#fafbfc;}
  .nowrap{white-space:nowrap;} .num{text-align:right;white-space:nowrap;}
  tfoot td{font-weight:700;border-top:2px solid #4c5bd4;padding:7px 8px;}
  tr{page-break-inside:avoid;}
  @media print{body{margin:12mm;} @page{margin:11mm;}}
</style></head><body>
<h1>Planificación Financiera</h1>
<p class="sub">${list.length} pago${list.length===1?'':'s'} · Generado el ${e(hoy)}</p>
<table>
  <thead><tr><th>Fecha</th><th>Concepto</th><th>Detalle</th><th>Importe $ (ARS)</th><th>T.C.</th><th>Importe US$</th><th>Estado</th></tr></thead>
  <tbody>${rows}</tbody>
  <tfoot><tr><td colspan="3">Total</td><td class="num">$ ${money(totalArs)}</td><td></td><td class="num">US$ ${money(totalUsd)}</td><td></td></tr></tfoot>
</table>
<h2>Totales por ${state.finGroup==='dia'?'día':state.finGroup==='mes'?'mes':'semana'}</h2>
<table>
  <thead><tr><th>Período</th><th>Pagos</th><th>Total $ (ARS)</th><th>Total US$</th></tr></thead>
  <tbody>${totalRows}</tbody>
</table>
<script>window.onload=function(){setTimeout(function(){window.print();},250);};<\/script>
</body></html>`;
  const w=window.open("","_blank");
  if(!w){ toast("Permití las ventanas emergentes para exportar el PDF."); return; }
  w.document.open(); w.document.write(html); w.document.close();
  toast("Se abrió la vista de impresión — elegí “Guardar como PDF”.");
}

/* ============================================================
   CONFIG
   ============================================================ */
function viewConfig(){
  const chips=(arr,kind)=>arr.map((a,i)=>`<span class="chip">${esc(a)}<button data-act="cfgDel" data-kind="${kind}" data-i="${i}">✕</button></span>`).join("");
  const objChips=state.objetivos.map((o,i)=>`<span class="chip">${esc(o.tag)} · ${esc(o.name)}<button data-act="cfgDel" data-kind="obj" data-i="${i}">✕</button></span>`).join("");
  const scSecOpts=(sel)=>{ const all=[["dashboard","Dashboard"]].concat(SECTIONS.filter(s=>s.id!=="dashboard").map(s=>[s.id,s.label])); return all.map(([v,l])=>`<option value="${v}" ${ (sel||"dashboard")===v?'selected':''}>${esc(l)}</option>`).join(""); };
  const scRows=state.shortcuts.map((s,i)=>`<div class="sc-edit"><input class="inp" style="width:46px;text-align:center" value="${esc(s.ic)}" data-act="scF" data-i="${i}" data-f="ic"><input class="inp" style="flex:0 0 140px" value="${esc(s.label)}" data-act="scF" data-i="${i}" data-f="label" placeholder="Nombre"><input class="inp" style="flex:1;min-width:120px" value="${esc(s.url)}" data-act="scF" data-i="${i}" data-f="url" placeholder="https://…"><select class="inp" style="flex:0 0 150px" data-act="scF" data-i="${i}" data-f="section">${scSecOpts(s.section)}</select><button class="row-del" data-act="scDel" data-i="${i}">🗑</button></div>`).join("");
  const bgPrev={ banda:`<i style="background:var(--sidebar)"></i><i style="background:var(--bg)"></i><i style="background:var(--panel)"></i><i style="background:var(--panel)"></i>`,
    bruma:`<i style="background:color-mix(in srgb,var(--accent) 30%,var(--bg))"></i><i style="background:color-mix(in srgb,var(--accent) 12%,var(--bg))"></i><i style="background:var(--bg)"></i><i style="background:var(--panel)"></i>`,
    curvas:`<i style="background:var(--bg)"></i><i style="background:color-mix(in srgb,var(--tx) 10%,var(--bg))"></i><i style="background:var(--bg)"></i><i style="background:var(--panel)"></i>`,
    cuaderno:`<i style="background:var(--bg)"></i><i style="background:color-mix(in srgb,var(--tx) 16%,var(--bg))"></i><i style="background:var(--bg)"></i><i style="background:var(--panel)"></i>`,
    vidrio:`<i style="background:color-mix(in srgb,var(--accent) 45%,var(--bg))"></i><i style="background:color-mix(in srgb,#7F77DD 35%,var(--bg))"></i><i style="background:color-mix(in srgb,#EF9F27 25%,var(--bg))"></i><i style="background:var(--panel)"></i>`,
    plano:`<i style="background:var(--bg)"></i><i style="background:var(--bg)"></i><i style="background:var(--panel)"></i><i style="background:var(--panel)"></i>` };
  const bgSw=Object.entries(BACKGROUNDS).map(([k,b])=>`<button class="swatch ${state.bg===k?'on':''}" data-act="bg" data-k="${k}" title="${b.hint}"><div class="prev">${bgPrev[k]}</div><div class="nm">${b.name}</div></button>`).join("");
  const sw=Object.entries(PALETTES).map(([k,p])=>`<button class="swatch ${state.theme===k?'on':''}" data-act="theme" data-k="${k}"><div class="prev"><i style="background:${p.vars['--sidebar']}"></i><i style="background:${p.vars['--accent']}"></i><i style="background:${p.vars['--bg']}"></i><i style="background:${p.vars['--panel']}"></i></div><div class="nm">${p.name}</div></button>`).join("");
  return `<div class="cfg-grid">
    <div class="cfg-card"><h3>Áreas</h3><div class="chip-list">${chips(state.areas,'area')}</div><div class="cfg-add"><input id="cfgArea" placeholder="Nueva área…" data-act="cfgAddKey" data-ev="keydown" data-kind="area"><button data-act="cfgAdd" data-kind="area">＋</button></div></div>
    <div class="cfg-card"><h3>Responsables</h3><div class="chip-list">${chips(state.responsables,'resp')}</div><div class="cfg-add"><input id="cfgResp" placeholder="Nuevo responsable…" data-act="cfgAddKey" data-ev="keydown" data-kind="resp"><button data-act="cfgAdd" data-kind="resp">＋</button></div></div>
    <div class="cfg-card"><h3>Objetivos (tags)</h3><div class="chip-list">${objChips}</div><div class="cfg-add"><input id="cfgObjTag" placeholder="TAG" style="max-width:90px"><input id="cfgObjName" placeholder="Nombre del objetivo…"><button data-act="cfgAdd" data-kind="obj">＋</button></div></div>
    <div class="cfg-card"><h3>Conceptos de pago (Planificación Financiera)</h3><div class="chip-list">${chips(state.finConceptos,'finConcepto')}</div><div class="cfg-add"><input id="cfgFinConcepto" placeholder="Nuevo concepto…" data-act="cfgAddKey" data-ev="keydown" data-kind="finConcepto"><button data-act="cfgAdd" data-kind="finConcepto">＋</button></div></div>
  </div>
  <div class="scard" style="margin-top:16px"><h3 style="font-size:.92em;color:var(--tx);text-transform:none;letter-spacing:0">Paleta de colores</h3><div class="swatches">${sw}</div></div>
  <div class="scard"><h3 style="font-size:.92em;color:var(--tx);text-transform:none;letter-spacing:0">Fondo de la app</h3>
    <div class="swatches">${bgSw}</div>
    <h3 style="font-size:.92em;color:var(--tx);text-transform:none;letter-spacing:0;margin-top:16px">Densidad de las tablas</h3>
    <div class="seg" style="width:max-content">
      <button class="${state.density!=='dense'?'on':''}" data-act="density" data-k="normal">Cómoda</button>
      <button class="${state.density==='dense'?'on':''}" data-act="density" data-k="dense">Compacta</button>
    </div>
    <p style="color:var(--tx-faint);font-size:.82em;margin:10px 0 0">La densidad compacta muestra más filas en pantalla y oculta el texto "vence en X días".</p>
  </div>
  <div class="scard"><h3 style="font-size:.92em;color:var(--tx);text-transform:none;letter-spacing:0">Accesos directos</h3>
    ${scRows||'<p style="color:var(--tx-faint);font-size:.86em">Sin accesos directos.</p>'}
    <button class="btn-ghost add-row" data-act="scAdd">＋ Agregar acceso directo</button>
    <p style="color:var(--tx-faint);font-size:.8em;margin:10px 0 0">El primer campo es el ícono (podés pegar un emoji). Con el último menú elegís en qué sección aparece (Dashboard, Administración, Calidad, etc.).</p></div>
  <div class="scard"><h3 style="font-size:.92em;color:var(--tx);text-transform:none;letter-spacing:0">Foros de Mesa Ejecutiva</h3>
    ${foros().map((f,i)=>`<div class="sc-edit"><input class="inp" type="color" style="width:44px;padding:2px" value="${esc(f.col)}" data-act="foroF" data-i="${i}" data-f="col" title="Color"><input class="inp" style="flex:1;min-width:140px" value="${esc(f.label)}" data-act="foroF" data-i="${i}" data-f="label" placeholder="Nombre del foro"><button class="row-del" data-act="foroDel" data-i="${i}">🗑</button></div>`).join("")}
    <button class="btn-ghost add-row" data-act="foroAdd">＋ Agregar foro</button>
    <p style="color:var(--tx-faint);font-size:.8em;margin:10px 0 0">Cada foro es un tipo de reunión (1:1 con alguien, mesa de coordinadores, cliente, etc.). Borrar un foro no borra sus reuniones.</p></div>
  <p style="color:var(--tx-faint);font-size:.82em;margin-top:14px">Las áreas y responsables alimentan los menús de tareas y objetivos.</p>`;
}
function foroAdd(){
  const f=foros().slice();
  f.push({id:"f"+Date.now().toString(36),label:"Nuevo foro",col:"#888780"});
  state.foros=f; scheduleSaveSettings(); render();
}
function foroDel(i){
  const f=foros().slice(); const gone=f[+i]; if(!gone)return;
  const used=state.reuniones.filter(r=>r.area==='mesa'&&r.tipo===gone.id).length;
  if(!confirm(used?`El foro "${gone.label}" tiene ${used} reunión${used===1?'':'es'}. Se conservan, pero quedan sin foro. ¿Borrar?`:`¿Borrar el foro "${gone.label}"?`))return;
  f.splice(+i,1); state.foros=f; scheduleSaveSettings(); render();
}

/* ============================================================
   ACTIONS (event delegation)
   ============================================================ */
const ACTIONS = {
  goCard:(el)=>go(el.dataset.id),
  taskView:(el)=>{ state.taskView=el.dataset.id; render(); },
  wkFold:(el)=>{ const d=el.dataset.d; state.wkFold[d]=!state.wkFold[d]; paintTasks(); },
  wkFoldAll:(el)=>{ const on=el.dataset.k==='fold'; weekDays().forEach(d=>{ if(on)state.wkFold[d]=true; else delete state.wkFold[d]; }); paintTasks(); },
  wkBlockNew:(el)=>openBlockModal(el.dataset.d,null),
  wkBlockEdit:(el)=>openBlockModal(null,el.dataset.id),
  wkBlockSave:(el)=>saveBlockFromModal(el.dataset.d,el.dataset.id),
  wkBlockDel:(el)=>{ const b=getBloque(el.dataset.id); if(!b)return;
    if(b.tareas.length&&!confirm("¿Eliminar este bloque? Las tareas no se borran, vuelven a la bandeja."))return;
    state.bloques=state.bloques.filter(x=>x.id!==b.id); deleteBloqueDb(b.id); closeModal(); paintTasks(); },
  wkNav:(el)=>{ const k=el.dataset.id; if(k==='today')state.weekRef=today(); else { const d=weekRefDate(); d.setDate(d.getDate()+(k==='next'?7:-7)); state.weekRef=ymd(d); } paintTasks(); },
  wkSearch:(el)=>{ state.wkQ=el.value; clearTimeout(timers.wkq); timers.wkq=setTimeout(()=>paintTasks(),250); },
  trayToBlock:(el)=>{ const v=el.value; if(!v)return; assignToDay(el.dataset.t,state.blocksDate,v==='__loose'?null:v); paintTasks(); },
  wkAssign:(el)=>{ const v=el.value; if(!v)return; const [d,b]=v.split("|"); assignToDay(el.dataset.t,d,b||null); paintTasks(); },
  wkUnassign:(el)=>{ clearAssign(el.dataset.t,el.dataset.d); paintTasks(); },
  blkDone:(el)=>{ const t=taskById(el.dataset.id); if(!t)return; t.status=el.checked?'comp':'proc'; scheduleSaveTask(t.id); paintTasks(); },
  blkFreed:()=>openLiberadas(),
  freeAssign:(el)=>{ const v=el.value; if(!v)return; assignToDay(el.dataset.t,today(),v==='__loose'?null:v); openLiberadas(); paintTasks(); },
  duePick:(el)=>{ const i=document.getElementById("due_"+el.dataset.id); if(!i)return; try{ i.showPicker(); }catch(e){ i.style.position="static"; i.style.opacity=1; i.style.width="auto"; i.style.height="auto"; i.style.pointerEvents="auto"; i.focus(); } },
  bg:(el)=>{ applyBg(el.dataset.k); scheduleSaveSettings(); render(); },
  density:(el)=>{ applyDensity(el.dataset.k); scheduleSaveSettings(); render(); },
  cardFilter:(el)=>{ const k=el.dataset.k,v=el.dataset.v,f=state.filters; const on=f[k]===v; f.estado="";f.venc=""; if(!on)f[k]=v; syncFilterSelects(); paintTasks(); },
  clearFilters:()=>{ state.filters={estado:"",area:"",resp:"",venc:"",q:""}; render(); },
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
  calExportPdf:()=>exportHallazgosPdf(),
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
  finAdd:()=>addFinPago(),
  finDel:(el)=>delFinPago(el.dataset.id),
  finF:(el)=>{ const p=getFinPago(el.dataset.id); if(!p)return; const f=el.dataset.f; p[f]=(f==='importeArs'||f==='tc')?parseArsNumber(el.value):el.value; scheduleSaveFinPago(p.id); render(); },
  finFilter:(el)=>{ state.finFilters[el.dataset.id]=el.value; render(); },
  finFilterClear:()=>{ state.finFilters={concepto:"",estado:"",desde:"",hasta:"",q:""}; render(); },
  finGroup:(el)=>{ state.finGroup=el.dataset.id; render(); },
  finTCSet:(el)=>{ const v=el.value===''?0:parseFloat(el.value); state.finTC=isNaN(v)?0:v; state.finPagos.forEach(p=>{ p.tc=state.finTC; scheduleSaveFinPago(p.id); }); scheduleSaveSettings(); render(); },
  finExportXlsx:()=>exportFinXlsx(),
  finExportPdf:()=>exportFinPdf(),
  reuNew:(el)=>addReunion(el.dataset.id),
  reuOpen:(el)=>{ state.reuSel=el.dataset.id; render(); },
  reuBack:()=>{ state.reuSel=null; render(); },
  reuDel:(el)=>{ const id=el.dataset.id; state.reuniones=state.reuniones.filter(x=>x.id!==id); deleteReuDb(id); state.reuSel=null; render(); },
  reuF:(el)=>{ const r=getReu(state.reuSel); if(!r)return; r[el.dataset.f]=el.value; scheduleSaveReu(r.id); },
  reuCompTxt:(el)=>{ const r=getReu(state.reuSel); if(!r)return; r.compromisos[+el.dataset.i].t=el.value; scheduleSaveReu(r.id); },
  reuCompChk:(el)=>{ const r=getReu(state.reuSel); if(!r)return; readReuForm(r); r.compromisos[+el.dataset.i].done=el.checked; scheduleSaveReu(r.id); render(); },
  reuCompDel:(el)=>{ const r=getReu(state.reuSel); if(!r)return; readReuForm(r); r.compromisos.splice(+el.dataset.i,1); scheduleSaveReu(r.id); render(); },
  reuCompAdd:(el,e)=>{ if(e.key!=='Enter')return; const v=el.value.trim(); if(!v)return; const r=getReu(state.reuSel); if(!r)return; readReuForm(r); r.compromisos.push({t:v,done:false,taskId:null,resp:'',due:''}); saveReuNow(r.id); render(); setTimeout(()=>{const n=$("#reu_newcomp"); if(n)n.focus();},10); },
  reuCompTask:(el)=>taskFromCompromiso(+el.dataset.i),
  mesaTab:(el)=>{ state.mesaTab=el.dataset.id; render(); },
  calView:(el)=>{ state.calView=el.dataset.id; paintCalendar(); },
  calNav:(el)=>calShift(el.dataset.id),
  calRefresh:()=>{ state.calLoaded=false; loadCalendar(true); },
  calCancelEdit:()=>{ state.calEditing=false; render(); },
  calSettings:()=>{ state.calEditing=true; render(); },
  calSave:()=>{ const el=$("#calUrlInput"); if(!el)return; state.calUrls=el.value.split("\n").map(s=>s.trim()).filter(Boolean); state.calEditing=false; state.calLoaded=false; state.calError=""; scheduleSaveSettings(); render(); if(state.calUrls.length&&state.calLayers.google)loadCalendar(true); },
  calLayer:(el)=>{ const k=el.dataset.id; state.calLayers={...state.calLayers,[k]:!state.calLayers[k]}; if(k==="google"&&state.calLayers.google&&state.calUrls.length&&!state.calLoaded)loadCalendar(); const bar=document.querySelector(".cal-layers"); if(bar){ bar.outerHTML=calLayerBar(); const nb=document.querySelector(".cal-layers"); if(nb)nb.querySelectorAll("[data-act]").forEach(x=>{ const h=ACTIONS[x.dataset.act]; if(h)x.onclick=e=>h(x,e); }); } paintCalendar(); },
  calDay:(el)=>{ state.calDaySel=(state.calDaySel===el.dataset.id)?null:el.dataset.id; paintCalendar(); },
  calDayClose:()=>{ state.calDaySel=null; paintCalendar(); },
  calGo:(el)=>{ const t=el.dataset.t; const id=el.dataset.id, area=el.dataset.area;
    if(t==="evt"){ openEventoEditor(id); return; }
    if(t==="task"){ state.view="tareas"; render(); setTimeout(()=>openModal(id),30); return; }
    if(t==="bloque"){ const b=getBloque(id); if(b){ state.view="tareas"; state.taskView="bloques"; state.blocksDate=b.fecha; } render(); return; }
    if(t==="reu"){ state.reuSel=id; if(area==="mesa"){ state.view="mesa"; } render(); return; }
    if(t==="venc"){ state.view=area||"admin"; render(); return; }
  },
  evtNew:(el)=>{ if(el&&el.dataset.id)state.calDaySel=el.dataset.id; openEventoEditor(null); },
  evtF:(el)=>{ if(!state._evtDraft)return; state._evtDraft[el.dataset.f]=el.value; },
  evtColor:(el)=>{ if(!state._evtDraft)return; state._evtDraft.color=el.dataset.c; document.querySelectorAll(".evt-sw").forEach(s=>s.classList.toggle("on",s.dataset.c===el.dataset.c)); },
  evtColorClose:()=>{},
  evtClose:()=>{ closeModal(); },
  evtSave:()=>{ const d=state._evtDraft; if(!d){ closeModal(); return; }
    ["titulo","fecha","inicio","fin","nota"].forEach(f=>{ const el=$("#evt_"+({titulo:"tit",fecha:"fec",inicio:"ini",fin:"fin",nota:"nota"}[f])); if(el)d[f]=el.value; });
    if(!d.titulo.trim()){ toast("Poné un título al evento."); return; }
    if(!d.fecha){ toast("Elegí una fecha."); return; }
    const existing=getEvento(d.id);
    if(existing){ Object.assign(existing,d); } else { state.eventos.push({...d}); }
    saveEventoNow(d.id); state._evtDraft=null; closeModal();
  },
  evtDel:(el)=>{ const id=el.dataset.id; if(!confirm("¿Eliminar este evento?"))return; state.eventos=state.eventos.filter(e=>e.id!==id); deleteEventoDb(id); state._evtDraft=null; closeModal(); },
  mesaFiltro:(el)=>{ state.mesaFiltro=el.dataset.id||""; render(); },
  mesaNew:()=>addMesaReunion(),
  mesaBack:()=>{ state.reuSel=null; render(); },
  mesaPart:(el)=>mesaTogglePart(el.dataset.p),
  mesaCompResp:(el)=>{ const r=getReu(state.reuSel); if(!r)return; readReuForm(r); r.compromisos[+el.dataset.i].resp=el.value; scheduleSaveReu(r.id); render(); },
  mesaCompDue:(el)=>{ const r=getReu(state.reuSel); if(!r)return; readReuForm(r); r.compromisos[+el.dataset.i].due=el.value; scheduleSaveReu(r.id); render(); },
  foroAdd:()=>foroAdd(),
  foroDel:(el)=>foroDel(el.dataset.i),
  foroF:(el)=>{ const i=+el.dataset.i; const f=foros().slice(); f[i]={...f[i],[el.dataset.f]:el.value}; state.foros=f; scheduleSaveSettings(); if(el.dataset.f==='col')render(); },
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
  blkExportXlsx:()=>exportDiaXlsx(),
  blkExportPdf:()=>exportDiaPdf(),
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
  if(kind==='finConcepto'){ const v=$("#cfgFinConcepto").value.trim(); if(v&&!state.finConceptos.includes(v)){ state.finConceptos.push(v); scheduleSaveSettings(); } }
  render();
}
function cfgDel(kind,i){
  if(kind==='area'){ state.areas.splice(i,1); scheduleSaveSettings(); }
  if(kind==='resp'){ state.responsables.splice(i,1); scheduleSaveSettings(); }
  if(kind==='obj'){ const o=state.objetivos[i]; state.objetivos.splice(i,1); if(o)deleteObjDb(o.id); }
  if(kind==='finConcepto'){ state.finConceptos.splice(i,1); scheduleSaveSettings(); }
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
applyTheme("bosque"); applyBg("banda");
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

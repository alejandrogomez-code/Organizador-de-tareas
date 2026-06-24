# Panel de trabajo

App web personal de gestión laboral (tareas + objetivos), con base de datos propia y login.
Funciona como un sitio estático conectado a **Supabase** (base de datos + login), alojado en **Vercel**, con el código en **GitHub**.

> ⚠️ **Importante:** abrir `index.html` haciendo doble clic **no va a funcionar**. La app necesita estar configurada con Supabase y servida desde Vercel (o un servidor local). Seguí los pasos de abajo.

---

## Qué vas a necesitar (todo gratis)

- Una cuenta en **Supabase** → https://supabase.com
- Una cuenta en **GitHub** → https://github.com
- Una cuenta en **Vercel** → https://vercel.com (podés entrar con tu GitHub)

No hace falta instalar nada en tu computadora ni saber programar. Son ~15 minutos.

---

## Paso 1 — Crear la base de datos en Supabase

1. Entrá a https://supabase.com y hacé **New project**.
2. Ponele un nombre (ej. `panel-trabajo`), elegí una contraseña para la base (guardala) y la región más cercana. Crealo.
3. Esperá ~2 minutos a que termine de prepararse.
4. En el menú lateral, andá a **SQL Editor** → **New query**.
5. Abrí el archivo `supabase/schema.sql` de este proyecto, **copiá todo su contenido**, pegalo en el editor y apretá **Run**.
   - Debería decir *Success*. Esto crea las tablas y la seguridad (cada usuario sólo ve sus propios datos).

### 1.b — Desactivar confirmación por email (recomendado para uso personal)

Para que crear tu cuenta sea instantáneo y no tengas que confirmar por correo:

1. En Supabase: **Authentication** → **Sign In / Providers** (o **Providers** → **Email**).
2. Desactivá **"Confirm email"** y guardá.

(Si lo dejás activado, vas a tener que confirmar tu mail antes de poder entrar la primera vez. También funciona, es sólo un paso extra.)

---

## Paso 2 — Conseguir tus claves y ponerlas en `config.js`

1. En Supabase: **Project Settings** (el engranaje) → **API**.
2. Copiá dos valores:
   - **Project URL** (algo como `https://abcdxyz.supabase.co`)
   - **anon public** key (una cadena larga)
3. Abrí el archivo `config.js` de este proyecto y reemplazá los dos valores:

```js
export const SUPABASE_URL = "https://abcdxyz.supabase.co";   // ← tu Project URL
export const SUPABASE_ANON_KEY = "eyJhbGciOi...";            // ← tu anon public key
```

4. Guardá el archivo.

> La **anon key es pública** y es seguro dejarla en el código: el acceso a los datos está protegido por las reglas de seguridad (RLS) que creó el `schema.sql`. Nadie puede ver datos de otra cuenta.

---

## Paso 3 — Subir el proyecto a GitHub

**Opción fácil (desde la web, sin instalar nada):**

1. En GitHub, hacé **New repository**, ponele un nombre (ej. `panel-trabajo`), dejalo **Private** y crealo (sin README).
2. En la página del repo vacío, hacé clic en **uploading an existing file**.
3. Arrastrá **todos** los archivos y carpetas de este proyecto (incluido `config.js` ya configurado y la carpeta `supabase`).
4. **Commit changes**.

---

## Paso 4 — Publicar en Vercel

1. Entrá a https://vercel.com e iniciá sesión con GitHub.
2. **Add New… → Project** e **importá** el repositorio `panel-trabajo`.
3. Vercel detecta que es un sitio estático. No cambies nada (Framework Preset: *Other*). Hacé **Deploy**.
4. En ~1 minuto te da una URL pública (ej. `https://panel-trabajo.vercel.app`). Esa es tu app.

> Cada vez que cambies algo en GitHub, Vercel vuelve a publicar solo.

---

## Paso 5 — Crear tu cuenta y empezar

1. Abrí la URL que te dio Vercel.
2. Hacé clic en **"Crear una"**, poné tu email y una contraseña, y **Crear cuenta**.
3. Si desactivaste la confirmación (Paso 1.b), ya entrás. Si no, confirmá el mail y volvé a iniciar sesión.
4. Listo: la app arranca **vacía**, con tus áreas y responsables por defecto. Empezá a cargar tareas y objetivos. Todo se guarda automáticamente en tu base.

---

## Cómo se usa (resumen)

- **Tareas:** vista tabla o kanban, filtros, agrupar, subtareas, recurrencia, vínculo a objetivos. Clic en el título abre la ficha completa.
- **Objetivos:** indicadores, plan de acción por mes (abril 2026 → abril 2027), tareas vinculadas y *Revisión por la dirección* (un registro por mes, con historial).
- **Configuración:** áreas, responsables, objetivos (tags), accesos directos del dashboard y **paleta de colores** (5 a elegir, incluye modo oscuro).
- **Texto:** botones `A− / A / A+` arriba a la derecha para agrandar o achicar la letra.

---

## Notas y límites actuales

- **Adjuntos:** por ahora se guarda sólo el **nombre** del archivo, no el archivo en sí. Subir archivos de verdad (Supabase Storage) es una mejora futura.
- Tus datos viven en **tu** proyecto de Supabase. Sos el dueño; podés exportarlos cuando quieras desde Supabase.
- El plan gratuito de Supabase y Vercel alcanza de sobra para uso personal.

## Próximos pasos previstos

Completar las secciones que hoy son placeholders: **Administración · Finanzas**, **Calidad**, **Logística · Compras** y **Sistemas**.

---

## Estructura del proyecto

```
panel-trabajo/
├─ index.html          ← interfaz y estilos
├─ app.js              ← toda la lógica (tareas, objetivos, login, guardado, paletas)
├─ config.js           ← tus claves de Supabase (completar)
├─ vercel.json         ← config de Vercel
├─ .gitignore
└─ supabase/
   └─ schema.sql       ← script para crear la base (correr una vez)
```

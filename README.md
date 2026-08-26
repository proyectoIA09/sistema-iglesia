# Sistema de Iglesia

Control de finanzas, células y reportes para Iglesia Generación de Jesús. Construido con Next.js, Tailwind y Supabase — 100% gratis para empezar. Montos en dólares estadounidenses (USD).

## ¿Qué incluye?

- **Células**: registro de células por zona, con formulario semanal de reporte (niños, jóvenes, adultos, mayores, conversiones, reconciliaciones, ofrenda) y registro de visitantes con nombre, edad y teléfono para poder darles seguimiento. Las células se pueden desactivar (con motivo y fecha) sin perder su historial, y reactivarse después.
- **Finanzas**: ingresos y gastos por categoría y fondo (general, misiones, construcción).
- **Proyectos**: fondos con meta y tiempo definido (ej. "Siembra para mi casa", $2,500 en 5 meses), con seguimiento de cuánto se ha recaudado y cuánto falta.
- **Reportes**: consolidado automático de todas las células en un reporte general de iglesia, filtrable por mes y con comparativo entre meses, con gráficas.
- **Administración**: edición de nombre/teléfono de líderes y supervisores, y de la información de cada célula (zona, líder, día, hora, ubicación) — solo para administradores/pastor.
- **Roles**: admin/pastor (acceso total), supervisor de zona (su zona, sin finanzas), líder de célula (solo su propia célula) — cada quien ve solo lo que le corresponde.

## 1. Instalar Node.js (una sola vez)

Descarga la versión LTS desde [nodejs.org](https://nodejs.org) e instálala. Luego verifica en una terminal:

```bash
node -v
npm -v
```

## 2. Crear el proyecto en Supabase (gratis)

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta / proyecto nuevo.
2. En el proyecto, ve a **SQL Editor** y pega el contenido de [`supabase/schema.sql`](supabase/schema.sql). Ejecútalo.
3. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public key`
4. Crea un archivo `.env.local` en la raíz del proyecto (cópialo de `.env.example`) y pega esos valores.

## 3. Crear tu primer usuario administrador

1. En Supabase, ve a **Authentication → Users → Add user** y crea tu usuario (correo + contraseña).
2. Copia el `UID` del usuario creado.
3. En **SQL Editor**, ejecuta (reemplaza el UID y tu nombre):

```sql
insert into public.profiles (id, nombre_completo, role)
values ('PEGA-AQUI-EL-UID', 'Tu Nombre', 'admin');
```

Con eso ya puedes iniciar sesión como administrador.

## 4. Correr el proyecto en tu computadora

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## 5. Subir a GitHub

```bash
git init
git add .
git commit -m "Sistema de iglesia inicial"
```

Crea un repositorio nuevo en [github.com/new](https://github.com/new) (puede ser privado) y luego:

```bash
git remote add origin https://github.com/TU-USUARIO/iglesia-app.git
git branch -M main
git push -u origin main
```

## 6. Publicarlo gratis con Vercel

1. Ve a [vercel.com](https://vercel.com), crea cuenta con tu GitHub.
2. **Add New Project** → selecciona el repositorio `iglesia-app`.
3. En **Environment Variables**, agrega las mismas dos variables de `.env.local`.
4. Deploy. En un par de minutos tu sistema queda disponible en `iglesia-app.vercel.app` (puedes cambiar el subdominio en la configuración del proyecto en Vercel).

Cada vez que hagas `git push`, Vercel actualiza el sitio automáticamente.

## Siguientes pasos sugeridos

- Crear las zonas y supervisores desde Supabase (tabla `zonas`) o agregar una pantalla de administración.
- Crear cuentas para cada líder y supervisor (Authentication → Add user) y su fila en `profiles` con el `role` y `zona_id` correspondiente, y asignarlos como `lider_id` en su célula.
- Cuando quieran verse más profesionales, comprar un dominio propio (ej. en Namecheap o Google Domains) y conectarlo en Vercel — es opcional y no requiere tocar el código.

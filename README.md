# SPACEBOOK — Reservas de espacios compartidos

Este repositorio actúa como el repositorio central del proyecto "SPACEBOOK". Contiene la documentación, scripts e integración central, y referencia la interfaz de usuario como un submódulo Git (`frontend/`).

Resumen rápido
- `frontend/` — submódulo que contiene la aplicación Angular (SpaceBook) en: `https://github.com/vivileef/Frontend.git`.
- Este repo central contiene documentación del dominio, instrucciones de despliegue y utilidades de coordinación (CI, infra, scripts).

## Arquitectura (resumen)

Breve visión general:
- Frontend: SPA Angular (cliente) que consume Supabase (Auth + Postgres + Storage).
- Backend: Supabase (gestiona la base de datos Postgres, autenticación y almacenamiento de archivos).
- Comunicación: el frontend usa `@supabase/supabase-js` para interactuar con las tablas y con Storage.

## Tecnologías y dependencias (versiones exactas)

**Frontend (espacio: `Frontend/spacebook`)**
- Angular core: `^20.0.0`
- @angular/cli: `^20.0.5`
- TypeScript: `~5.8.2`
- RxJS: `~7.8.0`
- Zone.js: `~0.15.0`
- Supabase JS client: `@supabase/supabase-js@^2.81.1`
- Tailwind CSS: `^4.1.17`
- DaisyUI: `^5.5.0` (dev)
- PostCSS / Autoprefixer: `postcss@^8.5.6`, `autoprefixer@^10.4.22`

**Tooling (repositorio `Frontend` root)**
- Tailwind + DaisyUI devDependencies en `Frontend/package.json`:
  - `daisyui@^5.4.7`
  - `tailwindcss@^4.1.17`

**Recomendaciones de entorno**
- Node.js: 18.x o 20.x (compatibilidad con Angular 20 y toolchain moderno). Usa la misma versión en CI.
- npm: >= 9 (o `pnpm`/`yarn` según preferencia, actualizar scripts si se usan).

## Modelo de datos (ER)

El modelo simplificado (usa Mermaid para renderizar):

```mermaid
erDiagram
	INSTITUCION {
		string institucionid PK
		string nombre
		string direccion
	}
	SECCION {
		string seccionid PK
		string nombre
		string institucionid FK
	}
	ESPACIO {
		string espacioid PK
		string nombre
		string seccionid FK
		boolean estado
		int capacidad
	}
	ESPACIOHORA {
		string espaciohoraid PK
		string espacioid FK
		time horainicio
		time horafin
		boolean estado
		string reservaid FK NULL
	}
	RESERVA {
		string reservaid PK
		string usuarioid FK
		string nombrereserva
		timestamp fechareserva
	}
	USUARIO {
		string usuarioid PK
		string nombre
		string correo
	}
	COMENTARIO {
		string comentarioid PK
		string espacioid FK
		string usuarioid FK
		text contenido
		timestamp creado_en
	}
	INCIDENCIA {
		string incidenciaid PK
		string espacioid FK
		string usuarioid FK
		text descripcion
		timestamp creado_en
	}
	NOTIFICACION {
		string notificacionid PK
		string usuarioid FK
		text mensaje
		boolean leido
	}

	INSTITUCION ||--o{ SECCION : "tiene"
	SECCION ||--o{ ESPACIO : "contiene"
	ESPACIO ||--o{ ESPACIOHORA : "tiene"
	ESPACIOHORA }o--|| ESPACIO : "pertenece a"
	USUARIO ||--o{ RESERVA : "crea"
	RESERVA ||--o{ ESPACIOHORA : "incluye"
	ESPACIO ||--o{ COMENTARIO : "recibe"
	USUARIO ||--o{ COMENTARIO : "escribe"
	ESPACIO ||--o{ INCIDENCIA : "puede tener"
	USUARIO ||--o{ INCIDENCIA : "reporta"
	USUARIO ||--o{ NOTIFICACION : "recibe"

```

> Nota: este ER es una representación simplificada. Adecuar constraints, tipos y migraciones en el proyecto Supabase real.


## Supabase: scripts y SQL

En el submódulo `frontend/spacebook` encontrarás archivos SQL de ejemplo y guías:

- `Frontend/spacebook/SUPABASE_ADMINISTRADOR_SETUP.sql` — (scripts de ejemplo para setup de administrador)
- `Frontend/spacebook/SUPABASE_USUARIOS_SETUP.sql` — (scripts de ejemplo para datos/usuarios)
- `Frontend/spacebook/CONFIGURACION_RAPIDA_ROLES.md` — guía rápida de roles y RLS

Usa esos scripts en el panel SQL de Supabase para crear tablas iniciales durante desarrollo.

## Desarrollo local

1. Clona el repo padre e inicializa submódulos:

```powershell
git clone https://github.com/vivileef/SPACEBOOK-Reservas-de-espacios-compartidos.git
cd SPACEBOOK-Reservas-de-espacios-compartidos
git submodule update --init --recursive
```

2. Entra al submódulo frontend e instala dependencias:

```powershell
cd frontend
npm install
npx ng serve --open
```

Esto arranca la app Angular en `http://localhost:4200`.

## Buenas prácticas con el submódulo

- Siempre realiza cambios en el repo `Frontend` (no editar los archivos dentro del submódulo desde el repo padre).
- Para actualizar la referencia en el padre: dentro de `frontend` haz `git pull` y luego en la raíz del repo padre `git add frontend && git commit -m "Update frontend submodule"`.

## CI / Despliegue (sugerencias rápidas)

- CI: usa GitHub Actions en el repo `Frontend` para construir y publicar artefactos (por ejemplo build estático, E2E, tests).
- Despliegue: puedes desplegar build a cualquier hosting estático (Netlify, Vercel) y dejar Supabase como backend.

## Contribuir

- Para cambios del frontend: clona `https://github.com/vivileef/Frontend.git`, crea rama, haz PR y coordina merge.
- Para documentación o scripts globales: crea PRs en este repo padre.

## Contacto

- Maintainer: vivileef

---
Actualizado: 2025-11-24

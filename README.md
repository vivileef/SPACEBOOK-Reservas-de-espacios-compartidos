
## 🚀 SPACEBOOK — Reservas de espacios compartidos

Este repositorio actúa como el repo central del proyecto SPACEBOOK, encargado de:

- 📚 Documentación del dominio y arquitectura.
- 🗃️ Scripts SQL y guías para Supabase.
- 🔧 Integración general (CI/CD, despliegue, infraestructura).
- 🔗 Referenciar la aplicación Angular mediante submódulo Git (`frontend/`).

La interfaz de usuario se encuentra en el submódulo:  
📁 `frontend/` → [Frontend GitHub](https://github.com/vivileef/Frontend.git)

## 📌 Resumen del proyecto

SPACEBOOK es una plataforma para reservar espacios compartidos en instituciones, como salas de estudio, áreas comunes, gimnasios, laboratorios o auditorios.

- **Frontend**: SPA Angular con Tailwind y DaisyUI.
- **Backend**: Supabase (Postgres + Auth + Storage).
- **Deploy**: Google Cloud (Firebase Hosting / Cloud Run + Supabase).

## 🏗️ Arquitectura (Resumen)

### Frontend (Angular)

- Gestiona reservas, usuarios, calendarios y visualización de espacios.
- Consume Supabase mediante `@supabase/supabase-js`.
- UI moderna y responsiva con Tailwind + DaisyUI.

### Backend (Supabase)

- Base de datos Postgres.
- Autenticación.
- Reglas RLS.
- Storage para imágenes de espacios / instituciones.

### Comunicación

Cliente Angular ↔ Supabase REST / RPC / Storage.

## 🧩 Tecnologías y dependencias (versiones exactas)

### Frontend (submódulo Frontend/spacebook)

| Componente          | Versión        |
|---------------------|----------------|
| Angular             | ^20.0.0       |
| @angular/cli        | ^20.0.5       |
| TypeScript          | ~5.8.2        |
| RxJS                | ~7.8.0        |
| Zone.js             | ~0.15.0       |
| Supabase JS         | @supabase/supabase-js@^2.81.1 |
| Tailwind CSS        | ^4.1.17       |
| DaisyUI             | ^5.5.0        |
| PostCSS             | ^8.5.6        |
| Autoprefixer        | ^10.4.22      |

### Requerimientos de entorno

- Node.js: 18.x o 20.x
- npm: ≥ 9
- (Opcional) pnpm o yarn

## 🗃️ Modelo de Datos (ER)

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
    USUARIO ||--o{ RESERVA : "crea"
    RESERVA ||--o{ ESPACIOHORA : "incluye"
    ESPACIO ||--o{ COMENTARIO : "recibe"
    USUARIO ||--o{ COMENTARIO : "escribe"
    ESPACIO ||--o{ INCIDENCIA : "puede tener"
    USUARIO ||--o{ INCIDENCIA : "reporta"
    USUARIO ||--o{ NOTIFICACION : "recibe"
```

## 🗄️ Supabase: SQL y scripts

Dentro del submódulo `Frontend/spacebook` encontrarás archivos clave:

- 📄 `SUPABASE_ADMINISTRADOR_SETUP.sql`
- 📄 `SUPABASE_USUARIOS_SETUP.sql`
- 📘 `CONFIGURACION_RAPIDA_ROLES.md`

Estos scripts permiten:

- Crear tablas iniciales.
- Configurar autenticación.
- Asignar permisos y RLS.

Se ejecutan desde el panel SQL de Supabase.

## 💻 Desarrollo local

### 1️⃣ Clonar y traer submódulos

```bash
git clone https://github.com/vivileef/SPACEBOOK-Reservas-de-espacios-compartidos.git
cd SPACEBOOK-Reservas-de-espacios-compartidos
git submodule update --init --recursive
```

### 2️⃣ Instalar dependencias del frontend

```bash
cd frontend
npm install
npx ng serve --open
```

**App disponible en:**  
👉 [http://localhost:4200](http://localhost:4200)

## 🔄 Buenas prácticas con el submódulo

✓ Nunca editar archivos del frontend desde el repo padre.  
✓ Realizar cambios directamente en [Frontend GitHub](https://github.com/vivileef/Frontend).  
✓ Para actualizar la referencia:

```bash
cd frontend
git pull
cd ..
git add frontend
git commit -m "Update frontend submodule"
```

## ☁️ Despliegue en Google Cloud (usado en este proyecto)

SPACEBOOK se despliega en Google Cloud bajo el modelo:

- **Frontend Angular** → Google Cloud Hosting (Firebase Hosting o Cloud Storage + Load Balancer).
- **Backend** → Supabase (persistente, no hosteado en GCP).

### 🚀 Opción recomendada: Firebase Hosting (Google Cloud)

1. **Instalar Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Inicializar hosting en el submódulo frontend**
   ```bash
   cd frontend/spacebook
   firebase init hosting
   ```
   Configurar:
   - Use existing project (si ya está creado en Google Cloud).
   - Public directory → `dist/spacebook/browser`
   - SPA → Yes

3. **Build Angular**
   ```bash
   ng build
   ```

4. **Deploy**
   ```bash
   firebase deploy
   ```

**Resultado:**

- ✔ App pública en `https://<proyecto>.web.app`
- ✔ CDN global de Google
- ✔ HTTPS automático
- ✔ Caché optimizada para SPA

## 🧪 CI / CD (Sugerencias)

**GitHub Actions para Angular:**

```bash
npm ci
ng lint
ng test --watch=false --browsers=ChromeHeadless
ng build --configuration=production
```

**Deploy automático a Firebase Hosting mediante:**
```bash
firebase deploy --only hosting
```

## 🤝 Contribuir

### Para frontend

- Repositorio: [Frontend GitHub](https://github.com/vivileef/Frontend)
- Crear rama
- Hacer cambios
- PR → revisión → merge

### Para documentación del repo central

Abrir un Pull Request con la actualización requerida.

## 📅 Última actualización

24 de noviembre de 2025

---


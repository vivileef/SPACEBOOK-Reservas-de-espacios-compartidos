# 📅 Vista de Visualización de Disponibilidad de Espacios

## Descripción General

Esta es una vista completa y profesional para que el administrador del sistema visualice la disponibilidad de espacios a través de un calendario interactivo. La interfaz está completamente alineada con el diseño visual del proyecto, utilizando:

- **Framework**: Angular (standalone component)
- **Estilos**: Tailwind CSS + DaisyUI
- **Paleta de colores**: Rojo profesional (#DC2626 - red-700)
- **Diseño**: Moderno, limpio y totalmente responsivo

---

## 🎨 Características Principales

### 1. **Encabezado Contextual**
- Título prominente: "Disponibilidad de Espacios"
- Subtítulo descriptivo
- Diseño limpio y profesional

### 2. **Selector de Institución**
- Card visual con información de la institución seleccionada
- Diseño con gradiente rojo para destacar
- Muestra el nombre de la institución y campus

### 3. **Selectores de Sección y Espacio**
- **Secciones**: Auditorios, Aulas, Laboratorios, Salas de Reunión
- **Espacios**: Listado dinámico con capacidad
- Interfaz con botones estilizados
- Estados visuales: seleccionado (rojo) / no seleccionado (gris)
- Badges que muestran cantidad de espacios por sección

### 4. **Calendario Interactivo**
- Visualización mensual
- Navegación entre meses (botones anteriores/siguiente)
- Células de día con información de eventos:
  - **Ocupado**: Bloque rojo (#FEE2E2 con borde rojo)
  - **Disponible**: Bloque verde (#DCFCE7 con borde verde)
- Indicador visual del día actual (punto rojo)
- Eventos simulados con hora y descripción
- Información detallada en tooltip al pasar el mouse

### 5. **Panel Lateral de Detalles**
Muestra información del espacio seleccionado:
- **Nombre del espacio**
- **Estado** (Disponible/Ocupado con indicador de color)
- **Tipo** (Aula, Laboratorio, etc.)
- **Capacidad** (número de personas)
- **Sección** asociada
- **Institución** correspondiente
- **Amenidades**: Lista de servicios disponibles con checkmarks
- **Leyenda visual** de colores del calendario
- **Botones de acción**:
  - Editar Disponibilidad
  - Ver Reservas

### 6. **Leyenda del Calendario**
- Color de ocupado (rojo)
- Color de disponible (verde)
- Indicador del día actual

---

## 📁 Estructura de Archivos

```
src/app/spacebook/admin/page/visualizacion-disponibilidad/
├── visualizacion-disponibilidad.ts      # Componente (lógica)
├── visualizacion-disponibilidad.html    # Plantilla (vista)
└── visualizacion-disponibilidad.css     # Estilos personalizados
```

---

## 💻 Uso del Componente

### Importación en las rutas

El componente ya está registrado en `app.routes.ts`:

```typescript
{
    path: 'visualizacion-disponibilidad',
    component: VisualizacionDisponibilidadComponent
}
```

### Navegación

El administrador puede acceder desde:
- **Menú lateral** del dashboard admin
- **URL directa**: `/admin-dashboard/visualizacion-disponibilidad`

---

## 🎯 Detalles Técnicos

### Componente (TypeScript)

El archivo `visualizacion-disponibilidad.ts` incluye:

**Interfaces:**
- `CalendarDay`: Estructura de un día del calendario
- `CalendarEvent`: Estructura de un evento/reserva

**Propiedades principales:**
- `selectedInstitution`: Institución seleccionada
- `selectedSection`: Sección seleccionada
- `selectedSpace`: Espacio seleccionado
- `institutions[]`: Lista de instituciones
- `sections[]`: Lista de secciones
- `spaces[]`: Lista de espacios
- `calendarDays[]`: Array de días del calendario generado
- `selectedSpaceDetails`: Detalles del espacio seleccionado

**Métodos:**
- `generateCalendar()`: Genera la estructura del calendario del mes actual
- `generateDayEvents()`: Simula eventos para ciertos días
- `previousMonth()`: Navega al mes anterior
- `nextMonth()`: Navega al mes siguiente
- `selectSection()`: Selecciona una sección
- `selectSpace()`: Selecciona un espacio y actualiza detalles
- `getEventColor()`: Retorna clases CSS según estado del evento
- `getStatusColor()`: Retorna clases CSS según estado del espacio

### Plantilla (HTML)

**Estructura de Grid:**
```
├── Header (Título)
├── Grid Principal (3 columnas en desktop)
│   ├── Columna Principal (2/3)
│   │   ├── Card Institución
│   │   ├── Card Secciones + Espacios
│   │   └── Card Calendario
│   └── Sidebar (1/3)
│       └── Card Detalles del Espacio
```

### Estilos (CSS)

**Características principales:**
- Animaciones suaves (`fadeIn`, `pulse`)
- Scroll personalizado (scrollbar rojo)
- Transiciones en 300ms
- Efectos hover profesionales
- Media queries para responsividad
- Accesibilidad (focus-visible)

---

## 🔄 Datos Estáticos (Simulados)

El componente incluye datos estáticos para demostración:

**Instituciones:**
- Universidad Nacional de Colombia
- Colegio Técnico
- Centro Empresarial

**Secciones:**
- Auditorios (3 espacios)
- Aulas (15 espacios)
- Laboratorios (8 espacios)
- Salas de Reunión (5 espacios)

**Espacios (Auditorios):**
- Auditorio Principal (500 personas)
- Auditorio 2 (300 personas)
- Auditorio 3 (200 personas)

**Eventos simulados:**
- Distribuidos en días específicos del mes
- Con horarios y estados (ocupado/disponible)

---

## 📱 Responsividad

El diseño es completamente responsivo:

| Dispositivo | Comportamiento |
|---|---|
| **Desktop (lg)** | Grid 3 columnas: Calendario (2 cols) + Sidebar (1 col) |
| **Tablet (md)** | Grid 2 columnas: Selectores lado a lado |
| **Mobile (sm)** | Grid 1 columna: Layout apilado verticalmente |

---

## 🎨 Paleta de Colores

| Color | Uso |
|---|---|
| `red-700` (#DC2626) | Colores principales, header, botones activos |
| `red-100` (#FEE2E2) | Fondo de eventos ocupados |
| `red-200` (#FECACA) | Bordes de eventos ocupados |
| `red-600` (#E5393C) | Hover de botones |
| `green-100` (#DCFCE7) | Fondo de eventos disponibles |
| `green-300` (#86EFAC) | Bordes de eventos disponibles |
| `green-600` (#16A34A) | Texto de eventos disponibles |
| `gray-50/100` | Fondos claros |
| `gray-900` | Texto principal |
| `gray-600` | Texto secundario |

---

## 🔮 Mejoras Futuras

Cuando se integre el backend, se puede:

1. **Conectar a API**: Reemplazar datos estáticos con datos reales
2. **Filtros dinámicos**: Hacer funcionales los selectores de institución/sección/espacio
3. **Eventos reales**: Mostrar reservas actuales de la base de datos
4. **Interactividad**: Permitir crear/editar disponibilidad desde el calendario
5. **Exportación**: Agregar opción para descargar calendario en PDF
6. **Notificaciones**: Mostrar alertas de cambios de disponibilidad
7. **Vistas adicionales**: Agregar vista semanal o diaria

---

## 🚀 Instrucciones de Uso

### Para visualizar la componente:

1. Navega a `/admin-dashboard/visualizacion-disponibilidad`
2. O haz clic en "Disponibilidad" en el menú lateral

### Interacción estática actual:

- ✅ Cambiar entre secciones (visual)
- ✅ Cambiar entre espacios (actualiza detalles)
- ✅ Navegar meses (anterior/siguiente)
- ✅ Efectos hover en botones y calendario
- ✅ Ver detalles del espacio en sidebar

### No funcional todavía:

- ❌ Conexión a base de datos
- ❌ Crear/editar eventos
- ❌ Guardar cambios de disponibilidad
- ❌ Sincronización con backend

---

## 📚 Referencias de Tecnologías

- **Angular 17+**: [angular.io](https://angular.io)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com)
- **DaisyUI**: [daisyui.com](https://daisyui.com)

---

## ✅ Checklist de Validación

- ✅ Componente creado como standalone
- ✅ HTML separado en archivo `.html`
- ✅ CSS separado en archivo `.css`
- ✅ Totalmente responsivo
- ✅ Coherente con diseño del proyecto
- ✅ Sin errores de compilación
- ✅ Integrado en rutas
- ✅ Accesible (accesibilidad)
- ✅ Documentado completamente

---

## 📞 Soporte

Si necesitas realizar cambios o agregar funcionalidad, los archivos están completamente comentados y son fáciles de mantener y extender.

**Creado con ❤️ para SpaceBook Admin Panel**

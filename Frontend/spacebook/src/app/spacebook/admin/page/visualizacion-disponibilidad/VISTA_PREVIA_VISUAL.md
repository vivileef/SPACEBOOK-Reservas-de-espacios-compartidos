# 🎨 VISTA PREVIA VISUAL - Disponibilidad de Espacios

## Estructura Visual Completa

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│  DISPONIBILIDAD DE ESPACIOS                                                  │
│  Visualización general de horarios y reservas en formato calendario        │
│                                                                               │
├─────────────────────────────────────────┬───────────────────────────────────┤
│                                         │                                   │
│  ┌─────────────────────────────────┐  │  ┌─────────────────────────────┐  │
│  │ INSTITUCIÓN                      │  │  │                             │  │
│  ├─────────────────────────────────┤  │  │  AUDITORIO PRINCIPAL        │  │
│  │ 🏢 Universidad Nacional de Colom │  │  │  ● Disponible               │  │
│  │    Campus Principal              │  │  ├─────────────────────────────┤  │
│  └─────────────────────────────────┘  │  │ Tipo: Auditorio             │  │
│                                        │  │ Capacidad: 500 personas     │  │
│  ┌─────────────────────────────────┐  │  │ Sección: Auditorios         │  │
│  │ SECCIONES        ESPACIOS        │  │  │ Institución: Universidad... │  │
│  ├─────────────────────────────────┤  │  ├─────────────────────────────┤  │
│  │ ┌─────────────────────────────┐ │  │  │ AMENIDADES                  │  │
│  │ │ ✓ Auditorios (3)            │ │  │  │ ✓ Proyector                 │  │
│  │ ├─────────────────────────────┤ │  │  │ ✓ Sonido Profesional        │  │
│  │ │   Auditorio Principal ⓘ   │ │  │  │ ✓ Aire Acondicionado        │  │
│  │ │   Auditorio 2 (300)         │ │  │  │ ✓ WiFi                      │  │
│  │ │   Auditorio 3 (200)         │ │  │  ├─────────────────────────────┤  │
│  │ └─────────────────────────────┘ │  │  │ LEYENDA                     │  │
│  │                                 │  │  │ ⬛ Ocupado                   │  │
│  │ ┌─────────────────────────────┐ │  │  │ ⬜ Disponible               │  │
│  │ │   Aulas (15)                │ │  │  │ ● Hoy                       │  │
│  │ │   Laboratorios (8)          │ │  │  ├─────────────────────────────┤  │
│  │ │   Salas de Reunión (5)      │ │  │  │ [📝 Editar Disponibilidad]  │  │
│  │ └─────────────────────────────┘ │  │  │ [↩️ Ver Reservas]            │  │
│  └─────────────────────────────────┘  │  └─────────────────────────────┘  │
│                                        │                                   │
│  ┌─────────────────────────────────┐  │                                   │
│  │ CALENDARIO - NOVIEMBRE 2024      │  │                                   │
│  ├──────────────────────────────────┤  │                                   │
│  │ ◀ Noviembre 2024 ▶              │  │                                   │
│  ├────┬────┬────┬────┬────┬────┬────┤  │                                   │
│  │ Do │ Lu │ Ma │ Mi │ Ju │ Vi │ Sa │  │                                   │
│  ├────┼────┼────┼────┼────┼────┼────┤  │                                   │
│  │ 27 │ 28 │ 29 │ 30 │ 31 │  1 │  2 │  │                                   │
│  │    │    │    │    │    │    │    │  │                                   │
│  ├────┼────┼────┼────┼────┼────┼────┤  │                                   │
│  │  3 │  4 │  5 │  6 │  7 │  8 │  9 │  │                                   │
│  │    │    │ 🔴 │    │    │    │    │  │                                   │
│  │    │    │10:│    │    │    │    │  │                                   │
│  │    │    │Con│    │    │    │    │  │                                   │
│  ├────┼────┼────┼────┼────┼────┼────┤  │                                   │
│  │ 10 │ 11 │ 12 │ 13 │ 14 │ 15 │ 16 │  │                                   │
│  │ 🔴 │    │    │ ● │    │ 🔴 │    │  │                                   │
│  │09:│    │    │   │    │11:│    │  │                                   │
│  │Clas│    │    │   │    │Eve│    │  │                                   │
│  ├────┼────┼────┼────┼────┼────┼────┤  │                                   │
│  │ 17 │ 18 │ 19 │ 20 │ 21 │ 22 │ 23 │  │                                   │
│  │    │    │    │ 🟢 │    │    │    │  │                                   │
│  │    │    │    │15:│    │    │    │  │                                   │
│  │    │    │    │Dis│    │    │    │  │                                   │
│  ├────┼────┼────┼────┼────┼────┼────┤  │                                   │
│  │ 24 │ 25 │ 26 │ 27 │ 28 │ 29 │ 30 │  │                                   │
│  │    │ 🔴 │    │    │ 🟢 │    │    │  │                                   │
│  │    │08:│    │    │13:│    │    │  │                                   │
│  │    │Cap│    │    │Dis│    │    │  │                                   │
│  └────┴────┴────┴────┴────┴────┴────┘  │                                   │
│                                        │                                   │
│  Leyenda:                               │                                   │
│  ⬛ Ocupado    ⬜ Disponible    ● Hoy   │                                   │
│                                        │                                   │
└─────────────────────────────────────────┴───────────────────────────────────┘
```

---

## 📱 Vista Responsiva en Dispositivos Móviles

```
┌─────────────────────────────┐
│                             │
│ DISPONIBILIDAD DE ESPACIOS  │
│ Visualización general...    │
│                             │
├─────────────────────────────┤
│  INSTITUCIÓN                │
│  🏢 Universidad Nacional     │
│     Campus Principal        │
├─────────────────────────────┤
│  SECCIONES                  │
│  ┌──────────────────────┐   │
│  │ ✓ Auditorios (3)     │   │
│  ├──────────────────────┤   │
│  │ ✓ Aulas (15)         │   │
│  │   Laboratorios (8)   │   │
│  │   Salas (5)          │   │
│  └──────────────────────┘   │
├─────────────────────────────┤
│  ESPACIOS                   │
│  ┌──────────────────────┐   │
│  │ Auditorio Principal  │   │
│  │ Cap: 500 personas    │   │
│  ├──────────────────────┤   │
│  │ Auditorio 2 (300)    │   │
│  │ Auditorio 3 (200)    │   │
│  └──────────────────────┘   │
├─────────────────────────────┤
│  CALENDARIO                 │
│  ◀ Noviembre 2024 ▶        │
│                             │
│  Do Lu Ma Mi Ju Vi Sa       │
│  [calendar grid...]         │
│                             │
│  Leyenda:                   │
│  ⬛ Ocupado ⬜ Disponible    │
├─────────────────────────────┤
│  DETALLES DEL ESPACIO       │
│  🔴 Auditorio Principal     │
│  Estado: Disponible         │
│  Tipo: Auditorio            │
│  Cap: 500 personas          │
│  Sección: Auditorios        │
│  Amenidades:                │
│  ✓ Proyector                │
│  ✓ Sonido Pro...            │
│  [Editar Disponibilidad]    │
│  [Ver Reservas]             │
└─────────────────────────────┘
```

---

## 🎨 Paleta de Colores Utilizada

### Colores Principales
- **Rojo Principal**: `#DC2626` (red-700) - Encabezados, botones activos
- **Rojo Secundario**: `#EF4444` (red-500) - Botones hover
- **Rojo Oscuro**: `#991B1B` (red-900) - Fondos hover oscuros

### Colores de Estados
- **Ocupado (Rojo)**
  - Fondo: `#FEE2E2` (red-100)
  - Borde: `#FECACA` (red-200)
  - Texto: `#991B1B` (red-900)

- **Disponible (Verde)**
  - Fondo: `#DCFCE7` (green-100)
  - Borde: `#BBF7D0` (green-200)
  - Texto: `#166534` (green-900)

### Colores Neutrales
- **Fondo Principal**: `#F9FAFB` (gray-50)
- **Fondo Secundario**: `#F3F4F6` (gray-100)
- **Texto Principal**: `#111827` (gray-900)
- **Texto Secundario**: `#6B7280` (gray-500)
- **Bordes**: `#E5E7EB` (gray-200)

---

## 🖱️ Interacciones de Usuario

### 1. Seleccionar Institución
- Visualizar institución en dropdown
- Actualizar datos de secciones y espacios
- (Actualmente estático)

### 2. Seleccionar Sección
```
Usuarios hace clic en → "Auditorios"
                      ↓
         Botón pasa a color rojo
                      ↓
        Se muestran espacios de esa sección
```

### 3. Seleccionar Espacio
```
Usuarios hace clic en → "Auditorio Principal"
                      ↓
         Botón pasa a color rojo
                      ↓
      Panel lateral se actualiza con detalles
```

### 4. Navegar Calendario
```
Usuarios hace clic en → [◀ o ▶]
                      ↓
         Calendario muestra mes anterior/siguiente
                      ↓
      Eventos se actualizan automáticamente
```

### 5. Eventos en Calendario
```
Usuarios pasa mouse sobre → "10:00-12:00 Reunión"
                           ↓
              Se muestra tooltip con detalles
                           ↓
                Sombra se anima suavemente
```

---

## ✨ Características de Diseño

### Tipografía
- **Encabezados (H1)**: 36px, Bold, gray-900
- **Encabezados (H2)**: 24px, Bold, gray-900
- **Subtítulos**: 18px, Semibold, gray-700
- **Texto Normal**: 16px, Regular, gray-900
- **Texto Pequeño**: 12px, Regular, gray-600
- **Etiquetas**: 12px, Bold, gray-500

### Espaciado
- **Padding de Cards**: 24px
- **Gap entre elementos**: 24px
- **Padding de botones**: 12px 16px
- **Bordes redondeados**: 8px (base), 12px (cards)

### Sombras
- **Card base**: 0 4px 6px rgba(0,0,0,0.07)
- **Card hover**: 0 10px 15px rgba(0,0,0,0.1)
- **Botón base**: Sin sombra
- **Botón hover**: Sombra suave

### Transiciones
- **Duración estándar**: 200ms, 300ms
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Propiedades**: color, background, shadow, border

---

## 📊 Datos de Ejemplo Mostrados

### Instituciones
1. **Universidad Nacional de Colombia**
   - Campus Principal
   
2. **Colegio Técnico**
3. **Centro Empresarial**

### Secciones
| Nombre | Espacios |
|--------|----------|
| Auditorios | 3 |
| Aulas | 15 |
| Laboratorios | 8 |
| Salas de Reunión | 5 |

### Espacios (Auditorios)
| Nombre | Capacidad | Tipo |
|--------|-----------|------|
| Auditorio Principal | 500 | Auditorio |
| Auditorio 2 | 300 | Auditorio |
| Auditorio 3 | 200 | Auditorio |

### Eventos Simulados
| Fecha | Hora | Estado | Título |
|-------|------|--------|--------|
| 1 nov | 10:00-12:00 | Ocupado | Reunión |
| 5 nov | 14:00-16:00 | Ocupado | Conferencia |
| 10 nov | 09:00-11:00 | Ocupado | Clase |
| 10 nov | 14:00-16:00 | Disponible | Disponible |
| 15 nov | 11:00-13:00 | Ocupado | Evento |
| 20 nov | 15:00-17:00 | Disponible | Disponible |
| 25 nov | 08:00-10:00 | Ocupado | Capacitación |
| 25 nov | 10:30-12:30 | Ocupado | Reunión |
| 28 nov | 13:00-15:00 | Disponible | Disponible |

### Amenidades del Espacio
- ✓ Proyector
- ✓ Sonido Profesional
- ✓ Aire Acondicionado
- ✓ WiFi

---

## 🔄 Flujo de Usuario Típico

```
1. Administrador accede al dashboard
        ↓
2. Navega a "Disponibilidad" en el menú
        ↓
3. Selecciona una institución (estático)
        ↓
4. Elige una sección (Ej: Auditorios)
        ↓
5. Selecciona un espacio específico
        ↓
6. Visualiza el calendario del mes actual
        ↓
7. Observa disponibilidad en colores:
   - ROJO: Ocupado
   - VERDE: Disponible
        ↓
8. (Futuro) Hace clic en "Editar Disponibilidad" 
   para cambiar horarios
        ↓
9. (Futuro) Hace clic en "Ver Reservas" para 
   detalles de reservaciones
```

---

## 📐 Layout Responsivo

### Desktop (1024px+)
- Calendario ocupa 2/3 del ancho
- Panel lateral ocupa 1/3 del ancho
- Sticky position en sidebar para fácil acceso

### Tablet (768px - 1023px)
- Selectores uno al lado del otro
- Calendario a ancho completo en su sección
- Panel lateral debajo

### Mobile (< 768px)
- Todo en una sola columna
- Panel lateral se muestra al final
- Botones de navegación más grandes
- Calendario con scroll horizontal si es necesario

---

## 🎯 Elementos Interactivos (Estáticos)

✅ **Funcionales ahora:**
- Navegación entre meses
- Selección de secciones (visual)
- Selección de espacios (actualiza sidebar)
- Hover en botones y calendario
- Tooltip en eventos

❌ **No funcional (requiere backend):**
- Guardar cambios de disponibilidad
- Crear nuevas reservas
- Eliminar eventos
- Sincronización con base de datos
- Filtros dinámicos

---

**Creado con ❤️ para SpaceBook Admin Panel**

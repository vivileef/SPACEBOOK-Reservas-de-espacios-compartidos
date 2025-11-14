# 🎬 DEMO VISUAL: Editar Disponibilidad

## Pantalla 1: Vista Principal

```
┌────────────────────────────────────────────────────────────────────┐
│                  DISPONIBILIDAD DE ESPACIOS                        │
│                                                                    │
├───────────────────────────────────────────┬─────────────────────┤
│                                           │                     │
│  CALENDARIO                               │  DETALLES DEL       │
│  ┌─────────────────────────────┐         │  ESPACIO            │
│  │ ◀ Noviembre 2024 ▶          │         │                     │
│  │                             │         │  🔴 Auditorio      │
│  │ Do Lu Ma Mi Ju Vi Sa        │         │  Principal          │
│  │  1  2  3  4  5  6  7        │         │  ● Disponible       │
│  │  8  9 10 11 12 13 14        │         │                     │
│  │ 15 16 17 18 19 20 21        │         │  Tipo: Auditorio    │
│  │ 22 23 24 25 26 27 28        │         │  Cap: 500 personas  │
│  │ 29 30                       │         │                     │
│  │                             │         │  Amenidades:        │
│  │  Leyenda:                   │         │  ✓ Proyector        │
│  │  🔴 Ocupado 🟢 Disponible   │         │  ✓ Sonido Pro       │
│  └─────────────────────────────┘         │  ✓ Aire Acond.      │
│                                           │  ✓ WiFi             │
│                                           │                     │
│                                           │ ┌─────────────────┐ │
│                                           │ │ 📝 EDITAR       │ │ ← Usuario hace clic
│                                           │ │ DISPONIBILIDAD  │ │
│                                           │ └─────────────────┘ │
│                                           │ ┌─────────────────┐ │
│                                           │ │ ↩️  Ver Reservas │ │
│                                           │ └─────────────────┘ │
└───────────────────────────────────────────┴─────────────────────┘
```

---

## Pantalla 2: Modal Abierto

```
                    ┌─────────────────────────────────┐
                    │ ✕ EDITAR DISPONIBILIDAD        │
                    │   Auditorio Principal           │
                    ├─────────────────────────────────┤
                    │                                 │
                    │ 📅 Fecha *                      │
                    │ ┌─────────────────────────────┐ │
                    │ │ Selecciona una fecha    ▼   │ │
                    │ │ 01/11/2024              │   │ │
                    │ │ 02/11/2024              │   │ │
                    │ │ 03/11/2024              │   │ │
                    │ │ 04/11/2024              │   │ │
                    │ │ 05/11/2024              │   │ │
                    │ │ ...                     │   │ │
                    │ │ 15/11/2024 ← SELECCIONA│   │ │
                    │ │ ...                     │   │ │
                    │ └─────────────────────────────┘ │
                    │                                 │
                    │ ⏰ Hora de Inicio *             │
                    │ ┌─────────────────────────────┐ │
                    │ │ 00:00                   ▼   │ │
                    │ │ 01:00                       │ │
                    │ │ ...                         │ │
                    │ │ 09:00                   ✓   │ │
                    │ │ ...                         │ │
                    │ │ 14:00 ← SELECCIONA      │   │ │
                    │ │ ...                         │ │
                    │ └─────────────────────────────┘ │
                    │                                 │
                    │ ⏰ Hora de Fin *                │
                    │ ┌─────────────────────────────┐ │
                    │ │ 00:00                   ▼   │ │
                    │ │ 01:00                       │ │
                    │ │ ...                         │ │
                    │ │ 16:00 ← SELECCIONA          │ │
                    │ │ 17:00                       │ │
                    │ │ ...                         │ │
                    │ └─────────────────────────────┘ │
                    │                                 │
                    │ ✓ Estado *                      │
                    │ ┌─────────────────────────────┐ │
                    │ │ 🔴 Ocupado        →     │   │ │
                    │ └─────────────────────────────┘ │
                    │                                 │
                    │ 💬 Descripción (Opcional)       │
                    │ ┌─────────────────────────────┐ │
                    │ │ Conferencia...              │ │
                    │ └─────────────────────────────┘ │
                    │                                 │
                    │ ℹ️ Los cambios se guardarán    │
                    │    en el calendario.            │
                    │                                 │
                    ├─────────────────────────────────┤
                    │ [Cancelar]  [Guardar Cambios]  │
                    └─────────────────────────────────┘
```

---

## Pantalla 3: Evento Agregado

```
┌────────────────────────────────────────────────────────────────────┐
│                  DISPONIBILIDAD DE ESPACIOS                        │
│                                                                    │
├───────────────────────────────────────────┬─────────────────────┤
│                                           │                     │
│  CALENDARIO (ACTUALIZADO)                 │  DETALLES DEL       │
│  ┌─────────────────────────────┐         │  ESPACIO            │
│  │ ◀ Noviembre 2024 ▶          │         │                     │
│  │                             │         │  🔴 Auditorio      │
│  │ Do Lu Ma Mi Ju Vi Sa        │         │  Principal          │
│  │  1  2  3  4  5  6  7        │         │  ● Disponible       │
│  │  8  9 10 11 12 13 14        │         │                     │
│  │  15 16 17 18 19 20 21       │         │  Tipo: Auditorio    │
│  │ 🔴 14:00-16:00        │     │         │  Cap: 500 personas  │
│  │ Conferencia        │         │         │                     │
│  │  22 23 24 25 26 27 28       │         │  Amenidades:        │
│  │ 29 30                       │         │  ✓ Proyector        │
│  │                             │         │  ✓ Sonido Pro       │
│  │  Leyenda:                   │         │  ✓ Aire Acond.      │
│  │  🔴 Ocupado 🟢 Disponible   │         │  ✓ WiFi             │
│  └─────────────────────────────┘         │                     │
│                                           │ ┌─────────────────┐ │
│                                           │ │ 📝 EDITAR       │ │
│                                           │ │ DISPONIBILIDAD  │ │
│                                           │ └─────────────────┘ │
│                                           │ ┌─────────────────┐ │
│                                           │ │ ↩️  Ver Reservas │ │
│                                           │ └─────────────────┘ │
└───────────────────────────────────────────┴─────────────────────┘

                        ↓
            
        ✅ CONFIRMACIÓN MOSTRADA:
        
        ┌─────────────────────────────┐
        │  ✓ Disponibilidad guardada  │
        │                             │
        │  Auditorio Principal        │
        │  15/11/2024                 │
        │  14:00 - 16:00              │
        │  Estado: Ocupado            │
        │                             │
        │         [ACEPTAR]           │
        └─────────────────────────────┘
```

---

## Interacciones Detalladas

### 1️⃣ Abrir Modal

```
Usuario hace clic en "Editar Disponibilidad"
                        ↓
      Modal se abre con animación slideInScale
                        ↓
           Se muestra el formulario vacío
```

**Animación:**
```css
@keyframes slideInScale {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
Duration: 300ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

---

### 2️⃣ Completar Formulario

```
Usuario selecciona fecha:          15/11/2024
Usuario selecciona inicio:         14:00
Usuario selecciona fin:            16:00
Usuario selecciona estado:         Ocupado (rojo)
Usuario ingresa descripción:       "Conferencia"

El estado cambia visualmente:
┌─────────────────────────────┐     ┌─────────────────────────────┐
│ 🟢 Disponible        →   │  →  │ 🔴 Ocupado           →   │
└─────────────────────────────┘     └─────────────────────────────┘
```

---

### 3️⃣ Guardar Evento

```
Usuario hace clic en "Guardar Cambios"
                        ↓
    Sistema valida todos los campos
                        ↓
        Crea CalendarEvent con los datos
                        ↓
    Agrega el evento al día en calendarDays
                        ↓
          Muestra confirmación (alert)
                        ↓
            Cierra el modal automáticamente
                        ↓
       Calendario se actualiza visualmente
```

---

### 4️⃣ Cerrar Modal

El usuario puede cerrar de 3 formas:

```
1. Haciendo clic en X
   (arriba a la derecha)
                ↓
        Modal se cierra sin guardar

2. Haciendo clic en "Cancelar"
                ↓
        Modal se cierra sin guardar

3. Haciendo clic fuera del modal
   (en el fondo oscuro)
                ↓
        Modal se cierra sin guardar
        (Nota: Esta opción puede desactivarse)
```

---

## Estados Visuales

### Estado del Botón

```
REPOSO                  HOVER                   CLICK
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ 📝 EDITAR       │  │ 📝 EDITAR       │  │ 📝 EDITAR       │
│ DISPONIBILIDAD  │  │ DISPONIBILIDAD  │  │ DISPONIBILIDAD  │
│ (rojo-700)      │  │ (rojo-800)      │  │ (rojo-900)      │
│ sin sombra      │  │ sombra suave    │  │ sombra media    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Estado del Select

```
REPOSO                  HOVER                   FOCUS
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Selecciona  ▼   │  │ Selecciona  ▼   │  │ Selecciona  ▼   │
│ (gris-300)      │  │ (rojo-400)      │  │ (rojo-700)      │
│ borde gris      │  │ bg rojo claro   │  │ sombra rojo     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Toggle de Estado

```
ANTES                           DESPUÉS DE CLICK
┌─────────────────────────┐  ┌─────────────────────────┐
│ 🟢 Disponible      →    │  │ 🔴 Ocupado         →    │
│ (bg verde)              │  │ (bg rojo)               │
│ (texto verde)           │  │ (texto rojo)            │
└─────────────────────────┘  └─────────────────────────┘
```

---

## Mensajes al Usuario

### Validación Exitosa

```
✅ Disponibilidad guardada exitosamente

Auditorio Principal
15/11/2024
14:00 - 16:00
Estado: Ocupado
```

### Errores de Validación

```
❌ Por favor completa todos los campos requeridos

(Mostraría este mensaje si falta algún campo obligatorio)
```

```
❌ Fecha inválida. Por favor selecciona una fecha válida del calendario.

(Si la fecha no existe en el calendario)
```

---

## Animaciones en Acción

### 1. Apertura del Modal

```
Frame 1:   opacity: 0,   scale: 0.95,   translateY: -20px
           (no visible)

Frame 50%: opacity: 0.5, scale: 0.97,   translateY: -10px
           (apareciendo)

Frame 100: opacity: 1,   scale: 1,      translateY: 0
           (completamente visible)
```

**Duración:** 300ms  
**Transición:** suave

---

### 2. Cambio de Estado

```
Usuario hace clic en toggle
           ↓
Input cambia: available → occupied
           ↓
DOM re-renderiza con [ngClass]
           ↓
Nuevas clases (red en vez de green)
           ↓
Transición CSS 200ms
           ↓
Color cambia suavemente
```

---

## Flujo Completo de Usuario

```
1. VISTA INICIAL
   └─ Usuario ve el panel lateral
   └─ Botón "Editar Disponibilidad" está visible

2. CLIC EN BOTÓN
   └─ Usuario hace clic
   └─ openEditModal() se ejecuta
   └─ showEditModal = true
   └─ Modal aparece con animación

3. RELLENAR FORMULARIO
   └─ Usuario selecciona fecha: 15/11/2024
   └─ Usuario selecciona inicio: 14:00
   └─ Usuario selecciona fin: 16:00
   └─ Usuario cambia estado: Ocupado
   └─ Usuario escribe descripción: "Conferencia"

4. GUARDAR CAMBIOS
   └─ Usuario hace clic en "Guardar Cambios"
   └─ saveAvailability() valida datos
   └─ Si válido: crea CalendarEvent
   └─ Agrega a calendarDays[dayIndex].events
   └─ Muestra confirmación
   └─ closeEditModal() se ejecuta
   └─ showEditModal = false
   └─ Modal desaparece

5. RESULTADO
   └─ Evento visible en calendario
   └─ Color rojo (ocupado)
   └─ Hora: 14:00-16:00
   └─ Título: Conferencia
```

---

## Casos de Uso

### Caso 1: Reservar Auditorio

```
Objetivo: Marcar el Auditorio Principal como ocupado el 20 de noviembre

Pasos:
1. Seleccionar "Auditorio Principal"
2. Clic en "Editar Disponibilidad"
3. Fecha: 20/11/2024
4. Inicio: 10:00
5. Fin: 12:00
6. Estado: Ocupado
7. Descripción: "Reunión Ejecutiva"
8. Guardar

Resultado: 
- Evento aparece en calendario con color rojo
- Hora: 10:00-12:00
- Se ve: "Reunión Ejecutiva"
```

### Caso 2: Marcar como Disponible

```
Objetivo: Liberar el horario 15:00-18:00 el 25 de noviembre

Pasos:
1. Seleccionar espacio
2. Clic en "Editar Disponibilidad"
3. Fecha: 25/11/2024
4. Inicio: 15:00
5. Fin: 18:00
6. Estado: Disponible
7. Descripción: (dejar vacío)
8. Guardar

Resultado:
- Evento aparece en calendario con color verde
- Hora: 15:00-18:00
- Se ve: "Disponible"
```

---

## 🎨 Paleta de Colores del Modal

```
Header:           Rojo (red-700 → red-600)
Fondo:            Blanco
Borde inputs:     Gris-300 (reposo) → Rojo-700 (focus)
BG inputs hover:  Rojo-50
BG ocupado:       Rojo-50
BG disponible:    Verde-50
Botón primario:   Rojo-700
Botón secundario: Gris-100
Sombra:           Negra con opacidad
```

---

**¡Así funciona la nueva característica!** 🚀

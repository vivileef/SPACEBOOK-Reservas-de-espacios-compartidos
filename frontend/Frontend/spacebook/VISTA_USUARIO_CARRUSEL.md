# 🎠 Vista de Usuario con Carruseles - Implementación

## ✅ Resumen de Cambios

Se ha actualizado la **vista de usuario** (`catalogo-espacios`) para mostrar:
1. **Carrusel de imágenes** de la institución seleccionada
2. **Organización por secciones** con cards individuales
3. **Carrusel de imágenes por cada sección**
4. **Espacios organizados** dentro de cada sección con diseño mejorado

---

## 🎯 Características Implementadas

### 1️⃣ **Carrusel de Institución**

#### Ubicación
- Se muestra inmediatamente después del header con el nombre de la institución
- Ocupa todo el ancho de la pantalla con altura de 384px (h-96)

#### Funcionalidades
- ✅ Navegación con botones anterior/siguiente
- ✅ Indicadores de posición (dots) clickeables
- ✅ Contador de imágenes (ej: "2 / 5")
- ✅ Diseño responsivo
- ✅ Transiciones suaves entre imágenes

#### Controles
```typescript
siguienteImagenInstitucion()   // Avanza a la siguiente imagen
anteriorImagenInstitucion()    // Retrocede a la imagen anterior
irAImagenInstitucion(indice)   // Salta a una imagen específica
```

### 2️⃣ **Organización por Secciones**

#### Layout de Cada Sección
- **Card principal** con 2 columnas (grid responsive)
- **Columna izquierda (2/5)**: Información y carrusel de la sección
- **Columna derecha (3/5)**: Grid de espacios disponibles

#### Información Mostrada
- ✅ Nombre de la sección
- ✅ Tipo de sección
- ✅ Capacidad total
- ✅ Calificación con estrellas visuales (⭐)
- ✅ Contador de espacios disponibles
- ✅ Amenidades con badges
- ✅ Carrusel de imágenes de la sección

### 3️⃣ **Carrusel por Sección**

#### Características
- Carrusel independiente para cada sección
- Altura de 192px (h-48)
- Controles propios (anterior/siguiente)
- Indicadores de posición
- Contador de imágenes

#### Estado Independiente
```typescript
indicesImagenesSeccion: Map<string, number>  // Mantiene índice por sección
obtenerIndiceImagenSeccion(seccionId)        // Obtiene índice actual
siguienteImagenSeccion(seccion)              // Avanza imagen
anteriorImagenSeccion(seccion)               // Retrocede imagen
irAImagenSeccion(seccionId, indice)         // Salta a imagen
```

### 4️⃣ **Visualización de Espacios**

#### Diseño
- Grid de 2 columnas (responsive)
- Cards individuales por espacio
- Altura máxima con scroll (max-h-96)
- Bordes de color según disponibilidad

#### Estados Visuales
- 🟢 **Verde**: Espacio disponible
- 🔴 **Rojo**: Espacio ocupado
- ⚪ **Gris**: Estado indefinido

#### Información por Espacio
- Nombre del espacio
- Badge de estado (Disponible/Ocupado)
- Botón de reserva (habilitado solo si disponible)

---

## 📁 Archivos Modificados

### `catalogo-espacios.ts`

#### Nuevas Propiedades
```typescript
// Carrusel de imágenes institución
indiceImagenInstitucion = signal(0);

// Carrusel de imágenes por sección
indicesImagenesSeccion = new Map<string, number>();
```

#### Nuevos Métodos

**Carrusel de Institución:**
```typescript
siguienteImagenInstitucion(): void
anteriorImagenInstitucion(): void
irAImagenInstitucion(indice: number): void
```

**Carrusel de Secciones:**
```typescript
obtenerIndiceImagenSeccion(seccionId: string): number
siguienteImagenSeccion(seccion: Seccion): void
anteriorImagenSeccion(seccion: Seccion): void
irAImagenSeccion(seccionId: string, indice: number): void
```

**Utilidades:**
```typescript
obtenerEspaciosDeSeccion(seccionId: string): Espacio[]
contarEspaciosDisponibles(seccionId: string): number
```

### `catalogo-espacios.html`

#### Estructura Actualizada
```html
<div class="space-y-6">
  <!-- Header con botón volver -->
  
  <!-- Carrusel de imágenes de la institución -->
  <div class="relative h-96">
    <img [src]="imagen_actual" />
    <!-- Botones navegación -->
    <!-- Indicadores -->
    <!-- Contador -->
  </div>
  
  <!-- Secciones -->
  <div class="space-y-6">
    @for (seccion of secciones()) {
      <div class="grid grid-cols-1 lg:grid-cols-5">
        <!-- Columna izquierda: Info + Carrusel -->
        <div class="lg:col-span-2">
          <!-- Info sección -->
          <!-- Amenidades -->
          <!-- Carrusel sección -->
        </div>
        
        <!-- Columna derecha: Espacios -->
        <div class="lg:col-span-3">
          <div class="grid grid-cols-1 sm:grid-cols-2">
            @for (espacio of obtenerEspaciosDeSeccion(seccion.seccionid)) {
              <!-- Card de espacio -->
            }
          </div>
        </div>
      </div>
    }
  </div>
</div>
```

---

## 🎨 Diseño y UX

### Paleta de Colores
- **Carrusel**: Controles negros con opacidad, overlay sutil
- **Secciones**: Fondo blanco con sombra
- **Espacios**: Bordes de color según estado
- **Badges**: Verde para disponible, rojo para ocupado

### Responsive Design
- **Móvil**: Columna única, carruseles apilados
- **Tablet**: Grid adaptativo
- **Desktop**: Grid 2-3 columnas, carruseles lado a lado

### Interacciones
- ✅ Hover effects en botones
- ✅ Transiciones suaves
- ✅ Estados disabled para espacios ocupados
- ✅ Indicadores visuales claros

---

## 🔍 Detalles de Implementación

### Navegación del Carrusel

**Lógica Circular:**
```typescript
// Siguiente: si está en la última, vuelve a la primera
const nuevoIndice = (indiceActual + 1) % totalImagenes;

// Anterior: si está en la primera, va a la última
const nuevoIndice = indiceActual === 0 ? totalImagenes - 1 : indiceActual - 1;
```

### Gestión de Estado por Sección

**Map para múltiples carruseles:**
```typescript
// Cada sección mantiene su propio índice
indicesImagenesSeccion = new Map<string, number>();

// Obtener índice (default 0 si no existe)
obtenerIndiceImagenSeccion(seccionId: string): number {
  return this.indicesImagenesSeccion.get(seccionId) || 0;
}
```

### Filtrado de Espacios

**Por sección:**
```typescript
obtenerEspaciosDeSeccion(seccionId: string): Espacio[] {
  return this.espacios().filter(e => e.seccionid === seccionId);
}
```

**Contador de disponibles:**
```typescript
contarEspaciosDisponibles(seccionId: string): number {
  return this.obtenerEspaciosDeSeccion(seccionId)
    .filter(e => e.estado === true).length;
}
```

---

## 🚀 Flujo de Usuario

### Paso 1: Selección de Institución
1. Usuario ve lista de instituciones
2. Click en una institución
3. Se carga información completa

### Paso 2: Visualización de Institución
1. **Header**: Nombre y dirección
2. **Carrusel**: Imágenes de la institución (si existen)
3. **Secciones**: Lista de secciones disponibles

### Paso 3: Exploración de Secciones
1. Cada sección muestra:
   - Información básica (tipo, capacidad, calificación)
   - Amenidades disponibles
   - Carrusel de imágenes de la sección
   - Grid de espacios

### Paso 4: Selección de Espacio
1. Usuario ve espacios disponibles
2. Identifica disponibilidad por color
3. Click en "Reservar" (próxima implementación)

---

## 📊 Estadísticas

- **Líneas de código agregadas**: ~250
- **Nuevos métodos**: 8
- **Componentes visuales**: 2 carruseles independientes
- **Responsive breakpoints**: 3 (móvil, tablet, desktop)

---

## ✅ Ventajas de la Nueva Vista

### Para el Usuario
- ✅ **Visualización rica**: Múltiples imágenes de instituciones y secciones
- ✅ **Organización clara**: Espacios agrupados por sección
- ✅ **Información completa**: Calificaciones, amenidades, disponibilidad
- ✅ **Navegación intuitiva**: Carruseles con controles claros

### Para el Sistema
- ✅ **Escalable**: Maneja múltiples imágenes sin problemas
- ✅ **Performance**: Estado local eficiente con Signals
- ✅ **Mantenible**: Código modular y reutilizable
- ✅ **Responsive**: Adaptable a cualquier dispositivo

---

## 🧪 Pruebas Recomendadas

### Carrusel de Institución
- [ ] Navegación con botones anterior/siguiente
- [ ] Click en indicadores de posición
- [ ] Comportamiento con 1 imagen (no mostrar controles)
- [ ] Comportamiento sin imágenes
- [ ] Responsive en diferentes tamaños

### Carrusel de Secciones
- [ ] Múltiples carruseles independientes funcionando
- [ ] Estado mantenido al navegar entre secciones
- [ ] Comportamiento con diferentes cantidades de imágenes

### Visualización de Espacios
- [ ] Filtrado correcto por sección
- [ ] Estados visuales (disponible/ocupado)
- [ ] Contador de disponibilidad correcto
- [ ] Botón reservar habilitado/deshabilitado
- [ ] Scroll en lista larga de espacios

### Responsive
- [ ] Vista móvil (< 640px)
- [ ] Vista tablet (640px - 1024px)
- [ ] Vista desktop (> 1024px)

---

## 🎯 Mejoras Futuras

### Carrusel
- [ ] Autoplay opcional
- [ ] Gestos de swipe en móvil
- [ ] Lazy loading de imágenes
- [ ] Thumbnails en galería
- [ ] Zoom al hacer click

### Espacios
- [ ] Vista de calendario integrada
- [ ] Filtros de búsqueda
- [ ] Ordenamiento personalizado
- [ ] Vista de lista vs grid
- [ ] Comparador de espacios

### UX
- [ ] Animaciones entre transiciones
- [ ] Skeleton loaders
- [ ] Búsqueda en tiempo real
- [ ] Favoritos/Guardados
- [ ] Compartir enlace directo

---

## 📝 Notas Técnicas

1. **Signals de Angular**: Se usa reactivity nativa para mejor performance
2. **Map para índices**: Permite estado independiente por sección
3. **Grid responsivo**: Tailwind CSS con breakpoints lg
4. **Overflow**: max-h-96 con scroll para listas largas
5. **Estados visuales**: Clases dinámicas según disponibilidad

---

**Implementado por**: GitHub Copilot  
**Fecha**: Noviembre 22, 2025  
**Versión**: 2.0.0

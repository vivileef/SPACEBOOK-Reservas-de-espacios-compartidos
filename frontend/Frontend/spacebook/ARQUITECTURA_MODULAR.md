# 🏗️ Arquitectura Modular de Servicios - Documentación

## 📋 Resumen

Se ha refactorizado la arquitectura del proyecto para separar el servicio monolítico `DatabaseService` en múltiples servicios especializados por entidad. Esta modularización mejora la mantenibilidad, escalabilidad y facilita las pruebas unitarias.

---

## 🗂️ Estructura de Archivos

### **Nuevos Directorios**

```
src/app/shared/
├── models/
│   ├── interfaces/           ← NUEVO
│   │   ├── administrador.interface.ts
│   │   ├── usuario.interface.ts
│   │   ├── institucion.interface.ts
│   │   ├── seccion.interface.ts
│   │   ├── espacio.interface.ts
│   │   ├── horario.interface.ts
│   │   ├── reserva.interface.ts
│   │   ├── comentario.interface.ts
│   │   ├── incidencia.interface.ts
│   │   ├── notificacion.interface.ts
│   │   └── index.ts
│   └── database.models.ts    ← MODIFICADO (re-exporta interfaces)
│
└── services/
    ├── entities/              ← NUEVO
    │   ├── institucion.service.ts
    │   ├── seccion.service.ts
    │   ├── espacio.service.ts
    │   ├── horario.service.ts
    │   ├── reserva.service.ts
    │   ├── comentario.service.ts
    │   ├── incidencia.service.ts
    │   ├── notificacion.service.ts
    │   └── index.ts
    ├── database.service.ts    ← REFACTORIZADO (patrón facade)
    └── auth.service.ts
```

---

## 🎯 Arquitectura: Patrón Facade

### **DatabaseService (Facade)**

El `DatabaseService` ahora actúa como **fachada** que:
- ✅ Mantiene la misma API pública (compatibilidad hacia atrás)
- ✅ Delega todas las operaciones a servicios especializados
- ✅ Reduce acoplamiento entre componentes y lógica de base de datos

```typescript
@Injectable({ providedIn: 'root' })
export class DatabaseService {
  private institucionService = inject(InstitucionService);
  private seccionService = inject(SeccionService);
  // ... otros servicios

  getInstituciones(): Promise<Institucion[]> {
    return this.institucionService.getInstituciones(); // Delegación
  }
}
```

### **Servicios de Entidad**

Cada servicio gestiona **una sola entidad** con operaciones CRUD:

| Servicio | Entidad | Métodos | Características |
|----------|---------|---------|-----------------|
| `InstitucionService` | `institucion` | 5 | CRUD básico |
| `SeccionService` | `seccion` | 5 | CRUD + filtro por institución |
| `EspacioService` | `espacio` | 5 | CRUD + filtro por sección |
| `HorarioService` | `horario` | 5 | CRUD básico |
| `ReservaService` | `reserva` | 6 | CRUD + `getReservasActivas` |
| `ComentarioService` | `comentario` | 5 | CRUD + filtro por reserva |
| `IncidenciaService` | `incidencia` | 5 | CRUD + filtro por usuario |
| `NotificacionService` | `notificacion` | 6 | CRUD + `marcarComoLeidas` |

---

## 📦 Modelos e Interfaces

### **Separación de Interfaces**

Cada entidad tiene su propio archivo en `models/interfaces/`:

```typescript
// institucion.interface.ts
export interface Institucion {
  institucionid: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
}

export interface CreateInstitucionDTO {
  nombre: string;
  direccion?: string;
  telefono?: string;
}

export interface UpdateInstitucionDTO {
  institucionid: string;
  nombre?: string;
  direccion?: string;
  telefono?: string;
}
```

### **DTOs para Operaciones**

Cada entidad incluye:
- **Interface base**: Representa el modelo completo con ID
- **CreateDTO**: Datos requeridos para crear (sin ID)
- **UpdateDTO**: ID requerido + campos opcionales para actualizar

---

## 🔗 Compatibilidad Hacia Atrás

### **Importaciones Existentes Siguen Funcionando**

```typescript
// ✅ Componentes existentes NO necesitan cambios
import { DatabaseService } from '../../shared/services/database.service';

// ✅ Todos estos imports siguen funcionando
import { Institucion, Seccion, Espacio } from '../../shared/models/database.models';
```

### **Migración Progresiva (Opcional)**

Puedes migrar gradualmente a importaciones directas:

```typescript
// Opción 1: Usar el facade (recomendado por ahora)
constructor(private db: DatabaseService) {}
const instituciones = await this.db.getInstituciones();

// Opción 2: Inyectar servicio específico (futuro)
constructor(private institucionService: InstitucionService) {}
const instituciones = await this.institucionService.getInstituciones();
```

---

## 🚀 Beneficios de la Modularización

### **1. Mantenibilidad**
- Cada archivo tiene ~100-150 líneas (vs. 783 líneas original)
- Cambios en una entidad no afectan otras

### **2. Escalabilidad**
- Fácil agregar nuevas entidades (copiar estructura existente)
- Servicios independientes pueden extenderse sin conflictos

### **3. Testabilidad**
- Servicios pequeños = tests más simples
- Fácil mockear dependencias específicas

### **4. Responsabilidad Única (SOLID)**
- Cada servicio tiene una sola razón para cambiar
- Interfaces segregadas por entidad

### **5. Reusabilidad**
- Servicios pueden usarse directamente sin facade
- DTOs reutilizables en formularios y validaciones

---

## 📚 Guía de Uso para Desarrolladores

### **Crear una Nueva Entidad**

**Paso 1:** Crear interfaces en `models/interfaces/nueva-entidad.interface.ts`

```typescript
export interface NuevaEntidad {
  id: string;
  nombre: string;
  // ...
}

export interface CreateNuevaEntidadDTO {
  nombre: string;
  // ...
}

export interface UpdateNuevaEntidadDTO {
  id: string;
  nombre?: string;
  // ...
}
```

**Paso 2:** Agregar export en `models/interfaces/index.ts`

```typescript
export * from './nueva-entidad.interface';
```

**Paso 3:** Crear servicio en `services/entities/nueva-entidad.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class NuevaEntidadService {
  private supabase = inject(SupabaseClient);

  async get(): Promise<NuevaEntidad[]> {
    const { data, error } = await this.supabase
      .from('tabla_nueva')
      .select('*');
    if (error) throw error;
    return data || [];
  }
  // ... CRUD methods
}
```

**Paso 4:** Agregar al facade `database.service.ts`

```typescript
export class DatabaseService {
  private nuevaEntidadService = inject(NuevaEntidadService);

  getNuevasEntidades(): Promise<NuevaEntidad[]> {
    return this.nuevaEntidadService.get();
  }
}
```

---

## 🛠️ Operaciones CRUD Estándar

Todos los servicios implementan este patrón:

```typescript
// READ ALL
async getEntidades(filtro?: string): Promise<Entidad[]>

// READ ONE
async getEntidad(id: string): Promise<Entidad | null>

// CREATE
async createEntidad(data: CreateEntidadDTO): Promise<Entidad>

// UPDATE
async updateEntidad(data: UpdateEntidadDTO): Promise<Entidad>

// DELETE
async deleteEntidad(id: string): Promise<void>
```

---

## 🔍 Métodos Especiales por Servicio

### **ReservaService**
```typescript
getReservasActivas(usuarioId: string): Promise<Reserva[]>
// Retorna solo reservas con estado "activa"
```

### **NotificacionService**
```typescript
marcarNotificacionesComoLeidas(usuarioId: string): Promise<void>
// Marca todas las notificaciones del usuario como leídas
```

### **Servicios con Filtros**
```typescript
// SeccionService
getSecciones(institucionId?: string): Promise<Seccion[]>

// EspacioService
getEspacios(seccionId?: string): Promise<Espacio[]>

// ComentarioService
getComentarios(reservaId?: string): Promise<Comentario[]>

// IncidenciaService
getIncidencias(usuarioId?: string): Promise<Incidencia[]>
```

---

## ⚠️ Notas Importantes

### **No Tocar Directamente `database.models.ts`**
Este archivo ahora solo re-exporta desde `interfaces/index.ts`. Para agregar nuevos modelos:
1. Crear archivo en `models/interfaces/`
2. Exportar desde `models/interfaces/index.ts`
3. Automáticamente estará disponible desde `database.models.ts`

### **Inyección con `inject()`**
Usamos la función `inject()` en lugar del constructor para inyección de dependencias (Angular 14+):

```typescript
// ✅ Moderno (inject function)
private institucionService = inject(InstitucionService);

// ❌ Antiguo (constructor injection)
constructor(private institucionService: InstitucionService) {}
```

### **Manejo de Errores**
Todos los servicios lanzan excepciones de Supabase directamente. Los componentes deben manejarlas:

```typescript
try {
  const data = await this.db.getInstituciones();
} catch (error) {
  console.error('Error al cargar instituciones:', error);
  // Mostrar mensaje al usuario
}
```

---

## 📊 Estadísticas de Refactorización

| Métrica | Antes | Después |
|---------|-------|---------|
| **Líneas en database.service.ts** | 783 | 237 |
| **Archivos de servicio** | 1 | 9 (1 facade + 8 entidades) |
| **Archivos de interfaces** | 1 | 11 (10 entidades + 1 index) |
| **Responsabilidades por archivo** | 8 | 1 |
| **Líneas promedio por servicio** | - | ~120 |

---

## ✅ Verificación de Implementación

### **Checklist de Archivos Creados**

- [x] 10 archivos de interfaces en `models/interfaces/`
- [x] `models/interfaces/index.ts` (barrel export)
- [x] `models/database.models.ts` refactorizado
- [x] 8 servicios de entidad en `services/entities/`
- [x] `services/entities/index.ts` (barrel export)
- [x] `database.service.ts` como facade
- [x] Sin errores de compilación
- [x] Compatibilidad con componentes existentes

### **Prueba de Integración**

Para verificar que todo funciona:

```bash
# Compilar proyecto
ng build

# Ejecutar servidor de desarrollo
ng serve

# Verificar que no hay errores en consola del navegador
```

---

## 🎓 Patrones de Diseño Aplicados

1. **Facade Pattern**: `DatabaseService` oculta complejidad de servicios especializados
2. **Single Responsibility**: Cada servicio gestiona una entidad
3. **Dependency Injection**: Inyección automática de servicios
4. **DTO Pattern**: Separación entre modelos de dominio y transferencia de datos
5. **Barrel Exports**: Simplificación de imports con archivos `index.ts`

---

## 📖 Referencias

- [Angular Dependency Injection](https://angular.io/guide/dependency-injection)
- [Facade Pattern](https://refactoring.guru/design-patterns/facade)
- [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single-responsibility_principle)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

## 👨‍💻 Autor

Refactorización completada: **[Fecha Actual]**  
Patrón arquitectónico: **Facade + Entity Services**  
Framework: **Angular 17+ con Supabase**

---

## 🔄 Historial de Cambios

### v2.0.0 - Modularización Completa
- ✅ Separación de interfaces en archivos individuales
- ✅ Creación de servicios especializados por entidad
- ✅ Implementación de patrón Facade en DatabaseService
- ✅ Barrel exports para simplificar importaciones
- ✅ Compatibilidad total con código existente

### v1.0.0 - Versión Monolítica
- Todas las operaciones en un solo archivo `database.service.ts` (783 líneas)

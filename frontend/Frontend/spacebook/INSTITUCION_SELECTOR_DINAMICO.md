# Selector de Institución Dinámico - Guía Técnica

## Descripción General

El selector de institución ahora es **completamente interactivo y dinámico**. Cuando el usuario selecciona una institución diferente, el sistema:
- Carga automáticamente las secciones de esa institución
- Carga automáticamente los espacios de la primera sección
- Actualiza el calendario con los datos de la institución seleccionada

## Cambios Implementados

### 1. **Reestructuración de Datos (visualizacion-disponibilidad.ts)**

#### Antes:
```typescript
institutions = [
  { id: 1, name: 'Universidad Nacional de Colombia' },
  { id: 2, name: 'Colegio Técnico' },
  { id: 3, name: 'Centro Empresarial' }
];

sections = [
  { id: 1, name: 'Auditorios', count: 3 },
  { id: 2, name: 'Aulas', count: 15 },
  // ...
];

spaces = [
  { id: 1, name: 'Auditorio Principal', capacity: 500, type: 'Auditorio' },
  // ...
];
```

#### Después:
```typescript
institutions = [
  {
    id: 1,
    name: 'Universidad Nacional de Colombia',
    sections: [
      {
        id: 1,
        name: 'Auditorios',
        count: 3,
        spaces: [
          { id: 1, name: 'Auditorio Principal', capacity: 500, type: 'Auditorio' },
          // ...
        ]
      },
      // más secciones...
    ]
  },
  // más instituciones...
];

sections: any[] = [];  // Ahora se carga dinámicamente
spaces: any[] = [];    // Ahora se carga dinámicamente
```

**Ventajas:**
- Estructura jerárquica más realista
- Datos más fáciles de sincronizar con backend
- No hay inconsistencias entre arrays separados

### 2. **Nuevos Métodos en el Componente**

#### `loadInstitutionData()`
```typescript
loadInstitutionData(): void {
  const institution = this.institutions.find(inst => inst.name === this.selectedInstitution);
  if (institution) {
    this.sections = institution.sections;
    const firstSection = this.sections[0];
    if (firstSection) {
      this.selectedSection = firstSection.name;
      this.spaces = firstSection.spaces;
      if (this.spaces.length > 0) {
        this.selectSpace(this.spaces[0]);
      }
    }
  }
}
```

**Responsabilidad:** Cargar todos los datos de una institución seleccionada.

**Flujo:**
1. Encuentra la institución por nombre
2. Asigna las secciones de esa institución al array `sections`
3. Selecciona automáticamente la primera sección
4. Carga los espacios de esa sección
5. Selecciona el primer espacio (actualiza el calendario)

#### `selectInstitution(institution: any)`
```typescript
selectInstitution(institution: any): void {
  this.selectedInstitution = institution.name;
  this.loadInstitutionData();  // Trigger automático
}
```

**Responsabilidad:** Manejador del clic en los botones de institución.

**Flujo:**
1. Actualiza `selectedInstitution` con el nombre de la institución seleccionada
2. Llama a `loadInstitutionData()` para cargar todos los datos asociados

### 3. **Actualización del Método selectSection()**

#### Antes:
```typescript
selectSection(section: any): void {
  this.selectedSection = section.name;
}
```

#### Después:
```typescript
selectSection(section: any): void {
  this.selectedSection = section.name;
  this.spaces = section.spaces;  // Cargar espacios de esta sección
  if (this.spaces.length > 0) {
    this.selectSpace(this.spaces[0]);  // Seleccionar primer espacio
  }
}
```

**Mejora:** Ahora carga dinámicamente los espacios de la sección seleccionada.

### 4. **Actualización de la Vista HTML**

#### Institución Selector (antes):
```html
<div class="flex items-center space-x-3 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
  <svg>...</svg>
  <div>
    <p class="font-semibold text-gray-900">{{ selectedInstitution }}</p>
    <p class="text-xs text-gray-600">Campus Principal</p>
  </div>
</div>
```

#### Institución Selector (después):
```html
<div class="space-y-2">
  <button
    *ngFor="let institution of institutions"
    (click)="selectInstitution(institution)"
    [ngClass]="{
      'bg-red-700 text-white border-red-700': selectedInstitution === institution.name,
      'bg-white text-gray-700 border-gray-300 hover:border-red-400 hover:bg-red-50': selectedInstitution !== institution.name
    }"
    class="w-full px-4 py-3 text-left text-sm font-medium border-2 rounded-lg transition-all duration-200 flex items-center space-x-3"
  >
    <svg>...</svg>
    <div class="flex-1 text-left">
      <p class="font-semibold">{{ institution.name }}</p>
    </div>
    <span class="text-xs px-2 py-1 rounded-full" [ngClass]="selectedInstitution === institution.name ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'">
      {{ institution.sections.length }}
    </span>
  </button>
</div>
```

**Cambios:**
- ✅ Botones interactivos en lugar de display estático
- ✅ Iteración dinámica con `*ngFor="let institution of institutions"`
- ✅ Clic handler: `(click)="selectInstitution(institution)"`
- ✅ Cambio de color basado en selección: `[ngClass]`
- ✅ Badge que muestra cantidad de secciones

## Flujo de Datos Completo

```
Usuario hace clic en institución
        ↓
selectInstitution(institution) se ejecuta
        ↓
this.selectedInstitution = institution.name (actualiza variable)
        ↓
loadInstitutionData() se ejecuta
        ↓
Busca institución en array → extrae .sections
        ↓
this.sections = institution.sections (actualiza variable)
        ↓
Selecciona primera sección automáticamente
        ↓
Busca la sección en institution.sections → extrae .spaces
        ↓
this.spaces = firstSection.spaces (actualiza variable)
        ↓
this.selectSpace(this.spaces[0]) se ejecuta
        ↓
Calendario se regenera con nuevos datos
```

## Estructura de Datos Actual

```typescript
// Universidad Nacional de Colombia
{
  id: 1,
  name: 'Universidad Nacional de Colombia',
  sections: [
    {
      id: 1,
      name: 'Auditorios',
      count: 3,
      spaces: [3 espacios]
    },
    {
      id: 2,
      name: 'Aulas',
      count: 15,
      spaces: [3 espacios]
    },
    {
      id: 3,
      name: 'Laboratorios',
      count: 8,
      spaces: [3 espacios]
    },
    {
      id: 4,
      name: 'Salas de Reunión',
      count: 5,
      spaces: [3 espacios]
    }
  ]
}

// Colegio Técnico
{
  id: 2,
  name: 'Colegio Técnico',
  sections: [
    {
      id: 5,
      name: 'Aulas',
      count: 20,
      spaces: [3 espacios]
    },
    {
      id: 6,
      name: 'Talleres',
      count: 10,
      spaces: [3 espacios]
    }
  ]
}

// Centro Empresarial
{
  id: 3,
  name: 'Centro Empresarial',
  sections: [
    {
      id: 7,
      name: 'Oficinas',
      count: 15,
      spaces: [3 espacios]
    },
    {
      id: 8,
      name: 'Salas de Conferencia',
      count: 6,
      spaces: [3 espacios]
    }
  ]
}
```

## Funcionamiento Esperado

1. **Carga Inicial:**
   - ngOnInit() → loadInstitutionData()
   - Se cargan secciones de "Universidad Nacional de Colombia"
   - Se cargan espacios de "Auditorios" (primera sección)
   - Se selecciona "Auditorio Principal" (primer espacio)
   - Se genera calendario con estos datos

2. **Cambio de Institución:**
   - Usuario hace clic en "Centro Empresarial"
   - selectInstitution() actualiza selectedInstitution
   - loadInstitutionData() carga:
     - sections = [Oficinas, Salas de Conferencia]
     - selectedSection = "Oficinas"
     - spaces = [Oficina 101, Oficina 102, Oficina 201]
     - selectedSpace = "Oficina 101"
   - Calendario se regenera automáticamente

3. **Cambio de Sección:**
   - Usuario hace clic en "Talleres" (Colegio Técnico)
   - selectSection() carga:
     - spaces = [Taller Mecánica, Taller Electricidad, Taller Electrónica]
     - selectedSpace = "Taller Mecánica"
   - Calendario se regenera automáticamente

## Integración con Backend

### Próximos Pasos (Recomendado)

Para integrar con un backend real:

```typescript
// 1. Inyectar servicio HTTP
constructor(private http: HttpClient) { }

// 2. Cargar instituciones desde servidor
loadInstitutions(): void {
  this.http.get<any[]>('/api/institutions').subscribe(
    (data) => {
      this.institutions = data;
      this.loadInstitutionData();
    }
  );
}

// 3. ngOnInit ahora llamaría loadInstitutions() en lugar de loadInstitutionData()
ngOnInit(): void {
  this.loadInstitutions();  // Carga desde servidor
  this.generateCalendar();
}
```

## Validación

✅ **Compilación:** Sin errores
✅ **Funcionalidad:** Selector dinámico operativo
✅ **Datos:** Estructura jerárquica consistente
✅ **UI/UX:** Botones interactivos con feedback visual
✅ **Compatibilidad:** Funciona con FormsModule y CommonModule existentes

## Resumen de Cambios

| Archivo | Cambios |
|---------|---------|
| `visualizacion-disponibilidad.ts` | • Reestructuración de datos (3 instituciones con secciones anidadas)<br>• Nuevo método `loadInstitutionData()`<br>• Nuevo método `selectInstitution()`<br>• Actualización de `selectSection()`<br>• sections y spaces ahora son arrays dinámicos |
| `visualizacion-disponibilidad.html` | • Reemplazo de institución estática por botones dinámicos<br>• Loop `*ngFor="let institution of institutions"`<br>• Handler `(click)="selectInstitution(institution)"`<br>• Binding de clases dinámicas<br>• Badge con cantidad de secciones |
| `visualizacion-disponibilidad.css` | Sin cambios necesarios |

## Conclusión

El selector de institución ahora es **completamente funcional y dinámico**. Los datos se cargan automáticamente en cascada:
- Institución → Secciones
- Sección → Espacios
- Espacio → Calendario

El sistema está listo para integrarse con un backend real.

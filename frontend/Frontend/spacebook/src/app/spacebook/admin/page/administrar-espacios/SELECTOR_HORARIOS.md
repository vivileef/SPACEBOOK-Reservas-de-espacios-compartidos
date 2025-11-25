# Selector de Horarios en Administrar Espacios

## ✅ Cambios Implementados

### 1. **Nueva Interfaz Horario**
```typescript
interface Horario {
  horarioid: string;
  horainicio: string; // time format (HH:MM:SS)
  horafin: string; // time format (HH:MM:SS)
  semana: string; // días separados por comas
}
```

### 2. **Nuevas Propiedades en el Componente**
- `horarios = signal<Horario[]>([])` - Lista de todos los horarios disponibles
- `horarioSeleccionado = signal<string | undefined>(undefined)` - ID del horario seleccionado actualmente

### 3. **Método de Carga de Horarios**
```typescript
async cargarHorarios() {
  // Carga todos los horarios desde la tabla 'horario'
  // Los ordena por hora de inicio
}
```

### 4. **Función de Formato de Horario**
```typescript
obtenerTextoHorario(horario: Horario): string {
  // Formato: ⏰ 09:00 - 17:00 | 📅 Lunes,Martes,Miércoles
  // Muestra la información del horario de forma legible
}
```

### 5. **Actualización del Modal de Institución**

#### En el TypeScript:
- `abrirModalInstitucion()` ahora carga el horario seleccionado al editar
- `cerrarModalInstitucion()` limpia el horario seleccionado
- `guardarInstitucion()` guarda el `horarioid` en la base de datos
- Nuevo método: `actualizarHorarioSeleccionado(horarioid: string)`

#### En el HTML:
Se agregó un nuevo campo de selección:

```html
<select [value]="horarioSeleccionado() || ''" 
        (change)="actualizarHorarioSeleccionado($any($event.target).value)">
  <option value="">📅 Sin horario asignado</option>
  @for (horario of horarios(); track horario.horarioid) {
    <option [value]="horario.horarioid">
      {{ obtenerTextoHorario(horario) }}
    </option>
  }
</select>
```

### 6. **Flujo de Trabajo**

1. **Al abrir el componente:**
   - Se cargan todas las instituciones
   - Se cargan todos los horarios disponibles de la tabla `horario`

2. **Al crear una institución:**
   - El usuario puede seleccionar un horario del dropdown
   - El selector muestra: hora inicio, hora fin y días de la semana
   - Si no se selecciona horario, se guarda como `null`

3. **Al editar una institución:**
   - Si la institución tiene un `horarioid`, se preselecciona en el dropdown
   - El usuario puede cambiar el horario o dejarlo sin asignar

4. **Al guardar:**
   - Se guarda el `horarioid` seleccionado en la tabla `institucion`
   - La relación de clave foránea se mantiene correctamente

### 7. **Formato de Visualización**

Los horarios se muestran en el selector con el siguiente formato:

```
⏰ 08:00 - 18:00 | 📅 Lunes,Martes,Miércoles,Jueves,Viernes
⏰ 09:00 - 17:00 | 📅 Lunes,Miércoles,Viernes
⏰ 10:00 - 14:00 | 📅 Sábado,Domingo
```

### 8. **Características Especiales**

✅ **No se muestran IDs** - Solo información legible para el usuario
✅ **Formato visual claro** - Con iconos y separadores
✅ **Opción "Sin horario"** - Permite instituciones sin horario asignado
✅ **Sincronización automática** - Al editar, carga el horario actual
✅ **Validación de datos** - Maneja casos donde faltan datos (horainicio, horafin, semana)

### 9. **Relación con la Base de Datos**

```
horario (horarioid, horainicio, horafin, semana)
    ↑
institucion (horarioid) ← Foreign Key
```

La institución ahora puede tener un horario de atención asociado que define:
- **horainicio**: Hora de apertura
- **horafin**: Hora de cierre
- **semana**: Días laborales (separados por comas)

### 10. **Nota Importante**

El mensaje informativo sugiere:
> "Puedes gestionar horarios desde el Calendario de Disponibilidad"

Esto indica que los horarios se deben crear/editar en el componente `calendario-disponibilidad`, y desde aquí solo se **seleccionan** los horarios existentes.

## 🔄 Próximos Pasos Sugeridos

1. Agregar indicador visual si una institución no tiene horario asignado
2. Mostrar el horario en las tarjetas de instituciones (vista principal)
3. Validar que el horario seleccionado exista antes de guardar
4. Agregar botón de "Crear nuevo horario" que redirija a calendario-disponibilidad

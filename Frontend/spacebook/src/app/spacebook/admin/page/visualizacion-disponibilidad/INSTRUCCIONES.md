# 🚀 INSTRUCCIONES DE INSTALACIÓN Y EJECUCIÓN

## Verificar Instalación Completa

Tu proyecto ya tiene todo configurado. Verifica que tengas:

```bash
# 1. Node.js instalado (v18+)
node --version

# 2. npm actualizado
npm --version

# 3. Angular CLI (instalado globalmente)
ng version
```

---

## Ejecutar el Proyecto

### 1. Navegar a la carpeta del proyecto
```bash
cd "C:\Users\RUDY PICO\Desktop\pacheco modelado\Frontend\Frontend\spacebook"
```

### 2. Instalar dependencias (si aún no lo hiciste)
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
ng serve --open
```

O simplemente:
```bash
npm start
```

El proyecto se abrirá automáticamente en `http://localhost:4200`

---

## Acceder a la Nueva Vista

### Opción 1: Por el menú
1. Inicia sesión como administrador
2. En el dashboard, haz clic en **"Disponibilidad"** en el menú lateral

### Opción 2: URL directa
```
http://localhost:4200/admin-dashboard/visualizacion-disponibilidad
```

---

## Estructura del Proyecto Creado

```
src/app/spacebook/admin/page/visualizacion-disponibilidad/
│
├── visualizacion-disponibilidad.ts          # Componente (TypeScript)
│   ├── Interfases: CalendarDay, CalendarEvent
│   ├── Propiedades: selecciones, calendario
│   └── Métodos: navegación, generación, evento
│
├── visualizacion-disponibilidad.html        # Template (HTML)
│   ├── Header
│   ├── Grid layout (3 columnas en desktop)
│   ├── Card institución
│   ├── Card selectores (secciones + espacios)
│   ├── Card calendario (interactivo)
│   └── Panel lateral (detalles)
│
├── visualizacion-disponibilidad.css         # Estilos adicionales
│   ├── Animaciones (@keyframes)
│   ├── Scrollbar personalizado
│   └── Media queries responsivas
│
├── README.md                                 # Documentación completa
├── VISTA_PREVIA_VISUAL.md                   # Guía visual
├── GUIA_EXTENSION.ts                        # Ejemplos de integración
└── INSTRUCCIONES.md                         # Este archivo

```

---

## Tecnologías Utilizadas

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Angular | 17+ | Framework principal |
| TypeScript | 5+ | Lenguaje de programación |
| Tailwind CSS | 3+ | Estilos y diseño |
| DaisyUI | Latest | Componentes pre-diseñados |
| RxJS | 7+ | Reactividad |
| CommonModule | Angular | Directivas (*ngIf, *ngFor) |
| FormsModule | Angular | Binding de formularios |

---

## Características del Diseño

### ✅ Implementado (Estático)
- [x] Calendario mensual interactivo
- [x] Navegación entre meses
- [x] Selector de institución (visual)
- [x] Selector de secciones
- [x] Selector de espacios
- [x] Panel lateral con detalles
- [x] Eventos simulados en calendario
- [x] Leyenda de colores
- [x] Diseño completamente responsivo
- [x] Animaciones suaves
- [x] Efectos hover profesionales
- [x] Totalmente accesible

### ⏳ Por Implementar (requiere backend)
- [ ] Conectar a base de datos
- [ ] Cargar instituciones reales
- [ ] Cargar secciones dinámicas
- [ ] Cargar espacios dinámicos
- [ ] Cargar reservas de la BD
- [ ] Editar disponibilidad
- [ ] Crear nuevas reservas
- [ ] Eliminar reservas
- [ ] Exportar a PDF
- [ ] Notificaciones en tiempo real

---

## Compilación para Producción

```bash
# Crear build optimizado
ng build --configuration production

# El resultado estará en dist/spacebook/
# Puede ser desplegado en cualquier servidor web
```

---

## Debugging y Desarrollo

### Abrir DevTools
```
F12 o Ctrl + Shift + I en Windows
```

### Ver en consola
- Errores de TypeScript
- Warnings de Angular
- Logs del navegador

### Hot reload
- Los cambios se reflejan automáticamente
- El navegador se recarga automáticamente

---

## Problemas Comunes y Soluciones

### ❌ Error: "Cannot find module"
```
Solución: Ejecuta npm install
```

### ❌ Puerto 4200 ya está en uso
```
Solución: 
ng serve --port 4300 --open
```

### ❌ Compilación lenta
```
Solución: Cierra y reabre la terminal
Asegúrate de que no haya procesos ng serve corriendo
```

### ❌ Cambios no se reflejan
```
Solución: 
1. Guarda los archivos (Ctrl+S)
2. Espera a que se compile
3. Recarga la página (F5)
```

---

## Personalización del Calendario

### Cambiar Mes Inicial
En `visualizacion-disponibilidad.ts`, modifica:
```typescript
currentDate: Date = new Date(2024, 10); // Noviembre 2024
```

### Agregar Más Eventos
En el método `generateDayEvents()`, agrega eventos al objeto:
```typescript
const eventMap: { [key: number]: CalendarEvent[] } = {
    1: [{ time: '10:00-12:00', status: 'occupied', title: 'Mi Evento' }],
    // Agregar más aquí...
};
```

### Cambiar Colores
Modifica en `visualizacion-disponibilidad.html`:
```html
<!-- Busca y cambia las clases de Tailwind -->
bg-red-700    <!-- Color principal -->
bg-red-100    <!-- Color ocupado -->
bg-green-100  <!-- Color disponible -->
```

---

## Mejores Prácticas

### Al extender la componente:
1. ✅ Crea servicios separados para lógica de negocio
2. ✅ Mantén la componente enfocada en presentación
3. ✅ Usa RxJS para manejar datos asincronos
4. ✅ Implementa proper error handling
5. ✅ Añade unit tests para nuevas funcionalidades

### Al integrar con backend:
1. ✅ Usa TypeScript interfaces para tipos de datos
2. ✅ Implementa loading states
3. ✅ Maneja errores de API
4. ✅ Cachea datos cuando sea posible
5. ✅ Valida datos en el frontend

---

## Recursos Útiles

### Documentación
- [Angular Docs](https://angular.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [DaisyUI Components](https://daisyui.com/components)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

### Herramientas
- [VS Code](https://code.visualstudio.com/) - Editor recomendado
- [Angular DevTools](https://angular.io/guide/devtools) - Plugin para debugging
- [Tailwind IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) - Autocompletado

### Plugins VS Code Recomendados
```
Angular Language Service
Tailwind CSS IntelliSense
ES7+ React/Redux/React-Native snippets
Prettier - Code formatter
Better Comments
```

---

## Próximos Pasos Sugeridos

### Fase 1: Validar Diseño
- [ ] Ejecutar el proyecto
- [ ] Navegar a la nueva vista
- [ ] Validar que se vea correctamente
- [ ] Probar en diferentes dispositivos

### Fase 2: Integración con Backend
- [ ] Crear servicio `SpaceService`
- [ ] Conectar endpoints de API
- [ ] Cargar datos reales
- [ ] Manejar errores

### Fase 3: Funcionalidad
- [ ] Implementar edición de disponibilidad
- [ ] Agregar validaciones
- [ ] Implementar guardado de cambios
- [ ] Agregar notificaciones

### Fase 4: Optimización
- [ ] Agregar pruebas unitarias
- [ ] Optimizar performance
- [ ] Mejorar accesibilidad
- [ ] Documentar API

---

## Soporte y Contacto

Si necesitas ayuda:
1. Revisa la documentación en los archivos README.md
2. Consulta GUIA_EXTENSION.ts para ejemplos
3. Verifica VISTA_PREVIA_VISUAL.md para detalles de diseño

---

## Licencia y Créditos

- **Proyecto**: SpaceBook - Sistema de Reservas Multi-institucional
- **Frontend**: Angular 17+ con Tailwind CSS
- **Autor**: Desarrollado para administración de espacios
- **Estado**: Vista estática completamente funcional

---

**¡Listo para usar! 🎉**

Ejecuta `ng serve --open` y comienza a explorar la nueva vista.

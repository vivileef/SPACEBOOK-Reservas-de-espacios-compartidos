/**
 * GUÍA DE EXTENSIÓN: Visualización de Disponibilidad de Espacios
 *
 * Este documento proporciona ejemplos de cómo extender y personalizar
 * la componente para conectarla con el backend y agregar funcionalidad.
 *
 * NOTA: Los ejemplos mostrados están comentados. Descomenta según necesites
 * e implementa los servicios correspondientes en tu backend.
 */

// ============================================================================
// EJEMPLO 1: Conectar con un servicio para obtener datos reales del backend
// ============================================================================

/*
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { SpaceService } from 'src/app/services/space.service'; // Crear este servicio

@Component({
  selector: 'app-visualizacion-disponibilidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualizacion-disponibilidad.html',
  styleUrls: ['./visualizacion-disponibilidad.css']
})
export class VisualizacionDisponibilidadComponent implements OnInit {
  // private spaceService = inject(SpaceService);  ngOnInit(): void {
    // Cargar instituciones del backend
    this.spaceService.getInstitutions().subscribe(institutions => {
      this.institutions = institutions;
    });

    // Cargar secciones de la institución seleccionada
    this.loadSections(this.selectedInstitution);

    // Cargar espacios de la sección seleccionada
    this.loadSpaces(this.selectedSection);

    // Cargar calendario con reservas reales
    this.loadCalendarEvents();

    this.generateCalendar();
  }

  loadSections(institutionId: string): void {
    this.spaceService.getSectionsByInstitution(institutionId).subscribe(sections => {
      this.sections = sections;
    });
  }

  loadSpaces(sectionId: string): void {
    this.spaceService.getSpacesBySection(sectionId).subscribe(spaces => {
      this.spaces = spaces;
    });
  }

  loadCalendarEvents(): void {
    const month = this.currentDate.getMonth();
    const year = this.currentDate.getFullYear();

    this.spaceService.getReservationsByMonth(year, month).subscribe(reservations => {
      // Procesar reservaciones y actualizar calendarDays
      this.processReservations(reservations);
    });
  }

  private processReservations(reservations: any[]): void {
    // Lógica para mapear reservaciones a eventos del calendario
  }
}
*/

// ============================================================================
// EJEMPLO 2: Agregar funcionalidad para editar disponibilidad
// ============================================================================

/*
selectTimeSlot(day: CalendarDay, time: string): void {
  // Abrir modal o formulario para editar disponibilidad
  const dialogRef = this.dialog.open(EditAvailabilityDialog, {
    data: { day: day.date, month: day.month, time: time }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Guardar cambios en backend
      this.spaceService.updateAvailability(
        this.selectedSpace,
        result
      ).subscribe(() => {
        this.loadCalendarEvents(); // Recargar calendario
      });
    }
  });
}
*/

// ============================================================================
// EJEMPLO 3: Agregar búsqueda y filtros avanzados
// ============================================================================

/*
searchSpaces(query: string): void {
  if (query.trim() === '') {
    this.spaceService.getSpacesBySection(this.selectedSection).subscribe(spaces => {
      this.spaces = spaces;
    });
    return;
  }

  this.spaceService.searchSpaces(query).subscribe(spaces => {
    this.spaces = spaces;
  });
}

filterByCapacity(minCapacity: number, maxCapacity: number): void {
  this.spaceService.getSpacesByCapacity(minCapacity, maxCapacity).subscribe(spaces => {
    this.spaces = spaces;
  });
}
*/

// ============================================================================
// EJEMPLO 4: Agregar exportación a PDF
// ============================================================================

/*
import { jsPDF } from 'jspdf';
import { html2canvas } from 'html2canvas';

exportCalendarToPDF(): void {
  const element = document.getElementById('calendar-container');

  html2canvas(element!).then((canvas: HTMLCanvasElement) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 280;
    const pageHeight = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`calendario-${this.selectedSpace}-${new Date().toISOString().split('T')[0]}.pdf`);
  });
}
*/

// ============================================================================
// EJEMPLO 5: Agregar notificaciones en tiempo real (WebSocket)
// ============================================================================

/*
import { webSocket } from 'rxjs/webSocket';

private setupRealtimeUpdates(): void {
  const wsUrl = 'wss://api.example.com/availability-updates';

  webSocket(wsUrl).subscribe({
    next: (message: any) => {
      // Actualizar disponibilidad en tiempo real
      if (message.spaceId === this.selectedSpace) {
        this.loadCalendarEvents();
      }
    },
    error: (err) => {
      console.error('WebSocket error:', err);
    },
    complete: () => {
      console.log('WebSocket closed');
    }
  });
}
*/

// ============================================================================
// EJEMPLO 6: Agregar vista semanal/diaria
// ============================================================================

/*
viewMode: 'monthly' | 'weekly' | 'daily' = 'monthly';

switchToWeeklyView(): void {
  this.viewMode = 'weekly';
  this.generateWeeklyCalendar();
}

switchToDailyView(): void {
  this.viewMode = 'daily';
  this.generateDailyCalendar();
}

generateWeeklyCalendar(): void {
  // Generar vista de 7 días con slots de tiempo
  const startOfWeek = this.getStartOfWeek(this.currentDate);
  const days = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000),
    timeSlots: this.generateTimeSlots()
  }));
}

private generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 8; hour < 18; hour++) {
    slots.push(`${hour}:00-${hour + 1}:00`);
  }
  return slots;
}
*/

// ============================================================================
// EJEMPLO 7: Estructura de API esperada del backend
// ============================================================================

/*
ENDPOINTS SUGERIDOS:

GET /api/institutions
  - Response: Institution[]
  - Ejemplo: [
      { id: 'uuid', name: 'Universidad...', domain: 'univ.com' }
    ]

GET /api/institutions/:id/sections
  - Response: Section[]
  - Ejemplo: [
      { id: 'uuid', name: 'Auditorios', capacity: 500, count: 3 }
    ]

GET /api/sections/:id/spaces
  - Response: Space[]
  - Ejemplo: [
      { id: 'uuid', name: 'Auditorio 1', capacity: 500, type: 'Auditorio' }
    ]

GET /api/spaces/:id/reservations?year=2024&month=11
  - Response: Reservation[]
  - Ejemplo: [
      {
        id: 'uuid',
        spaceId: 'uuid',
        startTime: '2024-11-13T10:00:00',
        endTime: '2024-11-13T12:00:00',
        status: 'occupied|available',
        title: 'Conferencia'
      }
    ]

PUT /api/spaces/:id/availability
  - Body: { date, startTime, endTime, available: boolean }
  - Response: { success: true, message: 'Disponibilidad actualizada' }
*/

// ============================================================================
// EJEMPLO 8: Interfaz para el servicio de espacios
// ============================================================================

/*
// space.service.ts

interface Institution {
  id: string;
  name: string;
  domain: string;
  direccion: string;
}

interface Section {
  id: string;
  name: string;
  type: string;
  capacity: number;
  count?: number;
}

interface Space {
  id: string;
  name: string;
  capacity: number;
  type: string;
  sectionId: string;
  amenities?: string[];
}

interface Reservation {
  id: string;
  spaceId: string;
  usuarioId: string;
  startTime: Date;
  endTime: Date;
  status: 'occupied' | 'available';
  title: string;
  cost?: number;
}

@Injectable({ providedIn: 'root' })
export class SpaceService {
  private baseUrl = 'http://api.example.com';

  constructor(private http: HttpClient) {}

  getInstitutions(): Observable<Institution[]> {
    return this.http.get<Institution[]>(`${this.baseUrl}/institutions`);
  }

  getSectionsByInstitution(institutionId: string): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.baseUrl}/institutions/${institutionId}/sections`);
  }

  getSpacesBySection(sectionId: string): Observable<Space[]> {
    return this.http.get<Space[]>(`${this.baseUrl}/sections/${sectionId}/spaces`);
  }

  getReservationsByMonth(year: number, month: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(
      `${this.baseUrl}/reservations?year=${year}&month=${month}`
    );
  }

  updateAvailability(spaceId: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/spaces/${spaceId}/availability`, data);
  }
}
*/

// ============================================================================
// NOTAS IMPORTANTES
// ============================================================================

/*
1. DATOS ESTÁTICOS ACTUALES:
   - Todos los datos son simulados en el componente
   - Los eventos del calendario son generados aleatoriamente
   - Las opciones de dropdown son hardcodeadas

2. PASOS PARA INTEGRAR CON BACKEND:
   a) Crear servicio SpaceService con endpoints de API
   b) Inyectar servicio en el componente
   c) Reemplazar datos estáticos con llamadas a API
   d) Descomenta los ejemplos de arriba según sea necesario
   e) Maneja errores con try/catch o pipe(catchError(...))

3. MEJORAS DE PERFORMANCE:
   - Implementar paginación si hay muchos espacios
   - Usar virtual scrolling para listas largas
   - Cachear datos con RxJS
   - Lazy loading de eventos del calendario

4. SEGURIDAD:
   - Verificar permisos de administrador en backend
   - Validar datos enviados
   - Usar HTTPS
   - Implementar CORS correctamente

5. PRUEBAS UNITARIAS:
   - Crear mocks de SpaceService
   - Testear generación de calendario
   - Testear métodos de navegación
   - Testear filtros y búsqueda
*/

export {};

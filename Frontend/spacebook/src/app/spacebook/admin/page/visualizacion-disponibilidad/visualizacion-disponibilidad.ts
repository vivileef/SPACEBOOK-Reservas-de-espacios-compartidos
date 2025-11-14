import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CalendarDay {
  date: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  events: CalendarEvent[];
  isToday: boolean;
}

interface CalendarEvent {
  time: string;
  status: 'occupied' | 'available';
  title: string;
}

@Component({
  selector: 'app-visualizacion-disponibilidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visualizacion-disponibilidad.html',
  styleUrls: ['./visualizacion-disponibilidad.css']
})
export class VisualizacionDisponibilidadComponent implements OnInit {
  // Datos de contexto
  selectedInstitution = 'Universidad Nacional de Colombia';
  selectedSection = 'Auditorios';
  selectedSpace = 'Auditorio Principal';

  // Estructura completa de instituciones con secciones y espacios
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
            { id: 2, name: 'Auditorio 2', capacity: 300, type: 'Auditorio' },
            { id: 3, name: 'Auditorio 3', capacity: 200, type: 'Auditorio' }
          ]
        },
        {
          id: 2,
          name: 'Aulas',
          count: 15,
          spaces: [
            { id: 4, name: 'Aula 101', capacity: 40, type: 'Aula' },
            { id: 5, name: 'Aula 102', capacity: 40, type: 'Aula' },
            { id: 6, name: 'Aula 201', capacity: 50, type: 'Aula' }
          ]
        },
        {
          id: 3,
          name: 'Laboratorios',
          count: 8,
          spaces: [
            { id: 7, name: 'Lab Química', capacity: 30, type: 'Laboratorio' },
            { id: 8, name: 'Lab Física', capacity: 30, type: 'Laboratorio' },
            { id: 9, name: 'Lab Biología', capacity: 25, type: 'Laboratorio' }
          ]
        },
        {
          id: 4,
          name: 'Salas de Reunión',
          count: 5,
          spaces: [
            { id: 10, name: 'Sala Junta Directiva', capacity: 20, type: 'Sala' },
            { id: 11, name: 'Sala Ejecutiva', capacity: 15, type: 'Sala' },
            { id: 12, name: 'Sala Conferencias', capacity: 50, type: 'Sala' }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Colegio Técnico',
      sections: [
        {
          id: 5,
          name: 'Aulas',
          count: 20,
          spaces: [
            { id: 13, name: 'Aula A', capacity: 35, type: 'Aula' },
            { id: 14, name: 'Aula B', capacity: 35, type: 'Aula' },
            { id: 15, name: 'Aula C', capacity: 40, type: 'Aula' }
          ]
        },
        {
          id: 6,
          name: 'Talleres',
          count: 10,
          spaces: [
            { id: 16, name: 'Taller Mecánica', capacity: 20, type: 'Taller' },
            { id: 17, name: 'Taller Electricidad', capacity: 20, type: 'Taller' },
            { id: 18, name: 'Taller Electrónica', capacity: 25, type: 'Taller' }
          ]
        }
      ]
    },
    {
      id: 3,
      name: 'Centro Empresarial',
      sections: [
        {
          id: 7,
          name: 'Oficinas',
          count: 15,
          spaces: [
            { id: 19, name: 'Oficina 101', capacity: 5, type: 'Oficina' },
            { id: 20, name: 'Oficina 102', capacity: 5, type: 'Oficina' },
            { id: 21, name: 'Oficina 201', capacity: 8, type: 'Oficina' }
          ]
        },
        {
          id: 8,
          name: 'Salas de Conferencia',
          count: 6,
          spaces: [
            { id: 22, name: 'Sala Ejecutiva', capacity: 30, type: 'Sala' },
            { id: 23, name: 'Sala Negocios', capacity: 25, type: 'Sala' },
            { id: 24, name: 'Sala Capacitación', capacity: 50, type: 'Sala' }
          ]
        }
      ]
    }
  ];

  sections: any[] = [];
  spaces: any[] = [];

  // Calendario
  currentDate: Date = new Date();
  daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'];
  monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  calendarDays: CalendarDay[] = [];

  // Panel lateral
  selectedSpaceDetails = {
    name: 'Auditorio Principal',
    capacity: 500,
    type: 'Auditorio',
    status: 'Disponible',
    section: 'Auditorios',
    institution: 'Universidad Nacional de Colombia',
    amenities: ['Proyector', 'Sonido Profesional', 'Aire Acondicionado', 'WiFi']
  };

  // Modal de Editar Disponibilidad
  showEditModal = false;
  editFormData = {
    selectedDate: '',
    startTime: '09:00',
    endTime: '17:00',
    status: 'available' as 'occupied' | 'available',
    title: ''
  };
  availableHours = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, '0')}:00`
  );

  ngOnInit(): void {
    this.loadInstitutionData();
    this.generateCalendar();
  }

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

  selectInstitution(institution: any): void {
    this.selectedInstitution = institution.name;
    this.loadInstitutionData();
  }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);

    const firstDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const prevTotalDays = prevLastDay.getDate();

    this.calendarDays = [];

    // Días del mes anterior
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      this.calendarDays.push({
        date: prevTotalDays - i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false,
        events: [],
        isToday: false
      });
    }

    // Días del mes actual
    const today = new Date();
    for (let i = 1; i <= totalDays; i++) {
      const isToday = i === today.getDate() &&
                      month === today.getMonth() &&
                      year === today.getFullYear();

      this.calendarDays.push({
        date: i,
        month: month,
        year: year,
        isCurrentMonth: true,
        events: this.generateDayEvents(i),
        isToday: isToday
      });
    }

    // Días del mes siguiente
    const remainingDays = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      this.calendarDays.push({
        date: i,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
        events: [],
        isToday: false
      });
    }
  }

  generateDayEvents(dayOfMonth: number): CalendarEvent[] {
    // Simular eventos estáticos para ciertos días
    const eventMap: { [key: number]: CalendarEvent[] } = {
      1: [{ time: '10:00-12:00', status: 'occupied', title: 'Reunión' }],
      5: [{ time: '14:00-16:00', status: 'occupied', title: 'Conferencia' }],
      10: [
        { time: '09:00-11:00', status: 'occupied', title: 'Clase' },
        { time: '14:00-16:00', status: 'available', title: 'Disponible' }
      ],
      15: [{ time: '11:00-13:00', status: 'occupied', title: 'Evento' }],
      20: [{ time: '15:00-17:00', status: 'available', title: 'Disponible' }],
      25: [
        { time: '08:00-10:00', status: 'occupied', title: 'Capacitación' },
        { time: '10:30-12:30', status: 'occupied', title: 'Reunión' }
      ],
      28: [{ time: '13:00-15:00', status: 'available', title: 'Disponible' }]
    };

    return eventMap[dayOfMonth] || [];
  }

  previousMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1
    );
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1
    );
    this.generateCalendar();
  }

  selectSection(section: any): void {
    this.selectedSection = section.name;
    this.spaces = section.spaces;
    if (this.spaces.length > 0) {
      this.selectSpace(this.spaces[0]);
    }
  }

  selectSpace(space: any): void {
    this.selectedSpace = space.name;
    this.selectedSpaceDetails.name = space.name;
    this.selectedSpaceDetails.capacity = space.capacity;
    this.selectedSpaceDetails.type = space.type;
  }

  getEventColor(status: string): string {
    return status === 'occupied' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-green-100 text-green-700 border-green-300';
  }

  getStatusColor(status: string): string {
    return status === 'Disponible' ? 'text-green-600' : 'text-red-600';
  }

  // Métodos para editar disponibilidad
  openEditModal(): void {
    this.editFormData = {
      selectedDate: '',
      startTime: '09:00',
      endTime: '17:00',
      status: 'available',
      title: ''
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  saveAvailability(): void {
    if (!this.editFormData.selectedDate || !this.editFormData.startTime || !this.editFormData.endTime) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const [selectedDay, selectedMonth, selectedYear] = this.editFormData.selectedDate.split('/').map(Number);

    // Encontrar el día en el calendario
    const dayIndex = this.calendarDays.findIndex(
      d => d.date === selectedDay && d.month === selectedMonth - 1 && d.year === selectedYear
    );

    if (dayIndex !== -1) {
      // Crear nuevo evento
      const newEvent: CalendarEvent = {
        time: `${this.editFormData.startTime}-${this.editFormData.endTime}`,
        status: this.editFormData.status,
        title: this.editFormData.title || (this.editFormData.status === 'occupied' ? 'Ocupado' : 'Disponible')
      };

      // Agregar el evento al día
      this.calendarDays[dayIndex].events.push(newEvent);

      // Mostrar mensaje de éxito
      alert(`✅ Disponibilidad guardada exitosamente\n\n${this.selectedSpace}\n${this.editFormData.selectedDate}\n${this.editFormData.startTime} - ${this.editFormData.endTime}\nEstado: ${this.editFormData.status === 'occupied' ? 'Ocupado' : 'Disponible'}`);

      this.closeEditModal();
    } else {
      alert('Fecha inválida. Por favor selecciona una fecha válida del calendario.');
    }
  }

  toggleEventStatus(): void {
    this.editFormData.status = this.editFormData.status === 'occupied' ? 'available' : 'occupied';
  }

  // Obtener lista de días disponibles para seleccionar
  getAvailableDates(): string[] {
    return this.calendarDays
      .filter(d => d.isCurrentMonth)
      .map(d => `${String(d.date).padStart(2, '0')}/${String(d.month + 1).padStart(2, '0')}/${d.year}`)
      .slice(0, 31); // Máximo 31 días
  }
}

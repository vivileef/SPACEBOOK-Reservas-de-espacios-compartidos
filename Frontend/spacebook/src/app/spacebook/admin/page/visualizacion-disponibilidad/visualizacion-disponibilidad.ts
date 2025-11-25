import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../../../shared/services/supabase.service';
import { ActivityLogService } from '../../../../shared/services/activity-log.service';

// Interfaces de Base de Datos
interface Institucion {
  institucionid: string;
  nombre: string;
  tipo: string;
  direccion: string;
  servicio: string;
  horarioid?: string;
}

interface Horario {
  horarioid: string;
  horainicio: string;
  horafin: string;
  semana: string; // días separados por comas: "Lunes,Martes,Miércoles"
}

interface Seccion {
  seccionid: string;
  institucionid: string;
  nombre: string;
  tipo: string;
  capacidad: number;
  calificacion: number;
  amenidades: string;
}

interface Espacio {
  espacioid: string;
  seccionid: string;
  nombre: string;
  estado: boolean;
  reservaid?: string;
}

interface Reserva {
  reservaid: string;
  usuarioid: string;
  fecha_inicio: string;
  fecha_fin: string;
  costo: number;
}

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
  reserva?: Reserva;
}

@Component({
  selector: 'app-visualizacion-disponibilidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visualizacion-disponibilidad.html',
  styleUrls: ['./visualizacion-disponibilidad.css']
})
export class VisualizacionDisponibilidadComponent implements OnInit {
  private supabase: SupabaseClient;
  private activityLog = inject(ActivityLogService);
  private router = inject(Router);

  // Datos de contexto
  selectedInstitution = '';
  selectedSection = '';
  selectedSpace = '';
  selectedInstitutionId = '';
  selectedSectionId = '';
  selectedSpaceId = '';
  horarioInstitucion = signal<Horario | null>(null);
  diasLaborables = signal<string[]>([]);
  horaApertura = signal<string>('');
  horaCierre = signal<string>('');

  // Datos desde Supabase
  instituciones = signal<Institucion[]>([]);
  secciones = signal<Seccion[]>([]);
  espacios = signal<Espacio[]>([]);
  reservas = signal<Reserva[]>([]);
  
  // Estados
  cargando = signal<boolean>(false);
  error = signal<string>('');

  // Estructura para el dropdown (compatible con el template actual)
  institutions: any[] = [];
  sections: any[] = [];
  spaces: any[] = [];

  constructor() {
    const supabaseService = inject(SupabaseService);
    this.supabase = supabaseService.getClient();
  }

  // Calendario
  currentDate: Date = new Date();
  daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'];
  monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  calendarDays: CalendarDay[] = [];

  // Panel lateral - Ahora muestra información de la SECCIÓN
  selectedSpaceDetails = {
    name: '',
    capacity: 0,
    type: '',
    status: 'Disponible',
    section: '',
    institution: '',
    amenities: [] as string[]
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
    this.cargarInstituciones();
    this.generateCalendar();
  }

  // ==================== CARGAR DATOS DESDE SUPABASE ====================
  async cargarInstituciones() {
    try {
      this.cargando.set(true);
      this.error.set('');

      const { data, error } = await this.supabase
        .from('institucion')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;

      this.instituciones.set(data || []);
      
      // Transformar a formato compatible con template
      this.institutions = (data || []).map((inst: Institucion) => ({
        id: inst.institucionid,
        name: inst.nombre,
        horarioid: inst.horarioid,
        sections: [] // Se cargarán cuando se seleccione
      }));

      // Seleccionar primera institución si existe
      if (this.institutions.length > 0) {
        await this.selectInstitution(this.institutions[0]);
      }
    } catch (error: any) {
      this.error.set('Error al cargar instituciones: ' + error.message);
      console.error('Error:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  async cargarHorarioInstitucion(horarioid: string) {
    try {
      const { data, error } = await this.supabase
        .from('horario')
        .select('*')
        .eq('horarioid', horarioid)
        .single();

      if (error) throw error;

      if (data) {
        this.horarioInstitucion.set(data);
        
        // Parsear días laborables
        const dias = data.semana ? data.semana.split(',').map((d: string) => d.trim()) : [];
        this.diasLaborables.set(dias);
        
        // Extraer horas (formato HH:MM:SS, tomamos HH:MM)
        this.horaApertura.set(data.horainicio ? data.horainicio.substring(0, 5) : '08:00');
        this.horaCierre.set(data.horafin ? data.horafin.substring(0, 5) : '18:00');
        
        console.log('Horario cargado:', {
          dias: this.diasLaborables(),
          apertura: this.horaApertura(),
          cierre: this.horaCierre()
        });
      }
    } catch (error: any) {
      console.error('Error al cargar horario:', error);
      // Usar valores por defecto si no hay horario
      this.horarioInstitucion.set(null);
      this.diasLaborables.set(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']);
      this.horaApertura.set('08:00');
      this.horaCierre.set('18:00');
    }
  }

  async cargarSecciones(institucionId: string) {
    try {
      this.cargando.set(true);

      const { data, error } = await this.supabase
        .from('seccion')
        .select('*')
        .eq('institucionid', institucionId)
        .order('nombre', { ascending: true });

      if (error) throw error;

      this.secciones.set(data || []);
      
      // Transformar a formato compatible con template
      this.sections = (data || []).map((sec: Seccion) => ({
        id: sec.seccionid,
        name: sec.nombre,
        count: 0, // Se actualizará al contar espacios
        spaces: []
      }));

      // Cargar espacios para cada sección
      for (const section of this.sections) {
        await this.cargarEspaciosParaSeccion(section.id);
      }

      // Seleccionar primera sección si existe
      if (this.sections.length > 0) {
        await this.selectSection(this.sections[0]);
      }
    } catch (error: any) {
      this.error.set('Error al cargar secciones: ' + error.message);
      console.error('Error:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  async cargarEspaciosParaSeccion(seccionId: string) {
    try {
      const { data, error } = await this.supabase
        .from('espacio')
        .select('*')
        .eq('seccionid', seccionId)
        .order('nombre', { ascending: true });

      if (error) throw error;

      const section = this.sections.find(s => s.id === seccionId);
      if (section) {
        section.spaces = await Promise.all((data || []).map(async (esp: Espacio) => {
          // Contar cuántos espacioshora tiene este espacio
          const { count, error: countError } = await this.supabase
            .from('espaciohora')
            .select('*', { count: 'exact', head: true })
            .eq('espacioid', esp.espacioid);
          
          return {
            id: esp.espacioid,
            name: esp.nombre,
            capacity: count || 0, // Total de espacioshora
            type: '' // Podemos obtenerlo de la sección
          };
        }));
        section.count = section.spaces.length;
      }
    } catch (error: any) {
      console.error('Error al cargar espacios:', error);
    }
  }

  async cargarReservasDelEspacio(espacioId: string) {
    try {
      this.cargando.set(true);

      // Obtener el espacio con su reserva actual
      const { data: espacioData, error: espacioError } = await this.supabase
        .from('espacio')
        .select('reservaid')
        .eq('espacioid', espacioId)
        .single();

      if (espacioError) throw espacioError;

      if (espacioData?.reservaid) {
        // Cargar la reserva
        const { data: reservaData, error: reservaError } = await this.supabase
          .from('reserva')
          .select('*')
          .eq('reservaid', espacioData.reservaid)
          .single();

        if (!reservaError && reservaData) {
          this.reservas.set([reservaData]);
          this.actualizarCalendarioConReservas([reservaData]);
        }
      } else {
        this.reservas.set([]);
        this.generateCalendar(); // Regenerar sin reservas
      }
    } catch (error: any) {
      this.error.set('Error al cargar reservas: ' + error.message);
      console.error('Error:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  actualizarCalendarioConReservas(reservas: Reserva[]) {
    // Limpiar eventos existentes
    this.calendarDays.forEach(day => {
      day.events = [];
    });

    // Agregar eventos desde reservas
    reservas.forEach(reserva => {
      const fechaInicio = new Date(reserva.fecha_inicio);
      const fechaFin = reserva.fecha_fin ? new Date(reserva.fecha_fin) : fechaInicio;

      // Encontrar el día en el calendario
      const dayIndex = this.calendarDays.findIndex(
        d => d.date === fechaInicio.getDate() &&
             d.month === fechaInicio.getMonth() &&
             d.year === fechaInicio.getFullYear()
      );

      if (dayIndex !== -1) {
        const horaInicio = fechaInicio.toTimeString().slice(0, 5);
        const horaFin = fechaFin.toTimeString().slice(0, 5);

        this.calendarDays[dayIndex].events.push({
          time: `${horaInicio}-${horaFin}`,
          status: 'occupied',
          title: 'Reservado',
          reserva: reserva
        });
      }
    });
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
    // Los eventos reales se cargarán desde las reservas
    // Este método se mantiene para compatibilidad pero retorna vacío
    return [];
  }

  esDiaLaborable(day: CalendarDay): boolean {
    if (!day.isCurrentMonth) return false;
    
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const fecha = new Date(day.year, day.month, day.date);
    const nombreDia = diasSemana[fecha.getDay()];
    
    const laborables = this.diasLaborables();
    return laborables.length > 0 ? laborables.includes(nombreDia) : true;
  }

  obtenerHorarioDelDia(day: CalendarDay): string {
    if (!this.esDiaLaborable(day)) {
      return 'Cerrado';
    }
    return `${this.horaApertura()} - ${this.horaCierre()}`;
  }

  previousMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1
    );
    this.generateCalendar();
    // Recargar reservas si hay un espacio seleccionado
    if (this.selectedSpaceId) {
      this.cargarReservasDelEspacio(this.selectedSpaceId);
    }
  }

  nextMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1
    );
    this.generateCalendar();
    // Recargar reservas si hay un espacio seleccionado
    if (this.selectedSpaceId) {
      this.cargarReservasDelEspacio(this.selectedSpaceId);
    }
  }

  // ==================== NAVEGACIÓN Y SELECCIÓN ====================
  async selectInstitution(institution: any): Promise<void> {
    this.selectedInstitution = institution.name;
    this.selectedInstitutionId = institution.id;
    
    // Cargar horario de la institución
    if (institution.horarioid) {
      await this.cargarHorarioInstitucion(institution.horarioid);
    } else {
      // Usar horario por defecto
      this.diasLaborables.set(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']);
      this.horaApertura.set('08:00');
      this.horaCierre.set('18:00');
    }
    
    await this.cargarSecciones(institution.id);
    this.generateCalendar(); // Regenerar calendario con el nuevo horario
  }

  async selectSection(section: any): Promise<void> {
    this.selectedSection = section.name;
    this.selectedSectionId = section.id;
    this.spaces = section.spaces;
    
    // Cargar datos completos de la sección desde Supabase para obtener amenidades
    try {
      const { data: seccionData, error } = await this.supabase
        .from('seccion')
        .select('*')
        .eq('seccionid', section.id)
        .single();

      if (error) throw error;

      if (seccionData) {
        // Actualizar panel lateral con información de la SECCIÓN
        this.selectedSpaceDetails.name = seccionData.nombre;
        this.selectedSpaceDetails.capacity = seccionData.capacidad || 0;
        this.selectedSpaceDetails.type = seccionData.tipo || '';
        this.selectedSpaceDetails.section = seccionData.nombre;
        this.selectedSpaceDetails.institution = this.selectedInstitution;
        
        // Procesar amenidades (separadas por comas)
        if (seccionData.amenidades) {
          this.selectedSpaceDetails.amenities = seccionData.amenidades
            .split(',')
            .map((a: string) => a.trim())
            .filter((a: string) => a !== '');
        } else {
          this.selectedSpaceDetails.amenities = [];
        }
      }
    } catch (error: any) {
      console.error('Error al cargar detalles de la sección:', error);
      this.selectedSpaceDetails.amenities = [];
    }

    // Ya no seleccionamos automáticamente un espacio
    // La tarjeta mostrará información de la sección completa
  }

  async selectSpace(space: any): Promise<void> {
    this.selectedSpace = space.name;
    this.selectedSpaceId = space.id;
    
    // Cargar reservas para este espacio
    await this.cargarReservasDelEspacio(space.id);
  }

  getEventColor(status: string): string {
    return status === 'occupied' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-green-100 text-green-700 border-green-300';
  }

  getStatusColor(status: string): string {
    return status === 'Disponible' ? 'text-green-600' : 'text-red-600';
  }

  // ==================== EDITAR DISPONIBILIDAD ====================
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

  async saveAvailability(): Promise<void> {
    if (!this.editFormData.selectedDate || !this.editFormData.startTime || !this.editFormData.endTime) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (!this.selectedInstitutionId) {
      alert('No hay una institución seleccionada');
      return;
    }

    try {
      this.cargando.set(true);

      // Validar que hora fin sea mayor que hora inicio
      const [horaInicioH, horaInicioM] = this.editFormData.startTime.split(':').map(Number);
      const [horaFinH, horaFinM] = this.editFormData.endTime.split(':').map(Number);
      const minutosInicio = horaInicioH * 60 + horaInicioM;
      const minutosFin = horaFinH * 60 + horaFinM;

      if (minutosFin <= minutosInicio) {
        alert('La hora de fin debe ser mayor que la hora de inicio');
        this.cargando.set(false);
        return;
      }

      const estadoDeseado = this.editFormData.status === 'occupied' ? false : true; // false = ocupado, true = disponible

      // 1. Obtener todas las secciones de la institución
      const { data: secciones, error: seccionesError } = await this.supabase
        .from('seccion')
        .select('seccionid')
        .eq('institucionid', this.selectedInstitutionId);

      if (seccionesError) throw seccionesError;

      if (!secciones || secciones.length === 0) {
        alert('No hay secciones en esta institución');
        this.cargando.set(false);
        return;
      }

      const seccionIds = secciones.map(s => s.seccionid);

      // 2. Obtener todos los espacios de esas secciones
      const { data: espacios, error: espaciosError } = await this.supabase
        .from('espacio')
        .select('espacioid')
        .in('seccionid', seccionIds);

      if (espaciosError) throw espaciosError;

      if (!espacios || espacios.length === 0) {
        alert('No hay espacios en esta institución');
        this.cargando.set(false);
        return;
      }

      const espacioIds = espacios.map(e => e.espacioid);

      // 3. Obtener todos los espacioshora que estén en el rango de tiempo
      const horaInicioFormato = this.editFormData.startTime + ':00'; // HH:MM:SS
      const horaFinFormato = this.editFormData.endTime + ':00'; // HH:MM:SS

      const { data: espaciosHora, error: espaciosHoraError } = await this.supabase
        .from('espaciohora')
        .select('espaciohoraid, horainicio, horafin')
        .in('espacioid', espacioIds);

      if (espaciosHoraError) throw espaciosHoraError;

      if (!espaciosHora || espaciosHora.length === 0) {
        alert('No hay bloques horarios configurados en esta institución');
        this.cargando.set(false);
        return;
      }

      // 4. Filtrar los espacioshora que se solapan con el rango seleccionado
      const espaciosHoraAfectados = espaciosHora.filter(eh => {
        // Convertir horarios a minutos para comparar
        const [hiH, hiM, hiS] = eh.horainicio.split(':').map(Number);
        const [hfH, hfM, hfS] = eh.horafin.split(':').map(Number);
        const minutosInicioBloque = hiH * 60 + hiM;
        const minutosFinBloque = hfH * 60 + hfM;

        // Verificar solapamiento
        // Un bloque se solapa si:
        // - Comienza antes de que termine el rango seleccionado Y
        // - Termina después de que comience el rango seleccionado
        return minutosInicioBloque < minutosFin && minutosFinBloque > minutosInicio;
      });

      if (espaciosHoraAfectados.length === 0) {
        alert('No hay bloques horarios en el rango de tiempo seleccionado');
        this.cargando.set(false);
        return;
      }

      // 5. Actualizar el estado de todos los espacioshora afectados
      const promesas = espaciosHoraAfectados.map(eh => {
        return this.supabase
          .from('espaciohora')
          .update({ estado: estadoDeseado })
          .eq('espaciohoraid', eh.espaciohoraid);
      });

      const resultados = await Promise.all(promesas);

      // Verificar si hubo errores
      const errores = resultados.filter(r => r.error);
      if (errores.length > 0) {
        console.error('Errores al actualizar:', errores);
        throw new Error('Algunos bloques no se pudieron actualizar');
      }

      const estadoTexto = estadoDeseado ? 'disponibles' : 'ocupados';
      alert(`✅ Éxito\n\nSe marcaron ${espaciosHoraAfectados.length} bloques horarios como ${estadoTexto}\n\nFecha: ${this.editFormData.selectedDate}\nHorario: ${this.editFormData.startTime} - ${this.editFormData.endTime}\nInstitución: ${this.selectedInstitution}`);
      
      this.activityLog.registrar(
        'disponibilidad_editada', 
        'Disponibilidad actualizada', 
        `${espaciosHoraAfectados.length} bloques marcados como ${estadoTexto} en "${this.selectedInstitution}" (${this.editFormData.startTime}-${this.editFormData.endTime})`
      );

      this.closeEditModal();

    } catch (error: any) {
      alert('❌ Error al guardar: ' + error.message);
      console.error('Error:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  toggleEventStatus(): void {
    this.editFormData.status = this.editFormData.status === 'occupied' ? 'available' : 'occupied';
  }

  getAvailableDates(): string[] {
    return this.calendarDays
      .filter(d => d.isCurrentMonth)
      .map(d => `${String(d.date).padStart(2, '0')}/${String(d.month + 1).padStart(2, '0')}/${d.year}`)
      .slice(0, 31);
  }

  verReservas(): void {
    this.router.navigate(['/admin-dashboard/reservas']);
  }
}

import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../../../shared/services/supabase.service';

interface Institucion {
  institucionid: string;
  nombre: string;
  horarioid?: string;
}

interface Horario {
  horarioid: string;
  horainicio: string; // formato "HH:MM"
  horafin: string; // formato "HH:MM"
  semana: string; // "Lunes,Martes,Miercoles..." días separados por coma
}

interface DiaCalendario {
  dia: number;
  mes: number;
  año: number;
  esMesActual: boolean;
  fecha: Date;
}

@Component({
  selector: 'app-calendario-disponibilidad',
  imports: [CommonModule, FormsModule],
  templateUrl: './calendario-disponibilidad.html',
  styleUrl: './calendario-disponibilidad.css',
  standalone: true
})
export class CalendarioDisponibilidad implements OnInit {
  private supabase: SupabaseClient;
  
  // Estado general
  instituciones = signal<Institucion[]>([]);
  institucionSeleccionada = signal<Institucion | null>(null);
  horarioActual = signal<Horario | null>(null);
  todosLosHorarios = signal<Horario[]>([]);
  
  // Modos de vista
  vistaActiva = signal<'instituciones' | 'horarios'>('instituciones');
  
  // Modal de horarios independientes
  mostrarModalHorarioIndependiente = signal<boolean>(false);
  modoEdicionHorario = signal<'crear' | 'editar'>('crear');
  horarioSeleccionadoParaEditar = signal<Horario | null>(null);
  
  // Calendario
  fechaActual = signal<Date>(new Date());
  diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  diasCompletos = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  // Modal de edición
  mostrarModalHorario = signal<boolean>(false);
  horarioForm = signal<{
    horainicio: string;
    horafin: string;
    diasSeleccionados: string[];
  }>({
    horainicio: '08:00',
    horafin: '18:00',
    diasSeleccionados: []
  });
  
  // Estados
  cargando = signal<boolean>(false);
  error = signal<string>('');
  mensajeExito = signal<string>('');
  
  // Computed
  diasCalendario = computed(() => {
    const fecha = this.fechaActual();
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    
    // Primer día del mes
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    
    // Días a mostrar antes del primer día
    const diasAntes = primerDia.getDay();
    
    // Días a mostrar después del último día
    const diasDespues = 6 - ultimoDia.getDay();
    
    const dias: DiaCalendario[] = [];
    
    // Días del mes anterior
    const mesAnterior = new Date(año, mes, 0);
    for (let i = diasAntes - 1; i >= 0; i--) {
      const dia = mesAnterior.getDate() - i;
      dias.push({
        dia,
        mes: mes - 1,
        año: mes === 0 ? año - 1 : año,
        esMesActual: false,
        fecha: new Date(año, mes - 1, dia)
      });
    }
    
    // Días del mes actual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      dias.push({
        dia,
        mes,
        año,
        esMesActual: true,
        fecha: new Date(año, mes, dia)
      });
    }
    
    // Días del mes siguiente
    for (let i = 1; i <= diasDespues; i++) {
      dias.push({
        dia: i,
        mes: mes + 1,
        año: mes === 11 ? año + 1 : año,
        esMesActual: false,
        fecha: new Date(año, mes + 1, i)
      });
    }
    
    return dias;
  });
  
  mesActualTexto = computed(() => {
    const fecha = this.fechaActual();
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  });
  
  diasLaboralesArray = computed(() => {
    const horario = this.horarioActual();
    if (!horario || !horario.semana) return [];
    return horario.semana.split(',').map(d => d.trim());
  });

  constructor() {
    const supabaseService = inject(SupabaseService);
    this.supabase = supabaseService.getClient();
  }

  ngOnInit() {
    this.cargarInstituciones();
    this.cargarTodosLosHorarios();
    this.liberarBloquesVencidos();
  }

  // ==================== LIBERACIÓN AUTOMÁTICA ====================
  async liberarBloquesVencidos() {
    try {
      const ahora = new Date();
      const fechaHoy = ahora.toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
      const horaActual = ahora.toTimeString().split(' ')[0]; // Hora actual en formato HH:MM:SS

      // Obtener todos los espaciohora que están ocupados manualmente (sin reservaid)
      const { data: bloquesOcupados, error } = await this.supabase
        .from('espaciohora')
        .select('espaciohoraid, horainicio, horafin, espacioid')
        .eq('estado', false)
        .is('reservaid', null);

      if (error) throw error;

      if (!bloquesOcupados || bloquesOcupados.length === 0) return;

      // Filtrar bloques cuya hora ya pasó
      const bloquesALiberar = bloquesOcupados.filter(bloque => {
        // Comparar solo horas (asumiendo que todos están en el mismo día o son recurrentes)
        return bloque.horafin < horaActual;
      });

      if (bloquesALiberar.length === 0) return;

      // Liberar los bloques
      const promesas = bloquesALiberar.map(bloque => {
        return this.supabase
          .from('espaciohora')
          .update({ estado: true })
          .eq('espaciohoraid', bloque.espaciohoraid);
      });

      await Promise.all(promesas);

      // Actualizar estados de espacios si todos sus bloques están disponibles
      const espaciosAfectados = [...new Set(bloquesALiberar.map(b => b.espacioid))];
      
      for (const espacioid of espaciosAfectados) {
        const { data: todosLosBloques } = await this.supabase
          .from('espaciohora')
          .select('estado')
          .eq('espacioid', espacioid);

        const todosDisponibles = todosLosBloques?.every(b => b.estado === true);

        if (todosDisponibles) {
          await this.supabase
            .from('espacio')
            .update({ estado: true })
            .eq('espacioid', espacioid);
        }
      }

      console.log(`Liberados ${bloquesALiberar.length} bloques que ya pasaron su horario`);
    } catch (err) {
      console.error('Error al liberar bloques vencidos:', err);
    }
  }

  // ==================== CARGA DE DATOS ====================
  async cargarTodosLosHorarios() {
    try {
      this.cargando.set(true);
      
      const { data, error } = await this.supabase
        .from('horario')
        .select('*')
        .order('horainicio', { ascending: true });

      if (error) throw error;
      
      console.log('Horarios cargados:', data);
      this.todosLosHorarios.set(data || []);
    } catch (error: any) {
      console.error('Error al cargar horarios:', error);
      this.error.set('Error al cargar los horarios');
    } finally {
      this.cargando.set(false);
    }
  }
  async cargarInstituciones() {
    try {
      this.cargando.set(true);
      this.error.set('');
      
      const { data, error } = await this.supabase
        .from('institucion')
        .select('institucionid, nombre, horarioid')
        .order('nombre', { ascending: true});

      if (error) throw error;
      
      this.instituciones.set(data || []);
    } catch (error: any) {
      this.error.set('Error al cargar las instituciones');
      console.error('Error:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  async seleccionarInstitucion(institucion: Institucion) {
    this.institucionSeleccionada.set(institucion);
    
    if (institucion.horarioid) {
      await this.cargarHorario(institucion.horarioid);
    } else {
      this.horarioActual.set(null);
    }
  }

  async cargarHorario(horarioid: string) {
    try {
      this.cargando.set(true);
      
      const { data, error } = await this.supabase
        .from('horario')
        .select('*')
        .eq('horarioid', horarioid)
        .single();

      if (error) throw error;
      
      this.horarioActual.set(data);
    } catch (error: any) {
      this.error.set('Error al cargar el horario');
      console.error('Error:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  // ==================== NAVEGACIÓN CALENDARIO ====================
  mesAnterior() {
    const fecha = this.fechaActual();
    this.fechaActual.set(new Date(fecha.getFullYear(), fecha.getMonth() - 1, 1));
  }

  mesSiguiente() {
    const fecha = this.fechaActual();
    this.fechaActual.set(new Date(fecha.getFullYear(), fecha.getMonth() + 1, 1));
  }

  irAHoy() {
    this.fechaActual.set(new Date());
  }

  // ==================== GESTIÓN DE HORARIOS ====================
  cambiarVista(vista: 'instituciones' | 'horarios') {
    this.vistaActiva.set(vista);
    this.limpiarMensajes();
  }

  abrirModalHorarioIndependiente(modo: 'crear' | 'editar', horario?: Horario) {
    this.modoEdicionHorario.set(modo);
    
    if (modo === 'editar' && horario) {
      this.horarioSeleccionadoParaEditar.set(horario);
      this.horarioForm.set({
        horainicio: horario.horainicio || '08:00',
        horafin: horario.horafin || '18:00',
        diasSeleccionados: horario.semana ? horario.semana.split(',').map(d => d.trim()) : []
      });
    } else {
      this.horarioSeleccionadoParaEditar.set(null);
      this.horarioForm.set({
        horainicio: '08:00',
        horafin: '18:00',
        diasSeleccionados: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
      });
    }
    
    this.mostrarModalHorarioIndependiente.set(true);
    this.limpiarMensajes();
  }

  cerrarModalHorarioIndependiente() {
    this.mostrarModalHorarioIndependiente.set(false);
    this.horarioSeleccionadoParaEditar.set(null);
  }

  async guardarHorarioIndependiente() {
    const form = this.horarioForm();
    
    if (form.diasSeleccionados.length === 0) {
      this.error.set('Debe seleccionar al menos un día');
      return;
    }
    
    if (!form.horainicio || !form.horafin) {
      this.error.set('Debe especificar hora de inicio y fin');
      return;
    }

    try {
      this.cargando.set(true);
      this.error.set('');
      
      const semanaTexto = form.diasSeleccionados.join(',');
      
      if (this.modoEdicionHorario() === 'editar') {
        const horarioEditar = this.horarioSeleccionadoParaEditar();
        if (!horarioEditar) return;

        const { error } = await this.supabase
          .from('horario')
          .update({
            horainicio: form.horainicio,
            horafin: form.horafin,
            semana: semanaTexto
          })
          .eq('horarioid', horarioEditar.horarioid);

        if (error) throw error;
        this.mensajeExito.set('Horario actualizado exitosamente');
      } else {
        const { error } = await this.supabase
          .from('horario')
          .insert([{
            horainicio: form.horainicio,
            horafin: form.horafin,
            semana: semanaTexto
          }]);

        if (error) throw error;
        this.mensajeExito.set('Horario creado exitosamente');
      }

      await this.cargarTodosLosHorarios();
      
      setTimeout(() => {
        this.cerrarModalHorarioIndependiente();
        this.mensajeExito.set('');
      }, 1500);

    } catch (error: any) {
      this.error.set('Error al guardar el horario');
      console.error('Error:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  async eliminarHorario(horario: Horario) {
    // Verificar si el horario está en uso
    const enUso = this.instituciones().some(inst => inst.horarioid === horario.horarioid);
    
    if (enUso) {
      this.error.set('No se puede eliminar este horario porque está asignado a una o más instituciones');
      setTimeout(() => this.error.set(''), 4000);
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar este horario?\n${horario.horainicio} - ${horario.horafin}`)) {
      return;
    }

    try {
      this.cargando.set(true);
      this.error.set('');

      const { error } = await this.supabase
        .from('horario')
        .delete()
        .eq('horarioid', horario.horarioid);

      if (error) throw error;

      this.mensajeExito.set('Horario eliminado exitosamente');
      await this.cargarTodosLosHorarios();

      setTimeout(() => {
        this.mensajeExito.set('');
      }, 3000);

    } catch (error: any) {
      this.error.set('Error al eliminar el horario');
      console.error('Error:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  obtenerInstitucionesConHorario(horarioid: string): string[] {
    return this.instituciones()
      .filter(inst => inst.horarioid === horarioid)
      .map(inst => inst.nombre);
  }
  abrirModalHorario() {
    const horario = this.horarioActual();
    
    if (horario) {
      this.horarioForm.set({
        horainicio: horario.horainicio || '08:00',
        horafin: horario.horafin || '18:00',
        diasSeleccionados: horario.semana ? horario.semana.split(',').map(d => d.trim()) : []
      });
    } else {
      this.horarioForm.set({
        horainicio: '08:00',
        horafin: '18:00',
        diasSeleccionados: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
      });
    }
    
    this.mostrarModalHorario.set(true);
    this.limpiarMensajes();
  }

  cerrarModalHorario() {
    this.mostrarModalHorario.set(false);
  }

  toggleDia(dia: string) {
    const form = this.horarioForm();
    const diasActuales = [...form.diasSeleccionados];
    
    const index = diasActuales.indexOf(dia);
    if (index > -1) {
      diasActuales.splice(index, 1);
    } else {
      diasActuales.push(dia);
    }
    
    this.horarioForm.set({
      ...form,
      diasSeleccionados: diasActuales
    });
  }

  isDiaSeleccionado(dia: string): boolean {
    return this.horarioForm().diasSeleccionados.includes(dia);
  }

  async guardarHorario() {
    const form = this.horarioForm();
    const institucion = this.institucionSeleccionada();
    
    if (!institucion) {
      this.error.set('No hay una institución seleccionada');
      return;
    }
    
    if (form.diasSeleccionados.length === 0) {
      this.error.set('Debe seleccionar al menos un día');
      return;
    }
    
    if (!form.horainicio || !form.horafin) {
      this.error.set('Debe especificar hora de inicio y fin');
      return;
    }

    try {
      this.cargando.set(true);
      this.error.set('');
      
      const semanaTexto = form.diasSeleccionados.join(',');
      
      if (institucion.horarioid) {
        // Actualizar horario existente
        const { error } = await this.supabase
          .from('horario')
          .update({
            horainicio: form.horainicio,
            horafin: form.horafin,
            semana: semanaTexto
          })
          .eq('horarioid', institucion.horarioid);

        if (error) throw error;
        
        await this.cargarHorario(institucion.horarioid);
      } else {
        // Crear nuevo horario
        const { data: nuevoHorario, error: errorHorario } = await this.supabase
          .from('horario')
          .insert([{
            horainicio: form.horainicio,
            horafin: form.horafin,
            semana: semanaTexto
          }])
          .select()
          .single();

        if (errorHorario) throw errorHorario;

        // Actualizar institución con el nuevo horarioid
        const { error: errorInstitucion } = await this.supabase
          .from('institucion')
          .update({ horarioid: nuevoHorario.horarioid })
          .eq('institucionid', institucion.institucionid);

        if (errorInstitucion) throw errorInstitucion;

        // Actualizar estado local
        this.institucionSeleccionada.set({
          ...institucion,
          horarioid: nuevoHorario.horarioid
        });
        
        this.horarioActual.set(nuevoHorario);
        await this.cargarInstituciones();
      }

      this.mensajeExito.set('Horario guardado exitosamente');
      
      setTimeout(() => {
        this.cerrarModalHorario();
        this.mensajeExito.set('');
      }, 1500);

    } catch (error: any) {
      this.error.set('Error al guardar el horario');
      console.error('Error:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  // ==================== UTILIDADES ====================
  esDiaLaboral(fecha: Date): boolean {
    const horario = this.horarioActual();
    if (!horario || !horario.semana) return false;
    
    const nombreDia = this.diasCompletos[fecha.getDay()];
    return this.diasLaboralesArray().includes(nombreDia);
  }

  actualizarHoraInicio(value: string) {
    const form = this.horarioForm();
    this.horarioForm.set({
      ...form,
      horainicio: value
    });
  }

  actualizarHoraFin(value: string) {
    const form = this.horarioForm();
    this.horarioForm.set({
      ...form,
      horafin: value
    });
  }

  limpiarMensajes() {
    this.error.set('');
    this.mensajeExito.set('');
  }

  formatearHora(hora: string): string {
    if (!hora) return '';
    return hora.substring(0, 5); // Solo HH:MM
  }
}

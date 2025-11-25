import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../../../shared/services/database.service';
import { Auth } from '../../../../shared/services/auth.service';
import { Reserva, Espacio, Usuario } from '../../../../shared/models/database.models';
import { SupabaseService } from '../../../../shared/services/supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';

type ReservaDetallada = Reserva & {
  espacio?: Espacio;
  usuario?: Usuario;
  nombreEspacio?: string;
  nombreUsuario?: string;
  horaFin?: string;
  horarioCierreInstitucion?: string;
};

@Component({
  selector: 'app-gestionar-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-reservas.html'
})
export class GestionarReservasComponent implements OnInit {
  private supabase: SupabaseClient;
  
  reservasActivas = signal<ReservaDetallada[]>([]);
  reservasPasadas = signal<ReservaDetallada[]>([]);
  todasReservas = signal<ReservaDetallada[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  
  // Filtros
  filtroEstado = signal<'todas' | 'activas' | 'pasadas'>('activas');
  filtroBusqueda = signal('');
  
  // Modal de edición
  mostrarModal = signal(false);
  reservaEditando = signal<ReservaDetallada | null>(null);
  
  // Formulario de edición
  formNombre = signal('');
  formDescripcion = signal('');
  formFecha = signal('');
  formHora = signal('');

  constructor(
    private dbService: DatabaseService,
    private auth: Auth,
    private supabaseService: SupabaseService
  ) {
    this.supabase = supabaseService.getClient();
  }

  async ngOnInit() {
    await this.cargarTodasReservas();
  }

  async cargarTodasReservas() {
    try {
      this.cargando.set(true);
      this.error.set(null);

      // Obtener todas las reservas usando Supabase directamente
      const { data: reservas, error } = await this.supabase
        .from('reserva')
        .select(`
          *,
          usuarios!reserva_usuarioid_fkey (
            nombre,
            apellido,
            correo
          )
        `)
        .order('fechareserva', { ascending: false });

      if (error) {
        console.error('Error al cargar reservas:', error);
        this.error.set('Error al cargar las reservas');
        return;
      }

      // Obtener todos los espaciohora para mapear espacios y horarios
      const { data: espaciosHora } = await this.supabase
        .from('espaciohora')
        .select(`
          reservaid,
          horafin,
          espacio:espacioid (
            nombre,
            seccion:seccionid (
              institucion:institucionid (
                horario:horarioid (
                  horafin
                )
              )
            )
          )
        `)
        .not('reservaid', 'is', null);

      // Crear mapas de reservaid -> datos
      const mapaEspacios = new Map<string, string>();
      const mapaHorarioInstitucional = new Map<string, string>();
      
      if (espaciosHora) {
        espaciosHora.forEach((eh: any) => {
          if (eh.reservaid) {
            // Nombre del espacio
            if (eh.espacio?.nombre) {
              mapaEspacios.set(eh.reservaid, eh.espacio.nombre);
            }
            // Horario de cierre de la institución
            if (eh.espacio?.seccion?.institucion?.horario?.horafin) {
              mapaHorarioInstitucional.set(eh.reservaid, eh.espacio.seccion.institucion.horario.horafin);
            }
          }
        });
      }

      // Procesar las reservas
      const ahora = new Date();
      const activas: ReservaDetallada[] = [];
      const pasadas: ReservaDetallada[] = [];
      const todas: ReservaDetallada[] = [];

      if (reservas) {
        for (const reserva of reservas) {
          const horarioCierre = mapaHorarioInstitucional.get(reserva.reservaid);
          
          const reservaDetallada: ReservaDetallada = {
            ...reserva,
            nombreEspacio: mapaEspacios.get(reserva.reservaid) || 'Sin espacio asignado',
            nombreUsuario: (reserva as any).usuarios ? 
              `${(reserva as any).usuarios.nombre} ${(reserva as any).usuarios.apellido}` : 
              'Usuario desconocido',
            horarioCierreInstitucion: horarioCierre
          };

          todas.push(reservaDetallada);
          
          // Determinar si está activa o pasada usando el horario de cierre de la institución
          const fechaInicio = new Date(reserva.fechareserva);
          let fechaFin: Date;
          
          if (horarioCierre) {
            // Usar el horario de cierre de la institución como hora de fin
            const [horas, minutos, segundos] = horarioCierre.split(':');
            fechaFin = new Date(fechaInicio);
            fechaFin.setHours(parseInt(horas), parseInt(minutos), parseInt(segundos || '0'));
          } else {
            // Si no hay horario, la reserva se considera completada cuando pasa la hora de inicio
            fechaFin = fechaInicio;
          }
          
          if (fechaFin > ahora) {
            activas.push(reservaDetallada);
          } else {
            pasadas.push(reservaDetallada);
          }
        }
      }

      this.todasReservas.set(todas);
      this.reservasActivas.set(activas);
      this.reservasPasadas.set(pasadas);
    } catch (err: any) {
      console.error('Error al cargar reservas:', err);
      this.error.set('Error al cargar las reservas. Por favor, intenta de nuevo.');
    } finally {
      this.cargando.set(false);
    }
  }

  get reservasFiltradas(): ReservaDetallada[] {
    let reservas: ReservaDetallada[] = [];
    
    switch (this.filtroEstado()) {
      case 'activas':
        reservas = this.reservasActivas();
        break;
      case 'pasadas':
        reservas = this.reservasPasadas();
        break;
      case 'todas':
        reservas = this.todasReservas();
        break;
    }

    // Aplicar búsqueda
    const busqueda = this.filtroBusqueda().toLowerCase();
    if (busqueda) {
      reservas = reservas.filter(r => 
        r.nombrereserva?.toLowerCase().includes(busqueda) ||
        r.nombreEspacio?.toLowerCase().includes(busqueda) ||
        r.nombreUsuario?.toLowerCase().includes(busqueda)
      );
    }

    return reservas;
  }

  abrirModalEdicion(reserva: ReservaDetallada) {
    this.reservaEditando.set(reserva);
    
    // Cargar datos en el formulario
    this.formNombre.set(reserva.nombrereserva || '');
    this.formDescripcion.set(''); // Descripcion no existe en BD, campo para notas internas
    
    // Separar fecha y hora
    const fecha = new Date(reserva.fechareserva);
    this.formFecha.set(fecha.toISOString().split('T')[0]);
    this.formHora.set(fecha.toTimeString().slice(0, 5));
    
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
    this.reservaEditando.set(null);
  }

  async guardarCambios() {
    const reserva = this.reservaEditando();
    if (!reserva) return;

    try {
      // Combinar fecha y hora
      const fechaHora = new Date(`${this.formFecha()}T${this.formHora()}`);

      // Actualizar reserva
      const { error } = await this.supabase
        .from('reserva')
        .update({
          nombrereserva: this.formNombre(),
          fechareserva: fechaHora.toISOString()
        })
        .eq('reservaid', reserva.reservaid);

      if (error) {
        console.error('Error al actualizar reserva:', error);
        alert('Error al actualizar la reserva');
        return;
      }

      // Crear notificación para el usuario
      if (reserva.usuarioid) {
        await this.dbService.createNotificacion({
          fechanotificacion: new Date().toISOString(),
          descripcion: `Tu reserva "${this.formNombre()}" ha sido modificada por un administrador.`,
          usuarioid: reserva.usuarioid
        });
      }

      alert('Reserva actualizada exitosamente');
      this.cerrarModal();
      await this.cargarTodasReservas();
    } catch (err: any) {
      console.error('Error al guardar cambios:', err);
      alert('Error al guardar los cambios');
    }
  }

  async eliminarReserva(reserva: ReservaDetallada) {
    if (!confirm(`¿Estás seguro de que deseas eliminar la reserva "${reserva.nombrereserva}"?`)) {
      return;
    }

    try {
      await this.dbService.deleteReserva(reserva.reservaid);
      
      // Crear notificación para el usuario
      if (reserva.usuarioid) {
        await this.dbService.createNotificacion({
          fechanotificacion: new Date().toISOString(),
          descripcion: `Tu reserva "${reserva.nombrereserva}" del ${this.formatearFecha(reserva.fechareserva)} ha sido cancelada por un administrador.`,
          usuarioid: reserva.usuarioid
        });
      }

      alert('Reserva eliminada exitosamente');
      await this.cargarTodasReservas();
    } catch (err: any) {
      console.error('Error al eliminar reserva:', err);
      alert('Error al eliminar la reserva');
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearFechaCorta(fecha: string): string {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerEstadoReserva(reserva: ReservaDetallada): string {
    const ahora = new Date();
    const fechaInicio = new Date(reserva.fechareserva);
    
    // Usar el horario de cierre de la institución para determinar si está completada
    if (reserva.horarioCierreInstitucion) {
      const [horas, minutos, segundos] = reserva.horarioCierreInstitucion.split(':');
      const fechaFin = new Date(fechaInicio);
      fechaFin.setHours(parseInt(horas), parseInt(minutos), parseInt(segundos || '0'));
      
      if (fechaFin < ahora) {
        return 'Completada';
      } else {
        return 'Próxima';
      }
    }
    
    // Si no hay horario institucional, usar la fecha de inicio
    if (fechaInicio < ahora) {
      return 'Completada';
    } else {
      return 'Próxima';
    }
  }

  obtenerColorEstado(reserva: ReservaDetallada): string {
    const estado = this.obtenerEstadoReserva(reserva);
    switch (estado) {
      case 'Completada': 
        return 'bg-gray-100 text-gray-800';
      case 'Próxima': 
        return 'bg-green-100 text-green-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  }

  cambiarFiltro(filtro: 'todas' | 'activas' | 'pasadas') {
    this.filtroEstado.set(filtro);
  }
}

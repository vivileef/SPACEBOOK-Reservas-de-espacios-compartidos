import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../../../shared/services/supabase.service';
import { Auth } from '../../../../shared/services/auth.service';

interface Reserva {
  reservaid: string;
  usuarioid: string;
  nombrereserva: string;
  fechareserva: string;
}

interface EspacioHora {
  espaciohoraid: string;
  nombre: string;
  horainicio: string;
  horafin: string;
  espacioid: string;
  reservaid: string;
  estado: boolean;
}

interface ReservaConDetalles extends Reserva {
  bloques: EspacioHora[];
  nombreEspacio?: string;
  nombreSeccion?: string;
  nombreInstitucion?: string;
}

@Component({
  selector: 'app-sistema-reservas',
  imports: [CommonModule, FormsModule],
  templateUrl: './sistema-reservas.html',
  styleUrl: './sistema-reservas.css',
  standalone: true
})
export class SistemaReservas implements OnInit {
  private supabase: SupabaseClient;
  private auth = inject(Auth);
  
  reservas = signal<ReservaConDetalles[]>([]);
  cargando = signal(true);
  error = signal('');
  mensajeExito = signal('');
  
  mostrarModalDetalle = signal(false);
  reservaSeleccionada = signal<ReservaConDetalles | null>(null);
  cargandoCancelacion = signal(false);

  constructor() {
    const supabaseService = inject(SupabaseService);
    this.supabase = supabaseService.getClient();
  }

  async ngOnInit() {
    await this.cargarReservas();
  }

  async cargarReservas() {
    const usuario = this.auth.profile();
    
    if (!usuario?.usuarioid) {
      this.error.set('Debe iniciar sesión para ver sus reservas');
      this.cargando.set(false);
      return;
    }

    try {
      this.cargando.set(true);
      this.error.set('');

      // 1. Obtener todas las reservas del usuario
      const { data: reservasData, error: reservasError } = await this.supabase
        .from('reserva')
        .select('*')
        .eq('usuarioid', usuario.usuarioid)
        .order('fechareserva', { ascending: false });

      if (reservasError) throw reservasError;

      if (!reservasData || reservasData.length === 0) {
        this.reservas.set([]);
        this.cargando.set(false);
        return;
      }

      // 2. Para cada reserva, obtener sus bloques horarios y detalles
      const reservasConDetalles: ReservaConDetalles[] = [];

      for (const reserva of reservasData) {
        // Primero intentar obtener bloques vinculados (reservaid)
        let { data: bloques, error: bloquesError } = await this.supabase
          .from('espaciohora')
          .select('*')
          .eq('reservaid', reserva.reservaid)
          .order('horainicio', { ascending: true });

        if (bloquesError) {
          console.error('Error cargando bloques:', bloquesError);
          continue;
        }

        // Si no hay bloques vinculados, buscar en el historial (para reservas ya liberadas)
        // Guardamos el espacioid en la reserva o buscamos bloques con fechas coincidentes
        if (!bloques || bloques.length === 0) {
          // Para reservas antiguas que ya fueron liberadas, no tenemos forma de recuperar
          // los bloques específicos sin un campo adicional en la BD
          // Por ahora, agregamos la reserva sin bloques
          reservasConDetalles.push({
            ...reserva,
            bloques: [],
            nombreEspacio: 'Espacio liberado',
            nombreSeccion: '',
            nombreInstitucion: ''
          });
          continue;
        }

        if (bloques && bloques.length > 0) {
          // Obtener nombre del espacio
          const { data: espacioData } = await this.supabase
            .from('espacio')
            .select('nombre, seccionid')
            .eq('espacioid', bloques[0].espacioid)
            .single();

          let nombreSeccion = '';
          let nombreInstitucion = '';

          if (espacioData) {
            // Obtener nombre de la sección
            const { data: seccionData } = await this.supabase
              .from('seccion')
              .select('nombre, institucionid')
              .eq('seccionid', espacioData.seccionid)
              .single();

            if (seccionData) {
              nombreSeccion = seccionData.nombre;

              // Obtener nombre de la institución
              const { data: institucionData } = await this.supabase
                .from('institucion')
                .select('nombre')
                .eq('institucionid', seccionData.institucionid)
                .single();

              if (institucionData) {
                nombreInstitucion = institucionData.nombre;
              }
            }
          }

          reservasConDetalles.push({
            ...reserva,
            bloques: bloques,
            nombreEspacio: espacioData?.nombre || 'Desconocido',
            nombreSeccion,
            nombreInstitucion
          });
        }
      }

      this.reservas.set(reservasConDetalles);

      // Liberar automáticamente las reservas que ya pasaron
      await this.liberarReservasVencidas(reservasConDetalles);

    } catch (err: any) {
      this.error.set('Error al cargar reservas: ' + err.message);
      console.error(err);
    } finally {
      this.cargando.set(false);
    }
  }

  async liberarReservasVencidas(reservas: ReservaConDetalles[]) {
    const ahora = new Date();

    for (const reserva of reservas) {
      if (!this.reservaEstaActiva(reserva)) {
        // La reserva ya venció, verificar si los bloques aún tienen reservaid
        const primerBloque = reserva.bloques[0];
        if (!primerBloque || !primerBloque.reservaid) {
          // Ya fue liberada anteriormente
          continue;
        }

        // La reserva ya venció, liberar los espacios
        try {
          // 1. Liberar todos los espaciohora de esta reserva
          const promesas = reserva.bloques.map(bloque => {
            return this.supabase
              .from('espaciohora')
              .update({
                reservaid: null,
                estado: true
              })
              .eq('espaciohoraid', bloque.espaciohoraid);
          });

          await Promise.all(promesas);

          // 2. Marcar el espacio como disponible
          if (reserva.bloques.length > 0) {
            const espacioid = reserva.bloques[0].espacioid;
            await this.supabase
              .from('espacio')
              .update({ estado: true })
              .eq('espacioid', espacioid);
          }

          console.log(`Reserva vencida liberada: ${reserva.nombrereserva}`);
        } catch (err) {
          console.error('Error al liberar reserva vencida:', err);
        }
      }
    }
  }

  verDetalle(reserva: ReservaConDetalles) {
    this.reservaSeleccionada.set(reserva);
    this.mostrarModalDetalle.set(true);
  }

  cerrarModal() {
    this.mostrarModalDetalle.set(false);
    this.reservaSeleccionada.set(null);
  }

  async cancelarReserva(reserva: ReservaConDetalles) {
    if (!confirm(`¿Estás seguro de cancelar la reserva "${reserva.nombrereserva}"?\n\nSe liberarán ${reserva.bloques.length} bloques horarios.`)) {
      return;
    }

    try {
      this.cargandoCancelacion.set(true);
      this.error.set('');

      // 1. Actualizar todos los espaciohora: quitar reservaid y marcar como disponible
      const promesas = reserva.bloques.map(bloque => {
        return this.supabase
          .from('espaciohora')
          .update({
            reservaid: null,
            estado: true // Disponible
          })
          .eq('espaciohoraid', bloque.espaciohoraid);
      });

      const resultados = await Promise.all(promesas);
      const errores = resultados.filter(r => r.error);
      
      if (errores.length > 0) {
        console.error('Errores al liberar bloques:', errores);
        throw new Error('Error al liberar algunos bloques horarios');
      }

      // 2. Verificar si ahora hay al menos un espaciohora disponible para marcar el espacio como disponible
      if (reserva.bloques.length > 0) {
        const espacioid = reserva.bloques[0].espacioid;
        
        const { data: espaciosHora } = await this.supabase
          .from('espaciohora')
          .select('estado')
          .eq('espacioid', espacioid);

        // Si hay al menos uno disponible, el espacio debe estar disponible
        const hayDisponibles = espaciosHora?.some(eh => eh.estado === true);

        if (hayDisponibles) {
          await this.supabase
            .from('espacio')
            .update({ estado: true })
            .eq('espacioid', espacioid);
        }
      }

      // 3. Eliminar la reserva
      const { error: deleteError } = await this.supabase
        .from('reserva')
        .delete()
        .eq('reservaid', reserva.reservaid);

      if (deleteError) throw deleteError;

      this.mensajeExito.set('Reserva cancelada exitosamente. Los bloques han sido liberados.');
      
      // Recargar reservas
      await this.cargarReservas();
      
      this.cerrarModal();

      setTimeout(() => {
        this.mensajeExito.set('');
      }, 3000);

    } catch (err: any) {
      this.error.set('Error al cancelar la reserva: ' + err.message);
      console.error(err);
    } finally {
      this.cargandoCancelacion.set(false);
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearHora(hora: string): string {
    if (!hora) return '--:--';
    return hora.substring(0, 5);
  }

  obtenerRangoHorario(bloques: EspacioHora[]): string {
    if (!bloques || bloques.length === 0) return 'Reserva finalizada';
    
    const primerBloque = bloques[0];
    const ultimoBloque = bloques[bloques.length - 1];
    
    return `${this.formatearHora(primerBloque.horainicio)} - ${this.formatearHora(ultimoBloque.horafin)}`;
  }

  reservaEstaActiva(reserva: ReservaConDetalles): boolean {
    if (!reserva.bloques || reserva.bloques.length === 0) {
      // Si no hay bloques, la reserva ya fue liberada
      return false;
    }
    
    const ahora = new Date();
    const ultimoBloque = reserva.bloques[reserva.bloques.length - 1];
    
    // Crear fecha combinando la fecha de reserva con la hora de fin del último bloque
    const fechaFin = new Date(reserva.fechareserva);
    const [horas, minutos] = (ultimoBloque.horafin || '23:59:59').split(':');
    fechaFin.setHours(parseInt(horas), parseInt(minutos), 0);
    
    // La reserva está activa si la hora de fin aún no ha pasado
    return fechaFin > ahora;
  }
}

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../../../shared/services/supabase.service';
import { Auth } from '../../../../shared/services/auth.service';

interface Notificacion {
  notificacionid: string;
  usuarioid: string;
  descripcion: string;
  fechanotificacion: string;
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.html'
})
export class NotificacionesComponent implements OnInit {
  private supabase: SupabaseClient;
  private auth = inject(Auth);

  notificaciones = signal<Notificacion[]>([]);
  cargando = signal(true);
  error = signal('');

  constructor() {
    const supabaseService = inject(SupabaseService);
    this.supabase = supabaseService.getClient();
  }

  async ngOnInit() {
    await this.cargarNotificaciones();
    await this.generarNotificacionesAutomaticas();
  }

  async cargarNotificaciones() {
    try {
      this.cargando.set(true);
      const usuario = this.auth.profile();

      if (!usuario?.usuarioid) return;

      const { data, error } = await this.supabase
        .from('notificacion')
        .select('*')
        .eq('usuarioid', usuario.usuarioid);

      if (error) throw error;

      // Ordenar en el cliente si es necesario
      const notificacionesOrdenadas = (data || []).sort((a, b) => {
        const fechaA = new Date(a.fechanotificacion || 0).getTime();
        const fechaB = new Date(b.fechanotificacion || 0).getTime();
        return fechaB - fechaA; // Más recientes primero
      });

      this.notificaciones.set(notificacionesOrdenadas);
    } catch (err: any) {
      this.error.set('Error al cargar notificaciones');
      console.error(err);
    } finally {
      this.cargando.set(false);
    }
  }

  async generarNotificacionesAutomaticas() {
    try {
      const usuario = this.auth.profile();
      if (!usuario?.usuarioid) return;

      // Obtener reservas próximas (próximas 24 horas)
      const { data: reservas } = await this.supabase
        .from('reserva')
        .select(`
          reservaid,
          nombrereserva,
          fechareserva,
          espaciohora (
            horainicio,
            horafin
          )
        `)
        .eq('usuarioid', usuario.usuarioid);

      if (!reservas) return;

      const ahora = new Date();
      const en24Horas = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

      for (const reserva of reservas) {
        const bloques = Array.isArray(reserva.espaciohora) ? reserva.espaciohora : [];
        if (bloques.length === 0) continue;

        const primerBloque = bloques[0];
        const fechaReserva = new Date(reserva.fechareserva);
        const [horas, minutos] = (primerBloque.horainicio || '00:00:00').split(':');
        fechaReserva.setHours(parseInt(horas), parseInt(minutos), 0);

        // Si la reserva es en las próximas 24 horas
        if (fechaReserva > ahora && fechaReserva <= en24Horas) {
          // Verificar si ya existe notificación para esta reserva
          const { data: existente } = await this.supabase
            .from('notificacion')
            .select('notificacionid')
            .eq('usuarioid', usuario.usuarioid)
            .ilike('mensaje', `%${reserva.nombrereserva}%`)
            .single();

          if (!existente) {
            // Crear notificación
            await this.supabase
              .from('notificacion')
              .insert({
                usuarioid: usuario.usuarioid,
                descripcion: `Recordatorio: Tu reserva "${reserva.nombrereserva}" comienza pronto a las ${primerBloque.horainicio.substring(0, 5)}`,
                fechanotificacion: new Date().toISOString()
              });
          }
        }
      }

      await this.cargarNotificaciones();
    } catch (err) {
      console.error('Error generando notificaciones:', err);
    }
  }

  async marcarTodasComoLeidas() {
    try {
      const usuario = this.auth.profile();
      if (!usuario?.usuarioid) return;

      // Eliminar todas las notificaciones del usuario
      const { error } = await this.supabase
        .from('notificacion')
        .delete()
        .eq('usuarioid', usuario.usuarioid);

      if (error) throw error;

      await this.cargarNotificaciones();
    } catch (err) {
      console.error('Error al eliminar todas:', err);
    }
  }

  async eliminarNotificacion(notificacion: Notificacion) {
    try {
      const { error } = await this.supabase
        .from('notificacion')
        .delete()
        .eq('notificacionid', notificacion.notificacionid);

      if (error) throw error;

      await this.cargarNotificaciones();
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const ahora = new Date();
    const diff = ahora.getTime() - date.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas} h`;
    if (dias < 7) return `Hace ${dias} días`;
    
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  }

  obtenerIcono(descripcion?: string): string {
    if (!descripcion) return '📬';
    
    const desc = descripcion.toLowerCase();
    if (desc.includes('reserva')) return '📅';
    if (desc.includes('cancelada')) return '❌';
    if (desc.includes('confirmada')) return '✅';
    if (desc.includes('incidencia')) return '⚠️';
    if (desc.includes('comentario')) return '💬';
    return '📬';
  }

  obtenerColorBorde(descripcion?: string): string {
    if (!descripcion) return 'border-l-blue-500';
    
    const desc = descripcion.toLowerCase();
    if (desc.includes('cancelada')) return 'border-l-red-500';
    if (desc.includes('confirmada')) return 'border-l-green-500';
    if (desc.includes('incidencia')) return 'border-l-yellow-500';
    return 'border-l-blue-500';
  }
}

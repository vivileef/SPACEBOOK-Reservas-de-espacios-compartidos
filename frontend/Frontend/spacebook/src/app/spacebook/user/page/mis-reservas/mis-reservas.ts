import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DatabaseService } from '../../../../shared/services/database.service';
import { Auth } from '../../../../shared/services/auth.service';
import { Reserva, Espacio, Seccion, Institucion } from '../../../../shared/models/database.models';

interface ReservaDetallada extends Reserva {
  espacio?: Espacio;
  seccion?: Seccion;
  institucion?: Institucion;
}

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-reservas.html'
})
export class MisReservasComponent implements OnInit {
  reservasActivas = signal<ReservaDetallada[]>([]);
  reservasPasadas = signal<ReservaDetallada[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  constructor(
    private dbService: DatabaseService,
    private auth: Auth,
    public router: Router
  ) {}

  async ngOnInit() {
    await this.cargarReservas();
  }

  async cargarReservas() {
    try {
      this.cargando.set(true);
      this.error.set(null);

      const usuarioId = this.auth.profile()?.usuarioid;
      if (!usuarioId) {
        this.error.set('No se encontró el usuario');
        return;
      }

      // Obtener todas las reservas del usuario
      const reservas = await this.dbService.getReservas(usuarioId);

      // Separar en activas y pasadas
      const ahora = new Date();
      const activas: ReservaDetallada[] = [];
      const pasadas: ReservaDetallada[] = [];

      for (const reserva of reservas) {
        const fechaReserva = new Date(reserva.fechareserva);
        
        // Cargar detalles del espacio si existe reservaid
        let detalleReserva: ReservaDetallada = { ...reserva };
        
        if (fechaReserva >= ahora) {
          activas.push(detalleReserva);
        } else {
          pasadas.push(detalleReserva);
        }
      }

      this.reservasActivas.set(activas);
      this.reservasPasadas.set(pasadas);
    } catch (err: any) {
      console.error('Error al cargar reservas:', err);
      this.error.set('Error al cargar las reservas. Por favor, intenta de nuevo.');
    } finally {
      this.cargando.set(false);
    }
  }

  async cancelarReserva(reserva: Reserva) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    try {
      await this.dbService.deleteReserva(reserva.reservaid);
      
      // Crear notificación de cancelación
      const usuarioId = this.auth.profile()?.usuarioid;
      if (usuarioId) {
        await this.dbService.createNotificacion({
          fechanotificacion: new Date().toISOString(),
          descripcion: `Tu reserva "${reserva.nombrereserva}" del ${this.formatearFecha(reserva.fechareserva)} ha sido cancelada.`,
          usuarioid: usuarioId
        });
      }

      // Recargar reservas
      await this.cargarReservas();
      alert('Reserva cancelada exitosamente');
    } catch (err: any) {
      console.error('Error al cancelar reserva:', err);
      alert('Error al cancelar la reserva. Por favor, intenta de nuevo.');
    }
  }

  verDetalles(reserva: Reserva) {
    // Navegar a detalles de la reserva
    this.router.navigate(['/spacebook/user/reserva-detalle', reserva.reservaid]);
  }

  dejarComentario(reserva: Reserva) {
    // Navegar a dejar comentario
    this.router.navigate(['/spacebook/user/comentario', reserva.reservaid]);
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

  formatearCosto(costo?: number): string {
    if (!costo) return 'Gratis';
    return `$${costo.toFixed(2)}`;
  }

  obtenerEstadoReserva(reserva: Reserva): string {
    const ahora = new Date();
    const fechaReserva = new Date(reserva.fechareserva);

    if (fechaReserva < ahora) {
      return 'Completada';
    } else {
      return 'Próxima';
    }
  }

  obtenerColorEstado(reserva: Reserva): string {
    const estado = this.obtenerEstadoReserva(reserva);
    switch (estado) {
      case 'Completada': return 'bg-gray-100 text-gray-800';
      case 'Próxima': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  puedeCalificar(reserva: Reserva): boolean {
    const fechaReserva = new Date(reserva.fechareserva);
    return fechaReserva < new Date();
  }

  puedeCancelar(reserva: Reserva): boolean {
    const fechaReserva = new Date(reserva.fechareserva);
    // Solo se puede cancelar si falta más de 1 hora para el inicio
    const unaHoraAntes = new Date(fechaReserva.getTime() - 60 * 60 * 1000);
    return new Date() < unaHoraAntes;
  }
}

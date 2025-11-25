import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../../../../shared/services/database.service';
import { Auth } from '../../../../shared/services/auth.service';
import { Comentario, Reserva } from '../../../../shared/models/database.models';

@Component({
  selector: 'app-comentarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comentarios.html'
})
export class ComentariosComponent implements OnInit {
  reservaId = signal<string | null>(null);
  reserva = signal<Reserva | null>(null);
  calificacion = signal<number>(0);
  descripcion = signal<string>('');
  enviando = signal(false);
  error = signal<string | null>(null);
  exito = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dbService: DatabaseService,
    private auth: Auth
  ) {}

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  formatearCosto(costo?: number): string {
    if (!costo) return 'N/A';
    return costo.toFixed(2);
  }

  async ngOnInit() {
    // Obtener reservaId de la ruta
    const id = this.route.snapshot.paramMap.get('reservaId');
    if (id) {
      this.reservaId.set(id);
      await this.cargarReserva(id);
    }
  }

  async cargarReserva(reservaId: string) {
    try {
      const reserva = await this.dbService.getReserva(reservaId);
      this.reserva.set(reserva);
    } catch (err: any) {
      console.error('Error al cargar reserva:', err);
      this.error.set('No se pudo cargar la reserva');
    }
  }

  seleccionarCalificacion(estrellas: number) {
    this.calificacion.set(estrellas);
  }

  async enviarComentario() {
    if (this.calificacion() === 0) {
      this.error.set('Por favor selecciona una calificación');
      return;
    }

    if (!this.descripcion().trim()) {
      this.error.set('Por favor escribe un comentario');
      return;
    }

    const reservaId = this.reservaId();
    if (!reservaId) {
      this.error.set('No se encontró la reserva');
      return;
    }

    try {
      this.enviando.set(true);
      this.error.set(null);

      await this.dbService.createComentario({
        fecha: new Date().toISOString(),
        descripcion: this.descripcion(),
        reservaid: reservaId,
        calificacion: this.calificacion()
      });

      this.exito.set(true);
      
      // Esperar 2 segundos y redirigir
      setTimeout(() => {
        this.router.navigate(['/spacebook/user/mis-reservas']);
      }, 2000);
    } catch (err: any) {
      console.error('Error al enviar comentario:', err);
      this.error.set('Error al enviar el comentario. Por favor, intenta de nuevo.');
    } finally {
      this.enviando.set(false);
    }
  }

  cancelar() {
    this.router.navigate(['/spacebook/user/mis-reservas']);
  }
}

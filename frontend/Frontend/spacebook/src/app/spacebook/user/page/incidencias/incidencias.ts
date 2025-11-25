import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService } from '../../../../shared/services/database.service';
import { Auth } from '../../../../shared/services/auth.service';
import { Incidencia } from '../../../../shared/models/database.models';

@Component({
  selector: 'app-incidencias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './incidencias.html'
})
export class IncidenciasComponent implements OnInit {
  incidencias = signal<Incidencia[]>([]);
  mostrarFormulario = signal(false);
  tipoIncidencia = signal<string>('');
  descripcionIncidencia = signal<string>('');
  enviando = signal(false);
  cargando = signal(true);
  error = signal<string | null>(null);

  tiposIncidencia = [
    { value: 'Daño al espacio', label: 'Daño al espacio' },
    { value: 'Problema de acceso', label: 'Problema de acceso' },
    { value: 'Limpieza', label: 'Limpieza' },
    { value: 'Seguridad', label: 'Seguridad' },
    { value: 'Equipamiento', label: 'Equipamiento' },
    { value: 'Otro', label: 'Otro' }
  ];

  constructor(
    private dbService: DatabaseService,
    private auth: Auth,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.cargarIncidencias();
  }

  async cargarIncidencias() {
    try {
      this.cargando.set(true);
      this.error.set(null);

      const usuarioId = this.auth.profile()?.usuarioid;
      if (!usuarioId) {
        this.error.set('No se encontró el usuario');
        return;
      }

      const incidencias = await this.dbService.getIncidencias(usuarioId);
      this.incidencias.set(incidencias);
    } catch (err: any) {
      console.error('Error al cargar incidencias:', err);
      this.error.set('Error al cargar las incidencias');
    } finally {
      this.cargando.set(false);
    }
  }

  abrirFormulario() {
    this.mostrarFormulario.set(true);
    this.tipoIncidencia.set('');
    this.descripcionIncidencia.set('');
    this.error.set(null);
  }

  cerrarFormulario() {
    this.mostrarFormulario.set(false);
    this.tipoIncidencia.set('');
    this.descripcionIncidencia.set('');
    this.error.set(null);
  }

  async reportarIncidencia() {
    if (!this.tipoIncidencia()) {
      this.error.set('Por favor selecciona el tipo de incidencia');
      return;
    }

    if (!this.descripcionIncidencia().trim()) {
      this.error.set('Por favor describe la incidencia');
      return;
    }

    const usuarioId = this.auth.profile()?.usuarioid;
    if (!usuarioId) {
      this.error.set('No se encontró el usuario');
      return;
    }

    try {
      this.enviando.set(true);
      this.error.set(null);

      await this.dbService.createIncidencia({
        usuarioid: usuarioId,
        fechaIncidencia: new Date().toISOString(),
        tipo: this.tipoIncidencia(),
        descripcion: this.descripcionIncidencia()
      });

      // Crear notificación
      await this.dbService.createNotificacion({
        fechanotificacion: new Date().toISOString(),
        descripcion: `Tu reporte de incidencia ha sido recibido. Tipo: ${this.tipoIncidencia()}`,
        usuarioid: usuarioId
      });

      alert('Incidencia reportada exitosamente');
      this.cerrarFormulario();
      await this.cargarIncidencias();
    } catch (err: any) {
      console.error('Error al reportar incidencia:', err);
      this.error.set('Error al reportar la incidencia. Por favor, intenta de nuevo.');
    } finally {
      this.enviando.set(false);
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

  obtenerIconoTipo(tipo?: string): string {
    switch (tipo) {
      case 'Daño al espacio': return '🔨';
      case 'Problema de acceso': return '🔑';
      case 'Limpieza': return '🧹';
      case 'Seguridad': return '🔒';
      case 'Equipamiento': return '⚙️';
      default: return '📋';
    }
  }
}

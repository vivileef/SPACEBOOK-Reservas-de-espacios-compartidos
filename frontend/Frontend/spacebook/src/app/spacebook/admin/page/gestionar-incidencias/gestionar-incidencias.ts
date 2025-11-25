import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../../../shared/services/database.service';
import { Auth } from '../../../../shared/services/auth.service';
import { SupabaseService } from '../../../../shared/services/supabase.service';
import type { Incidencia, CreateIncidenciaDTO, UpdateIncidenciaDTO, CreateNotificacionDTO } from '../../../../shared/models/database.models';

interface Usuario {
  usuarioid: string;
  nombre?: string;
  apellido?: string;
  correo?: string;
}

@Component({
  selector: 'app-gestionar-incidencias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-incidencias.html',
  styleUrl: './gestionar-incidencias.css'
})
export class GestionarIncidenciasComponent implements OnInit {
  // Signals para datos
  incidencias = signal<Incidencia[]>([]);
  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  error = signal('');
  
  // Modal states
  mostrarModalCrear = signal(false);
  mostrarModalEditar = signal(false);
  mostrarModalEliminar = signal(false);
  
  // Formulario
  usuarioSeleccionado = signal('');
  tipoIncidencia = signal('');
  descripcionIncidencia = signal('');
  incidenciaEditando = signal<Incidencia | null>(null);
  incidenciaEliminar = signal<Incidencia | null>(null);
  
  // Estados
  procesando = signal(false);
  exitoso = signal(false);
  mensajeExito = signal('');

  private dbService = inject(DatabaseService);
  private auth = inject(Auth);
  private supabaseService = inject(SupabaseService);

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    try {
      this.cargando.set(true);
      this.error.set('');
      
      // Cargar incidencias
      const incidencias = await this.dbService.getIncidencias();
      this.incidencias.set(incidencias);
      
      // Cargar usuarios
      await this.cargarUsuarios();
      
    } catch (err: any) {
      this.error.set('Error al cargar datos: ' + err.message);
      console.error(err);
    } finally {
      this.cargando.set(false);
    }
  }

  async cargarUsuarios() {
    try {
      const supabase = this.supabaseService.getClient();
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('usuarioid, nombre, apellido, correo')
        .order('nombre');
      
      if (error) throw error;
      this.usuarios.set(data || []);
    } catch (err: any) {
      console.error('Error al cargar usuarios:', err);
      this.error.set('Error al cargar usuarios: ' + err.message);
    }
  }

  obtenerNombreUsuario(usuarioid: string): string {
    const usuario = this.usuarios().find(u => u.usuarioid === usuarioid);
    if (usuario) {
      return `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || usuario.correo || 'Usuario desconocido';
    }
    return 'Usuario desconocido';
  }

  abrirModalCrear() {
    this.limpiarFormulario();
    this.mostrarModalCrear.set(true);
  }

  abrirModalEditar(incidencia: Incidencia) {
    this.incidenciaEditando.set(incidencia);
    this.usuarioSeleccionado.set(incidencia.usuarioid);
    this.tipoIncidencia.set(incidencia.tipo || '');
    this.descripcionIncidencia.set(incidencia.descripcion || '');
    this.mostrarModalEditar.set(true);
  }

  abrirModalEliminar(incidencia: Incidencia) {
    this.incidenciaEliminar.set(incidencia);
    this.mostrarModalEliminar.set(true);
  }

  cerrarModales() {
    this.mostrarModalCrear.set(false);
    this.mostrarModalEditar.set(false);
    this.mostrarModalEliminar.set(false);
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.usuarioSeleccionado.set('');
    this.tipoIncidencia.set('');
    this.descripcionIncidencia.set('');
    this.incidenciaEditando.set(null);
    this.incidenciaEliminar.set(null);
    this.exitoso.set(false);
    this.mensajeExito.set('');
  }

  async crearIncidencia() {
    const usuarioid = this.usuarioSeleccionado();
    const tipo = this.tipoIncidencia();
    const descripcion = this.descripcionIncidencia();

    if (!usuarioid || !tipo || !descripcion) {
      this.error.set('Por favor completa todos los campos');
      return;
    }

    try {
      this.procesando.set(true);
      this.error.set('');

      const nuevaIncidencia: CreateIncidenciaDTO = {
        usuarioid,
        tipo,
        descripcion,
        fechaIncidencia: new Date().toISOString()
      };

      await this.dbService.createIncidencia(nuevaIncidencia);

      // Crear notificación para el usuario
      const notificacion: CreateNotificacionDTO = {
        usuarioid,
        descripcion: `Se ha registrado una incidencia: ${tipo}`,
        fechanotificacion: new Date().toISOString()
      };

      await this.dbService.createNotificacion(notificacion);

      this.exitoso.set(true);
      this.mensajeExito.set('Incidencia creada exitosamente');

      setTimeout(async () => {
        this.cerrarModales();
        await this.cargarDatos();
      }, 1500);

    } catch (err: any) {
      this.error.set('Error al crear incidencia: ' + err.message);
      console.error(err);
    } finally {
      this.procesando.set(false);
    }
  }

  async editarIncidencia() {
    const incidencia = this.incidenciaEditando();
    if (!incidencia) return;

    const tipo = this.tipoIncidencia();
    const descripcion = this.descripcionIncidencia();

    if (!tipo || !descripcion) {
      this.error.set('Por favor completa todos los campos');
      return;
    }

    try {
      this.procesando.set(true);
      this.error.set('');

      const actualizacion: UpdateIncidenciaDTO = {
        incidenciaid: incidencia.incidenciaid,
        tipo,
        descripcion
      };

      await this.dbService.updateIncidencia(actualizacion);

      this.exitoso.set(true);
      this.mensajeExito.set('Incidencia actualizada exitosamente');

      setTimeout(async () => {
        this.cerrarModales();
        await this.cargarDatos();
      }, 1500);

    } catch (err: any) {
      this.error.set('Error al actualizar incidencia: ' + err.message);
      console.error(err);
    } finally {
      this.procesando.set(false);
    }
  }

  async confirmarEliminar() {
    const incidencia = this.incidenciaEliminar();
    if (!incidencia) return;

    try {
      this.procesando.set(true);
      this.error.set('');

      // Primero eliminar las notificaciones relacionadas
      const supabase = this.supabaseService.getClient();
      const { error: notifError } = await supabase
        .from('notificacion')
        .delete()
        .eq('usuarioid', incidencia.usuarioid)
        .ilike('descripcion', `%${incidencia.tipo}%`);

      if (notifError) {
        console.warn('Error al eliminar notificaciones relacionadas:', notifError);
      }

      // Luego eliminar la incidencia
      await this.dbService.deleteIncidencia(incidencia.incidenciaid);

      this.exitoso.set(true);
      this.mensajeExito.set('Incidencia y notificaciones eliminadas exitosamente');

      setTimeout(async () => {
        this.cerrarModales();
        await this.cargarDatos();
      }, 1500);

    } catch (err: any) {
      this.error.set('Error al eliminar incidencia: ' + err.message);
      console.error(err);
    } finally {
      this.procesando.set(false);
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
}

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../../../environments/environment';

interface Institucion {
  institucionid: string;
  nombre: string;
  dominio: string;
  tipo: string;
  direccion: string;
  servicio: string;
}

interface Seccion {
  seccionid: string;
  nombre: string;
  tipo: string;
  capacidad: number;
  calificacion: number;
  institucionid: string;
}

interface Espacio {
  espacioid: string;
  nombre: string;
  estado: boolean;
  seccionid: string;
}

@Component({
  selector: 'app-administrar-espacios',
  imports: [CommonModule, FormsModule],
  templateUrl: './administrar-espacios.html',
  styleUrl: './administrar-espacios.css',
  standalone: true
})
export class AdministrarEspacios implements OnInit {
  private supabase: SupabaseClient;
  
  instituciones = signal<Institucion[]>([]);
  secciones = signal<Seccion[]>([]);
  espacios = signal<Espacio[]>([]);
  
  vistaActual = signal<'instituciones' | 'secciones' | 'espacios'>('instituciones');
  institucionSeleccionada = signal<Institucion | null>(null);
  seccionSeleccionada = signal<Seccion | null>(null);
  
  cargando = signal<boolean>(false);
  error = signal<string>('');
  mostrarModalCrear = signal<boolean>(false);
  nombreNuevoEspacio = signal<string>('');
  creandoEspacio = signal<boolean>(false);
  mensajeExito = signal<string>('');

  constructor() {
    this.supabase = createClient(environment.apiUrl, environment.apiKey);
  }

  ngOnInit() {
    this.cargarInstituciones();
  }

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
    } catch (error: any) {
      this.error.set('Error al cargar las instituciones');
      console.error('Error:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  async cargarSecciones(institucion: Institucion) {
    try {
      this.cargando.set(true);
      this.error.set('');
      this.institucionSeleccionada.set(institucion);
      
      const { data, error } = await this.supabase
        .from('seccion')
        .select('*')
        .eq('institucionid', institucion.institucionid)
        .order('nombre', { ascending: true });

      if (error) throw error;
      
      this.secciones.set(data || []);
      this.vistaActual.set('secciones');
    } catch (error: any) {
      this.error.set('Error al cargar las secciones');
      console.error('Error:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  async cargarEspacios(seccion: Seccion) {
    try {
      this.cargando.set(true);
      this.error.set('');
      this.seccionSeleccionada.set(seccion);
      
      const { data, error } = await this.supabase
        .from('espacio')
        .select('*')
        .eq('seccionid', seccion.seccionid)
        .order('nombre', { ascending: true });

      if (error) throw error;
      
      this.espacios.set(data || []);
      this.vistaActual.set('espacios');
    } catch (error: any) {
      this.error.set('Error al cargar los espacios');
      console.error('Error:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  volverAInstituciones() {
    this.vistaActual.set('instituciones');
    this.institucionSeleccionada.set(null);
    this.seccionSeleccionada.set(null);
    this.secciones.set([]);
    this.espacios.set([]);
  }

  volverASecciones() {
    this.vistaActual.set('secciones');
    this.seccionSeleccionada.set(null);
    this.espacios.set([]);
  }

  obtenerEstadoTexto(estado: boolean): string {
    return estado ? 'Desocupado' : 'Ocupado';
  }

  obtenerEstadoClase(estado: boolean): string {
    return estado ? 'estado-desocupado' : 'estado-ocupado';
  }

  abrirModalCrear() {
    this.mostrarModalCrear.set(true);
    this.nombreNuevoEspacio.set('');
    this.error.set('');
    this.mensajeExito.set('');
  }

  cerrarModalCrear() {
    this.mostrarModalCrear.set(false);
    this.nombreNuevoEspacio.set('');
    this.error.set('');
  }

  async crearEspacio() {
    const nombre = this.nombreNuevoEspacio().trim();
    
    if (!nombre) {
      this.error.set('El nombre del espacio es requerido');
      return;
    }

    const seccionActual = this.seccionSeleccionada();
    if (!seccionActual) {
      this.error.set('No hay una sección seleccionada');
      return;
    }

    try {
      this.creandoEspacio.set(true);
      this.error.set('');

      const { data, error } = await this.supabase
        .from('espacio')
        .insert([
          {
            nombre: nombre,
            seccionid: seccionActual.seccionid,
            estado: true // Por defecto desocupado
          }
        ])
        .select();

      if (error) throw error;

      this.mensajeExito.set('Espacio creado exitosamente');
      
      // Recargar la lista de espacios
      await this.cargarEspacios(seccionActual);
      
      // Cerrar el modal después de un breve momento
      setTimeout(() => {
        this.cerrarModalCrear();
        this.mensajeExito.set('');
      }, 1500);

    } catch (error: any) {
      this.error.set('Error al crear el espacio');
      console.error('Error:', error);
    } finally {
      this.creandoEspacio.set(false);
    }
  }

  async eliminarEspacio(espacio: Espacio) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el espacio "${espacio.nombre}"?`)) {
      return;
    }

    try {
      this.cargando.set(true);
      this.error.set('');

      const { error } = await this.supabase
        .from('espacio')
        .delete()
        .eq('espacioid', espacio.espacioid);

      if (error) throw error;

      this.mensajeExito.set('Espacio eliminado exitosamente');
      
      // Recargar la lista de espacios
      const seccionActual = this.seccionSeleccionada();
      if (seccionActual) {
        await this.cargarEspacios(seccionActual);
      }

      // Limpiar mensaje después de un momento
      setTimeout(() => {
        this.mensajeExito.set('');
      }, 3000);

    } catch (error: any) {
      this.error.set('Error al eliminar el espacio');
      console.error('Error:', error);
    } finally {
      this.cargando.set(false);
    }
  }
}

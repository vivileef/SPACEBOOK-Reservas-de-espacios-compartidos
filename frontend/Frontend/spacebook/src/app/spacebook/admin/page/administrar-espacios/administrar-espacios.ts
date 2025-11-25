import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseClient } from '@supabase/supabase-js';
import { StorageService } from '../../../../shared/services/storage.service';
import { SupabaseService } from '../../../../shared/services/supabase.service';
import { ActivityLogService } from '../../../../shared/services/activity-log.service';

interface Institucion {
  institucionid: string;
  nombre: string;
  tipo: string;
  direccion: string;
  servicio: string;
  horarioid?: string;
  imagen_url?: string[]; // Array de URLs
}

interface Seccion {
  seccionid: string;
  nombre: string;
  tipo: string;
  capacidad: number;
  calificacion: number;
  institucionid: string;
  amenidades: string;
  seccion_url?: string[]; // Array de URLs
}

interface Espacio {
  espacioid: string;
  nombre: string;
  estado: boolean;
  seccionid: string;
  horalimite?: number; // en minutos
}

interface EspacioHora {
  espaciohoraid?: string;
  nombre: string;
  horainicio: string; // time format HH:MM:SS
  horafin: string; // time format HH:MM:SS
  espacioid: string;
  reservaid?: string | null; // Puede ser string, null o undefined
  estado?: boolean; // true = disponible, false = ocupado
}

interface Horario {
  horarioid: string;
  horainicio: string; // time format
  horafin: string; // time format
  semana: string; // comma-separated days
}

type ModoEdicion = 'crear' | 'editar';
type VistaSecundaria = 'instituciones' | 'secciones' | 'espacios';

@Component({
  selector: 'app-administrar-espacios',
  imports: [CommonModule, FormsModule],
  templateUrl: './administrar-espacios.html',
  styleUrl: './administrar-espacios.css',
  standalone: true
})
export class AdministrarEspacios implements OnInit {
  private supabase: SupabaseClient;
  private activityLog = inject(ActivityLogService);
  
  // Pestaña principal
  pestanaActiva = signal<'instituciones' | 'espacios-secciones'>('instituciones');
  
  // Gestión de Instituciones
  instituciones = signal<Institucion[]>([]);
  institucionSeleccionada = signal<Institucion | null>(null);
  mostrarModalInstitucion = signal<boolean>(false);
  modoInstitucion = signal<ModoEdicion>('crear');
  institucionForm = signal<Partial<Institucion>>({
    nombre: '',
    tipo: '',
    direccion: '',
    servicio: '',
    horarioid: undefined
  });
  
  // Gestión de Horarios
  horarios = signal<Horario[]>([]);
  horarioSeleccionado = signal<string | undefined>(undefined);
  
  // Gestión de Espacios y Secciones
  vistaSecundaria = signal<VistaSecundaria>('instituciones');
  secciones = signal<Seccion[]>([]);
  seccionSeleccionada = signal<Seccion | null>(null);
  espacios = signal<Espacio[]>([]);
  
  // Modales y Forms
  mostrarModalSeccion = signal<boolean>(false);
  modoSeccion = signal<ModoEdicion>('crear');
  seccionForm = signal<Partial<Seccion>>({
    nombre: '',
    tipo: '',
    capacidad: 0,
    calificacion: 0,
    amenidades: ''
  });
  
  // Amenidades dinámicas
  amenidadesLista = signal<string[]>(['']); // Inicia con 1 campo vacío
  
  mostrarModalEspacio = signal<boolean>(false);
  modoEspacio = signal<ModoEdicion>('crear');
  espacioForm = signal<Partial<Espacio>>({
    nombre: '',
    estado: true,
    horalimite: 60 // default: 60 minutos (1 hora)
  });

  // Modal para ver espaciohora
  mostrarModalEspacioHora = signal<boolean>(false);
  espaciosHora = signal<EspacioHora[]>([]);
  espacioSeleccionadoHora = signal<Espacio | null>(null);
  cargandoEspacioHora = signal<boolean>(false);

  // Modal para editar espaciohora individual
  mostrarModalEditarEspacioHora = signal<boolean>(false);
  espacioHoraForm = signal<Partial<EspacioHora>>({
    nombre: '',
    estado: true
  });
  espacioHoraEnEdicion = signal<EspacioHora | null>(null);

  // Modal para renombrar globalmente
  mostrarModalRenombrarGlobal = signal<boolean>(false);
  prefijoNombreGlobal = signal<string>('Bloque');
  
  // Estados generales
  cargando = signal<boolean>(false);
  error = signal<string>('');
  mensajeExito = signal<string>('');

  // Manejo de imágenes instituciones (múltiples)
  archivosSeleccionados: File[] = [];
  previsualizacionImagenes: string[] = [];
  subiendoImagen = signal<boolean>(false);

  // Manejo de imágenes secciones (múltiples)
  archivosSeleccionadosSeccion: File[] = [];
  previsualizacionImagenesSeccion: string[] = [];

  private supabaseService = inject(SupabaseService);

  constructor(private storageService: StorageService) {
    this.supabase = this.supabaseService.getClient();
  }

  ngOnInit() {
    this.cargarInstituciones();
    this.cargarHorarios();
  }

  // ==================== CARGAR HORARIOS ====================
  async cargarHorarios() {
    try {
      const { data, error } = await this.supabase
        .from('horario')
        .select('*')
        .order('horainicio', { ascending: true });

      if (error) throw error;

      this.horarios.set(data || []);
    } catch (error: any) {
      console.error('Error al cargar horarios:', error);
    }
  }

  obtenerTextoHorario(horario: Horario): string {
    const dias = horario.semana || 'Sin días especificados';
    const inicio = horario.horainicio?.substring(0, 5) || '--:--';
    const fin = horario.horafin?.substring(0, 5) || '--:--';
    return `⏰ ${inicio} - ${fin} | 📅 ${dias}`;
  }

  // ==================== PESTAÑA PRINCIPAL ====================
  cambiarPestana(pestana: 'instituciones' | 'espacios-secciones') {
    this.pestanaActiva.set(pestana);
    this.limpiarMensajes();
  }

  // ==================== GESTIÓN DE INSTITUCIONES ====================
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

  abrirModalInstitucion(modo: ModoEdicion, institucion?: Institucion) {
    this.modoInstitucion.set(modo);
    if (modo === 'editar' && institucion) {
      this.institucionForm.set({ ...institucion });
      this.horarioSeleccionado.set(institucion.horarioid);
      this.institucionSeleccionada.set(institucion);
    } else {
      this.institucionForm.set({
        nombre: '',
        tipo: '',
        direccion: '',
        servicio: '',
        horarioid: undefined
      });
      this.horarioSeleccionado.set(undefined);
      this.institucionSeleccionada.set(null);
    }
    this.mostrarModalInstitucion.set(true);
    this.limpiarMensajes();
  }

  cerrarModalInstitucion() {
    this.mostrarModalInstitucion.set(false);
    this.institucionForm.set({
      nombre: '',
      tipo: '',
      direccion: '',
      servicio: '',
      horarioid: undefined
    });
    this.horarioSeleccionado.set(undefined);
    this.institucionSeleccionada.set(null);
  }

  async guardarInstitucion() {
    const form = this.institucionForm();
    
    if (!form.nombre?.trim()) {
      this.error.set('El nombre de la institución es requerido');
      return;
    }

    try {
      this.cargando.set(true);
      this.subiendoImagen.set(true);
      this.error.set('');

      const horarioId = this.horarioSeleccionado() || null;
      let imagenesUrls: string[] = [];

      // Subir imágenes si hay archivos seleccionados
      if (this.archivosSeleccionados.length > 0) {
        try {
          imagenesUrls = await this.storageService.uploadMultipleFiles(this.archivosSeleccionados, 'institucion');
          console.log(`${imagenesUrls.length} imagen(es) subida(s) exitosamente`);
        } catch (uploadError) {
          console.error('Error al subir imágenes:', uploadError);
          this.error.set('Error al subir las imágenes');
          this.cargando.set(false);
          this.subiendoImagen.set(false);
          return;
        }
      }

      if (this.modoInstitucion() === 'crear') {
        const { error } = await this.supabase
          .from('institucion')
          .insert([{
            nombre: form.nombre,
            tipo: form.tipo || null,
            direccion: form.direccion || null,
            servicio: form.servicio || null,
            horarioid: horarioId,
            imagen_url: imagenesUrls.length > 0 ? imagenesUrls : []
          }]);

        if (error) throw error;
        this.mensajeExito.set(`Institución creada exitosamente${imagenesUrls.length > 0 ? ` con ${imagenesUrls.length} imagen(es)` : ''}`);
      } else {
        const institucion = this.institucionSeleccionada();
        if (!institucion) return;

        // Si hay nuevas imágenes y existían anteriores, eliminar las anteriores
        if (imagenesUrls.length > 0 && institucion.imagen_url && institucion.imagen_url.length > 0) {
          try {
            await this.storageService.deleteMultipleFiles(institucion.imagen_url);
          } catch (deleteError) {
            console.error('Error al eliminar imágenes anteriores:', deleteError);
          }
        }

        // Usar las nuevas imágenes si existen, sino mantener las anteriores
        const finalImageUrls = imagenesUrls.length > 0 ? imagenesUrls : (institucion.imagen_url || []);

        const { error } = await this.supabase
          .from('institucion')
          .update({
            nombre: form.nombre,
            tipo: form.tipo || null,
            direccion: form.direccion || null,
            servicio: form.servicio || null,
            horarioid: horarioId,
            imagen_url: finalImageUrls
          })
          .eq('institucionid', institucion.institucionid);

        if (error) throw error;
        this.mensajeExito.set(`Institución actualizada exitosamente${imagenesUrls.length > 0 ? ` con ${imagenesUrls.length} nueva(s) imagen(es)` : ''}`);
      }

      await this.cargarInstituciones();
      
      setTimeout(() => {
        this.cerrarModalInstitucion();
        this.mensajeExito.set('');
        this.limpiarImagenes();
      }, 1500);

    } catch (error: any) {
      this.error.set('Error al guardar la institución');
      console.error('Error:', error);
    } finally {
      this.cargando.set(false);
      this.subiendoImagen.set(false);
    }
  }

  async eliminarInstitucion(institucion: Institucion) {
    if (!confirm(`¿Estás seguro de que deseas eliminar la institución "${institucion.nombre}"? Esto también eliminará todas sus secciones y espacios asociados.`)) {
      return;
    }

    try {
      this.cargando.set(true);
      this.error.set('');

      // Eliminar imágenes del storage si existen
      if (institucion.imagen_url && institucion.imagen_url.length > 0) {
        try {
          await this.storageService.deleteMultipleFiles(institucion.imagen_url);
          console.log(`${institucion.imagen_url.length} imagen(es) eliminada(s) del storage`);
        } catch (storageError) {
          console.error('Error al eliminar imágenes del storage:', storageError);
          // Continuar con la eliminación de la institución aunque fallen las imágenes
        }
      }

      const { error } = await this.supabase
        .from('institucion')
        .delete()
        .eq('institucionid', institucion.institucionid);

      if (error) throw error;

      this.mensajeExito.set('Institución eliminada exitosamente');
      await this.cargarInstituciones();

      setTimeout(() => {
        this.mensajeExito.set('');
      }, 3000);

    } catch (error: any) {
      this.error.set('Error al eliminar la institución');
      console.error('Error:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  // ==================== GESTIÓN DE SECCIONES ====================
  async seleccionarInstitucionParaSecciones(institucion: Institucion) {
    this.institucionSeleccionada.set(institucion);
    this.vistaSecundaria.set('secciones');
    await this.cargarSecciones(institucion);
  }

  async cargarSecciones(institucion: Institucion) {
    try {
      this.cargando.set(true);
      this.error.set('');
      
      const { data, error } = await this.supabase
        .from('seccion')
        .select('*')
        .eq('institucionid', institucion.institucionid)
        .order('nombre', { ascending: true });

      if (error) throw error;
      
      this.secciones.set(data || []);
    } catch (error: any) {
      this.error.set('Error al cargar las secciones');
      console.error('Error:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  abrirModalSeccion(modo: ModoEdicion, seccion?: Seccion) {
    this.modoSeccion.set(modo);
    if (modo === 'editar' && seccion) {
      this.seccionForm.set({ ...seccion });
      this.seccionSeleccionada.set(seccion);
      // Cargar amenidades desde el string separado por comas
      if (seccion.amenidades) {
        const amenidadesArray = seccion.amenidades.split(',').map(a => a.trim()).filter(a => a !== '');
        // Si no hay amenidades, iniciar con 1 campo vacío
        if (amenidadesArray.length === 0) {
          amenidadesArray.push('');
        }
        this.amenidadesLista.set(amenidadesArray);
      } else {
        this.amenidadesLista.set(['']);
      }
    } else {
      this.seccionForm.set({
        nombre: '',
        tipo: '',
        capacidad: 0,
        calificacion: 0,
        amenidades: ''
      });
      this.amenidadesLista.set(['']);
      this.seccionSeleccionada.set(null);
    }
    this.mostrarModalSeccion.set(true);
    this.limpiarMensajes();
  }

  cerrarModalSeccion() {
    this.mostrarModalSeccion.set(false);
    this.seccionForm.set({
      nombre: '',
      tipo: '',
      capacidad: 0,
      calificacion: 0,
      amenidades: ''
    });
    this.amenidadesLista.set(['']);
    this.seccionSeleccionada.set(null);
    this.limpiarImagenesSeccion();
  }

  async guardarSeccion() {
    const form = this.seccionForm();
    const institucion = this.institucionSeleccionada();
    
    if (!form.nombre?.trim()) {
      this.error.set('El nombre de la sección es requerido');
      return;
    }

    if (!institucion) {
      this.error.set('No hay una institución seleccionada');
      return;
    }

    // Convertir amenidades array a string separado por comas
    const amenidadesString = this.amenidadesLista()
      .filter(a => a.trim() !== '')
      .join(',');

    try {
      this.cargando.set(true);
      this.error.set('');
      
      // Manejar subida de imágenes
      let imagenesUrls: string[] = [];
      if (this.archivosSeleccionadosSeccion.length > 0) {
        this.subiendoImagen.set(true);
        try {
          imagenesUrls = await this.storageService.uploadMultipleFiles(this.archivosSeleccionadosSeccion, 'seccion');
          console.log('Imágenes subidas:', imagenesUrls);
        } catch (uploadError) {
          console.error('Error al subir imágenes:', uploadError);
          this.error.set('Error al subir las imágenes');
          return;
        } finally {
          this.subiendoImagen.set(false);
        }
      }

      if (this.modoSeccion() === 'crear') {
        // Crear la sección
        const { data: nuevaSeccion, error: errorSeccion } = await this.supabase
          .from('seccion')
          .insert([{
            nombre: form.nombre,
            tipo: form.tipo || null,
            capacidad: form.capacidad || 0,
            calificacion: form.calificacion || 0,
            amenidades: amenidadesString || null,
            institucionid: institucion.institucionid,
            seccion_url: imagenesUrls.length > 0 ? imagenesUrls : []
          }])
          .select()
          .single();

        if (errorSeccion) throw errorSeccion;

        // Crear espacios automáticamente según la capacidad
        const capacidad = form.capacidad || 0;
        if (capacidad > 0 && nuevaSeccion) {
          const espacios = [];
          for (let i = 1; i <= capacidad; i++) {
            espacios.push({
              nombre: `${form.nombre}-${i.toString().padStart(2, '0')}`,
              estado: true,
              seccionid: nuevaSeccion.seccionid
            });
          }

          const { error: errorEspacios } = await this.supabase
            .from('espacio')
            .insert(espacios);

          if (errorEspacios) {
            console.error('Error al crear espacios:', errorEspacios);
            this.mensajeExito.set(`Sección creada exitosamente, pero hubo un error al crear ${capacidad} espacios`);
          } else {
            this.mensajeExito.set(`Sección creada exitosamente con ${capacidad} espacios`);
          }
        } else {
          this.mensajeExito.set('Sección creada exitosamente');
        }
      } else {
        const seccion = this.seccionSeleccionada();
        if (!seccion) return;

        const capacidadAnterior = seccion.capacidad;
        const capacidadNueva = form.capacidad || 0;
        
        // Determinar URLs finales
        let urlsFinales: string[] = [];
        if (imagenesUrls.length > 0) {
          // Si hay nuevas imágenes, eliminar las antiguas y usar las nuevas
          if (seccion.seccion_url && seccion.seccion_url.length > 0) {
            try {
              await this.storageService.deleteMultipleFiles(seccion.seccion_url);
            } catch (deleteError) {
              console.error('Error al eliminar imágenes antiguas:', deleteError);
            }
          }
          urlsFinales = imagenesUrls;
        } else {
          // Si no hay nuevas imágenes, mantener las existentes
          urlsFinales = seccion.seccion_url || [];
        }

        // Actualizar la sección
        const { error } = await this.supabase
          .from('seccion')
          .update({
            nombre: form.nombre,
            tipo: form.tipo || null,
            capacidad: capacidadNueva,
            calificacion: form.calificacion || 0,
            amenidades: amenidadesString || null,
            seccion_url: urlsFinales
          })
          .eq('seccionid', seccion.seccionid);

        if (error) throw error;

        // Si aumentó la capacidad, crear los espacios faltantes
        if (capacidadNueva > capacidadAnterior) {
          const espaciosFaltantes = [];
          for (let i = capacidadAnterior + 1; i <= capacidadNueva; i++) {
            espaciosFaltantes.push({
              nombre: `${form.nombre}-${i.toString().padStart(2, '0')}`,
              estado: true,
              seccionid: seccion.seccionid
            });
          }

          const { error: errorEspacios } = await this.supabase
            .from('espacio')
            .insert(espaciosFaltantes);

          if (errorEspacios) {
            console.error('Error al crear espacios adicionales:', errorEspacios);
            this.mensajeExito.set('Sección actualizada, pero hubo un error al crear espacios adicionales');
          } else {
            this.mensajeExito.set(`Sección actualizada y se agregaron ${capacidadNueva - capacidadAnterior} espacios nuevos`);
          }
        } else {
          this.mensajeExito.set('Sección actualizada exitosamente');
        }
      }

      await this.cargarSecciones(institucion);
      
      setTimeout(() => {
        this.cerrarModalSeccion();
        this.mensajeExito.set('');
      }, 1500);

    } catch (error: any) {
      this.error.set('Error al guardar la sección');
      console.error('Error:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  async eliminarSeccion(seccion: Seccion) {
    if (!confirm(`¿Estás seguro de que deseas eliminar la sección "${seccion.nombre}"? Esto también eliminará todos sus espacios asociados.`)) {
      return;
    }

    try {
      this.cargando.set(true);
      this.error.set('');

      // Eliminar imágenes del storage si existen
      if (seccion.seccion_url && seccion.seccion_url.length > 0) {
        try {
          await this.storageService.deleteMultipleFiles(seccion.seccion_url);
          console.log('Imágenes de sección eliminadas del storage');
        } catch (storageError) {
          console.error('Error al eliminar imágenes del storage:', storageError);
          // Continuar con la eliminación de la sección aunque falle el borrado de imágenes
        }
      }

      const { error } = await this.supabase
        .from('seccion')
        .delete()
        .eq('seccionid', seccion.seccionid);

      if (error) throw error;

      this.mensajeExito.set('Sección eliminada exitosamente');
      
      const institucion = this.institucionSeleccionada();
      if (institucion) {
        await this.cargarSecciones(institucion);
      }

      setTimeout(() => {
        this.mensajeExito.set('');
      }, 3000);

    } catch (error: any) {
      this.error.set('Error al eliminar la sección');
      console.error('Error:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  // ==================== GESTIÓN DE ESPACIOS ====================
  async seleccionarSeccionParaEspacios(seccion: Seccion) {
    this.seccionSeleccionada.set(seccion);
    this.vistaSecundaria.set('espacios');
    await this.cargarEspacios(seccion);
  }

  async cargarEspacios(seccion: Seccion) {
    try {
      this.cargando.set(true);
      this.error.set('');
      
      const { data, error } = await this.supabase
        .from('espacio')
        .select('*')
        .eq('seccionid', seccion.seccionid)
        .order('nombre', { ascending: true });

      if (error) throw error;
      
      this.espacios.set(data || []);
    } catch (error: any) {
      this.error.set('Error al cargar los espacios');
      console.error('Error:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  abrirModalEspacio(modo: ModoEdicion, espacio?: Espacio) {
    this.modoEspacio.set(modo);
    if (modo === 'editar' && espacio) {
      this.espacioForm.set({ ...espacio });
    } else {
      this.espacioForm.set({
        nombre: '',
        estado: true,
        horalimite: 60
      });
    }
    this.mostrarModalEspacio.set(true);
    this.limpiarMensajes();
  }

  cerrarModalEspacio() {
    this.mostrarModalEspacio.set(false);
    this.espacioForm.set({
      nombre: '',
      estado: true,
      horalimite: 60
    });
  }

  async guardarEspacio() {
    const form = this.espacioForm();
    const seccion = this.seccionSeleccionada();
    
    if (!form.nombre?.trim()) {
      this.error.set('El nombre del espacio es requerido');
      return;
    }

    if (!seccion) {
      this.error.set('No hay una sección seleccionada');
      return;
    }

    if (!form.horalimite || form.horalimite <= 0) {
      this.error.set('La hora límite debe ser mayor a 0 minutos');
      return;
    }

    try {
      this.cargando.set(true);
      this.error.set('');

      if (this.modoEspacio() === 'crear') {
        console.log('=== CREANDO ESPACIO ==="');
        console.log('Datos del formulario:', form);
        console.log('Sección seleccionada:', seccion);

        // Insertar el espacio
        const { data: espacioData, error: espacioError } = await this.supabase
          .from('espacio')
          .insert([{
            nombre: form.nombre,
            estado: form.estado ?? true,
            seccionid: seccion.seccionid,
            horalimite: form.horalimite
          }])
          .select()
          .single();

        if (espacioError) {
          console.error('Error al insertar espacio:', espacioError);
          throw espacioError;
        }

        console.log('Espacio creado:', espacioData);

        // Obtener el horario de la institución para generar espaciohora
        const horarioInstitucion = await this.obtenerHorarioInstitucion(seccion.institucionid);
        
        console.log('Horario de institución:', horarioInstitucion);

        if (horarioInstitucion && espacioData) {
          const espaciosHora = this.generarEspaciosHora(
            espacioData.espacioid,
            horarioInstitucion.horainicio,
            horarioInstitucion.horafin,
            form.horalimite!
          );

          console.log(`Generados ${espaciosHora.length} bloques horarios:`, espaciosHora);

          // Insertar todos los espaciohora
          const { data: espacioHoraData, error: espacioHoraError } = await this.supabase
            .from('espaciohora')
            .insert(espaciosHora)
            .select();

          if (espacioHoraError) {
            console.error('Error al crear espaciohora:', espacioHoraError);
            this.error.set('Espacio creado pero error al generar bloques horarios');
          } else {
            console.log('EspacioHora insertados exitosamente:', espacioHoraData);
            this.mensajeExito.set(`Espacio creado exitosamente con ${espaciosHora.length} bloques horarios`);
            this.activityLog.registrar('espacio_creado', 'Espacio creado', `"${form.nombre}" con ${espaciosHora.length} bloques horarios`);
          }
        } else {
          console.warn('No se pudo obtener horario de institución o no hay espacio data');
          this.mensajeExito.set('Espacio creado exitosamente (sin horario de institución)');
          this.activityLog.registrar('espacio_creado', 'Espacio creado', `"${form.nombre}"`);
        }
      } else {
        if (!form.espacioid) return;

        const { error } = await this.supabase
          .from('espacio')
          .update({
            nombre: form.nombre,
            estado: form.estado ?? true,
            horalimite: form.horalimite
          })
          .eq('espacioid', form.espacioid);

        if (error) throw error;
        
        // Al editar, regenerar espaciohora si cambió horalimite
        const horarioInstitucion = await this.obtenerHorarioInstitucion(seccion.institucionid);
        
        if (horarioInstitucion) {
          // Eliminar espaciohora existentes sin reserva
          await this.supabase
            .from('espaciohora')
            .delete()
            .eq('espacioid', form.espacioid)
            .is('reservaid', null);

          // Generar nuevos espaciohora
          const espaciosHora = this.generarEspaciosHora(
            form.espacioid,
            horarioInstitucion.horainicio,
            horarioInstitucion.horafin,
            form.horalimite!
          );

          await this.supabase
            .from('espaciohora')
            .insert(espaciosHora);
        }

        this.mensajeExito.set('Espacio actualizado exitosamente');
        this.activityLog.registrar('espacio_editado', 'Espacio editado', `"${form.nombre}" actualizado`);
      }

      await this.cargarEspacios(seccion);
      
      setTimeout(() => {
        this.cerrarModalEspacio();
        this.mensajeExito.set('');
      }, 1500);

    } catch (error: any) {
      this.error.set('Error al guardar el espacio');
      console.error('Error:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  // Método auxiliar para obtener el horario de la institución
  async obtenerHorarioInstitucion(institucionId: string): Promise<Horario | null> {
    try {
      // Primero obtener la institución para conseguir su horarioid
      const { data: institucionData, error: institucionError } = await this.supabase
        .from('institucion')
        .select('horarioid')
        .eq('institucionid', institucionId)
        .single();

      if (institucionError || !institucionData?.horarioid) {
        console.warn('Institución sin horario configurado');
        return null;
      }

      // Obtener el horario
      const { data: horarioData, error: horarioError } = await this.supabase
        .from('horario')
        .select('*')
        .eq('horarioid', institucionData.horarioid)
        .single();

      if (horarioError) throw horarioError;

      return horarioData;
    } catch (error) {
      console.error('Error al obtener horario de institución:', error);
      return null;
    }
  }

  // Método para generar los bloques de espaciohora
  generarEspaciosHora(
    espacioId: string,
    horaInicio: string, // formato HH:MM:SS
    horaFin: string,    // formato HH:MM:SS
    horaLimiteMinutos: number
  ): Partial<EspacioHora>[] {
    console.log('=== GENERANDO ESPACIOHORA ===');
    console.log('Espacio ID:', espacioId);
    console.log('Hora Inicio:', horaInicio);
    console.log('Hora Fin:', horaFin);
    console.log('Hora Límite (min):', horaLimiteMinutos);

    const espaciosHora: Partial<EspacioHora>[] = [];

    // Convertir strings de tiempo a minutos desde medianoche
    const convertirAMinutos = (tiempo: string): number => {
      const partes = tiempo.split(':');
      const horas = parseInt(partes[0], 10);
      const minutos = parseInt(partes[1], 10);
      console.log(`Convirtiendo ${tiempo}: ${horas}h ${minutos}m = ${horas * 60 + minutos} minutos totales`);
      return horas * 60 + minutos;
    };

    // Convertir minutos a formato HH:MM:SS
    const convertirAFormato = (minutos: number): string => {
      const horas = Math.floor(minutos / 60);
      const mins = minutos % 60;
      return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
    };

    const minutosInicio = convertirAMinutos(horaInicio);
    const minutosFin = convertirAMinutos(horaFin);

    console.log(`Rango: ${minutosInicio} a ${minutosFin} minutos`);
    console.log(`Total de minutos disponibles: ${minutosFin - minutosInicio}`);
    console.log(`Bloques esperados: ${Math.floor((minutosFin - minutosInicio) / horaLimiteMinutos)}`);

    let minutosActuales = minutosInicio;
    let contador = 1;

    while (minutosActuales + horaLimiteMinutos <= minutosFin) {
      const horaInicioBloque = convertirAFormato(minutosActuales);
      const horaFinBloque = convertirAFormato(minutosActuales + horaLimiteMinutos);

      const bloque = {
        nombre: `Bloque ${contador}`,
        horainicio: horaInicioBloque,
        horafin: horaFinBloque,
        espacioid: espacioId,
        reservaid: null, // Explícitamente null para evitar que use el default de la DB
        estado: true // true = disponible por defecto
      };

      console.log(`Bloque ${contador}:`, bloque);
      espaciosHora.push(bloque);

      minutosActuales += horaLimiteMinutos;
      contador++;
    }

    console.log(`Total de bloques generados: ${espaciosHora.length}`);
    return espaciosHora;
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
      this.activityLog.registrar('espacio_eliminado', 'Espacio eliminado', `"${espacio.nombre}" eliminado de la sección`);
      
      const seccion = this.seccionSeleccionada();
      if (seccion) {
        await this.cargarEspacios(seccion);
      }

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

  // ==================== NAVEGACIÓN ====================
  volverAInstitucionesSecundaria() {
    this.vistaSecundaria.set('instituciones');
    this.institucionSeleccionada.set(null);
    this.seccionSeleccionada.set(null);
    this.secciones.set([]);
    this.espacios.set([]);
    this.limpiarMensajes();
  }

  async volverASecciones() {
    this.vistaSecundaria.set('secciones');
    this.seccionSeleccionada.set(null);
    this.espacios.set([]);
    this.limpiarMensajes();
    
    // Recargar las secciones de la institución actual
    const institucion = this.institucionSeleccionada();
    if (institucion) {
      await this.cargarSecciones(institucion);
    }
  }

  // ==================== UTILIDADES ====================
  obtenerEstadoTexto(estado: boolean): string {
    return estado ? 'Desocupado' : 'Ocupado';
  }

  obtenerEstadoClase(estado: boolean): string {
    return estado ? 'estado-desocupado' : 'estado-ocupado';
  }

  // Métodos auxiliares para actualizar formularios (evitar spread operator en template)
  actualizarInstitucionNombre(value: string) {
    this.institucionForm.set({ ...this.institucionForm(), nombre: value });
  }

  actualizarInstitucionTipo(value: string) {
    this.institucionForm.set({ ...this.institucionForm(), tipo: value });
  }

  actualizarInstitucionDireccion(value: string) {
    this.institucionForm.set({ ...this.institucionForm(), direccion: value });
  }

  actualizarInstitucionServicio(value: string) {
    this.institucionForm.set({ ...this.institucionForm(), servicio: value });
  }

  actualizarHorarioSeleccionado(horarioid: string) {
    this.horarioSeleccionado.set(horarioid);
    this.institucionForm.set({ ...this.institucionForm(), horarioid: horarioid });
  }

  actualizarSeccionNombre(value: string) {
    this.seccionForm.set({ ...this.seccionForm(), nombre: value });
  }

  actualizarSeccionTipo(value: string) {
    this.seccionForm.set({ ...this.seccionForm(), tipo: value });
  }

  actualizarSeccionCapacidad(value: number) {
    this.seccionForm.set({ ...this.seccionForm(), capacidad: value });
  }

  actualizarSeccionCalificacion(value: number) {
    this.seccionForm.set({ ...this.seccionForm(), calificacion: value });
  }

  // ==================== GESTIÓN DE AMENIDADES ====================
  actualizarAmenidad(index: number, value: string) {
    const amenidades = [...this.amenidadesLista()];
    amenidades[index] = value;
    this.amenidadesLista.set(amenidades);
  }

  agregarCampoAmenidad() {
    const amenidades = [...this.amenidadesLista()];
    if (amenidades.length < 10) {
      amenidades.push('');
      this.amenidadesLista.set(amenidades);
    }
  }

  eliminarCampoAmenidad(index: number) {
    const amenidades = [...this.amenidadesLista()];
    // Solo permitir eliminar si hay más de 1 campo
    if (amenidades.length > 1) {
      amenidades.splice(index, 1);
      this.amenidadesLista.set(amenidades);
    }
  }

  puedeAgregarAmenidad(): boolean {
    return this.amenidadesLista().length < 10;
  }

  puedeEliminarAmenidad(): boolean {
    return this.amenidadesLista().length > 1;
  }

  actualizarEspacioNombre(value: string) {
    this.espacioForm.set({ ...this.espacioForm(), nombre: value });
  }

  actualizarEspacioEstado(value: boolean) {
    this.espacioForm.set({ ...this.espacioForm(), estado: value });
  }

  actualizarEspacioHoraLimite(value: number) {
    this.espacioForm.set({ ...this.espacioForm(), horalimite: value });
  }

  actualizarEspacioHoraNombre(value: string) {
    this.espacioHoraForm.set({ ...this.espacioHoraForm(), nombre: value });
  }

  actualizarEspacioHoraEstado(value: boolean) {
    this.espacioHoraForm.set({ ...this.espacioHoraForm(), estado: value });
  }

  // ==================== RENOMBRAR GLOBALMENTE ====================
  abrirModalRenombrarGlobal() {
    this.prefijoNombreGlobal.set('Bloque');
    this.mostrarModalRenombrarGlobal.set(true);
  }

  cerrarModalRenombrarGlobal() {
    this.mostrarModalRenombrarGlobal.set(false);
    this.prefijoNombreGlobal.set('Bloque');
  }

  actualizarPrefijoNombreGlobal(value: string) {
    this.prefijoNombreGlobal.set(value);
  }

  async renombrarTodosEspaciosHora() {
    const espacio = this.espacioSeleccionadoHora();
    const prefijo = this.prefijoNombreGlobal().trim();

    if (!espacio) return;

    if (!prefijo) {
      this.error.set('El prefijo no puede estar vacío');
      return;
    }

    if (!confirm(`¿Deseas renombrar todos los bloques de "${espacio.nombre}" con el prefijo "${prefijo}"?`)) {
      return;
    }

    try {
      this.cargandoEspacioHora.set(true);
      this.error.set('');

      // Obtener todos los bloques ordenados
      const { data: bloques, error: bloquesError } = await this.supabase
        .from('espaciohora')
        .select('*')
        .eq('espacioid', espacio.espacioid)
        .order('horainicio', { ascending: true });

      if (bloquesError) throw bloquesError;

      if (!bloques || bloques.length === 0) {
        this.error.set('No hay bloques para renombrar');
        return;
      }

      // Renombrar cada bloque
      const promesas = bloques.map((bloque, index) => {
        return this.supabase
          .from('espaciohora')
          .update({ nombre: `${prefijo} ${index + 1}` })
          .eq('espaciohoraid', bloque.espaciohoraid);
      });

      await Promise.all(promesas);

      this.mensajeExito.set(`Se renombraron ${bloques.length} bloques exitosamente`);
      this.activityLog.registrar('espaciohora_renombrado', 'Bloques renombrados', `${bloques.length} bloques de "${espacio.nombre}" renombrados con prefijo "${prefijo}"`);

      // Recargar la lista
      await this.cargarEspaciosHora(espacio.espacioid);

      setTimeout(() => {
        this.cerrarModalRenombrarGlobal();
        this.mensajeExito.set('');
      }, 1500);

    } catch (error: any) {
      console.error('Error al renombrar bloques:', error);
      this.error.set('Error al renombrar los bloques');
    } finally {
      this.cargandoEspacioHora.set(false);
    }
  }

  // ==================== GESTIÓN DE ESPACIOHORA ====================
  async abrirModalEspacioHora(espacio: Espacio) {
    this.espacioSeleccionadoHora.set(espacio);
    this.mostrarModalEspacioHora.set(true);
    await this.cargarEspaciosHora(espacio.espacioid);
  }

  async cargarEspaciosHora(espacioId: string) {
    try {
      this.cargandoEspacioHora.set(true);
      
      const { data, error } = await this.supabase
        .from('espaciohora')
        .select('*')
        .eq('espacioid', espacioId)
        .order('horainicio', { ascending: true });

      if (error) throw error;

      this.espaciosHora.set(data || []);
      console.log(`Cargados ${data?.length || 0} espaciohora para el espacio:`, data);
    } catch (error: any) {
      console.error('Error al cargar espaciohora:', error);
      this.error.set('Error al cargar los bloques horarios');
    } finally {
      this.cargandoEspacioHora.set(false);
    }
  }

  cerrarModalEspacioHora() {
    this.mostrarModalEspacioHora.set(false);
    this.espacioSeleccionadoHora.set(null);
    this.espaciosHora.set([]);
  }

  // ==================== EDITAR ESPACIOHORA ====================
  abrirModalEditarEspacioHora(espacioHora: EspacioHora) {
    this.espacioHoraEnEdicion.set(espacioHora);
    this.espacioHoraForm.set({
      nombre: espacioHora.nombre,
      estado: espacioHora.estado ?? true
    });
    this.mostrarModalEditarEspacioHora.set(true);
  }

  cerrarModalEditarEspacioHora() {
    this.mostrarModalEditarEspacioHora.set(false);
    this.espacioHoraEnEdicion.set(null);
    this.espacioHoraForm.set({
      nombre: '',
      estado: true
    });
  }

  async guardarEspacioHora() {
    const form = this.espacioHoraForm();
    const espacioHora = this.espacioHoraEnEdicion();

    if (!espacioHora?.espaciohoraid) return;

    if (!form.nombre?.trim()) {
      this.error.set('El nombre es requerido');
      return;
    }

    try {
      this.cargandoEspacioHora.set(true);
      this.error.set('');

      const { error } = await this.supabase
        .from('espaciohora')
        .update({
          nombre: form.nombre,
          estado: form.estado ?? true
        })
        .eq('espaciohoraid', espacioHora.espaciohoraid);

      if (error) throw error;

      this.mensajeExito.set('Bloque horario actualizado exitosamente');
      this.activityLog.registrar('espaciohora_editado', 'Bloque horario editado', `"${form.nombre}" actualizado`);
      
      // Recargar la lista
      const espacio = this.espacioSeleccionadoHora();
      if (espacio) {
        await this.cargarEspaciosHora(espacio.espacioid);
      }

      setTimeout(() => {
        this.cerrarModalEditarEspacioHora();
        this.mensajeExito.set('');
      }, 1500);

    } catch (error: any) {
      console.error('Error al guardar espaciohora:', error);
      this.error.set('Error al guardar el bloque horario');
    } finally {
      this.cargandoEspacioHora.set(false);
    }
  }

  // ==================== ELIMINAR ESPACIOHORA ====================
  async eliminarEspacioHora(espacioHora: EspacioHora) {
    if (!confirm(`¿Deseas eliminar el bloque "${espacioHora.nombre}"?`)) {
      return;
    }

    try {
      this.cargandoEspacioHora.set(true);
      this.error.set('');

      const { error } = await this.supabase
        .from('espaciohora')
        .delete()
        .eq('espaciohoraid', espacioHora.espaciohoraid);

      if (error) throw error;

      this.mensajeExito.set('Bloque horario eliminado exitosamente');
      this.activityLog.registrar('espaciohora_eliminado', 'Bloque horario eliminado', `"${espacioHora.nombre}" eliminado`);

      // Recargar la lista
      const espacio = this.espacioSeleccionadoHora();
      if (espacio) {
        await this.cargarEspaciosHora(espacio.espacioid);
      }

      setTimeout(() => {
        this.mensajeExito.set('');
      }, 2000);

    } catch (error: any) {
      console.error('Error al eliminar espaciohora:', error);
      this.error.set('Error al eliminar el bloque horario');
    } finally {
      this.cargandoEspacioHora.set(false);
    }
  }

  // ==================== CREAR ESPACIOHORA UNO POR UNO ====================
  async crearNuevoEspacioHora() {
    const espacio = this.espacioSeleccionadoHora();
    if (!espacio) return;

    try {
      this.cargandoEspacioHora.set(true);
      this.error.set('');

      // Obtener la sección para luego obtener el horario de la institución
      const { data: espacioData, error: espacioError } = await this.supabase
        .from('espacio')
        .select('seccionid')
        .eq('espacioid', espacio.espacioid)
        .single();

      if (espacioError) throw espacioError;

      const { data: seccionData, error: seccionError } = await this.supabase
        .from('seccion')
        .select('institucionid')
        .eq('seccionid', espacioData.seccionid)
        .single();

      if (seccionError) throw seccionError;

      const horarioInstitucion = await this.obtenerHorarioInstitucion(seccionData.institucionid);

      if (!horarioInstitucion) {
        this.error.set('La institución no tiene horario configurado');
        return;
      }

      // Obtener todos los bloques existentes ordenados
      const { data: bloquesExistentes, error: bloquesError } = await this.supabase
        .from('espaciohora')
        .select('*')
        .eq('espacioid', espacio.espacioid)
        .order('horainicio', { ascending: true });

      if (bloquesError) throw bloquesError;

      const horaLimite = espacio.horalimite || 60;

      // Convertir hora fin del horario de institución a minutos
      const convertirAMinutos = (tiempo: string): number => {
        const partes = tiempo.split(':');
        const horas = parseInt(partes[0], 10);
        const minutos = parseInt(partes[1], 10);
        return horas * 60 + minutos;
      };

      const convertirAFormato = (minutos: number): string => {
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
      };

      const minutosFin = convertirAMinutos(horarioInstitucion.horafin);

      // Determinar la hora de inicio del nuevo bloque
      let minutosInicio: number;
      let contador: number;

      if (!bloquesExistentes || bloquesExistentes.length === 0) {
        // Si no hay bloques, empezar desde el inicio del horario
        minutosInicio = convertirAMinutos(horarioInstitucion.horainicio);
        contador = 1;
      } else {
        // Obtener el último bloque
        const ultimoBloque = bloquesExistentes[bloquesExistentes.length - 1];
        minutosInicio = convertirAMinutos(ultimoBloque.horafin);
        contador = bloquesExistentes.length + 1;
      }

      // Verificar si hay espacio para un nuevo bloque
      if (minutosInicio + horaLimite > minutosFin) {
        this.error.set('No hay espacio disponible para crear más bloques. Se alcanzó el límite del horario.');
        return;
      }

      const horaInicioBloque = convertirAFormato(minutosInicio);
      const horaFinBloque = convertirAFormato(minutosInicio + horaLimite);

      // Crear el nuevo bloque
      const { error: insertError } = await this.supabase
        .from('espaciohora')
        .insert([{
          nombre: `Bloque ${contador}`,
          horainicio: horaInicioBloque,
          horafin: horaFinBloque,
          espacioid: espacio.espacioid,
          reservaid: null,
          estado: true
        }]);

      if (insertError) throw insertError;

      this.mensajeExito.set(`Bloque ${contador} creado: ${horaInicioBloque.substring(0, 5)} - ${horaFinBloque.substring(0, 5)}`);
      this.activityLog.registrar('espaciohora_creado', 'Bloque horario creado', `"${espacio.nombre}" - Bloque ${contador}`);

      // Recargar la lista
      await this.cargarEspaciosHora(espacio.espacioid);

      setTimeout(() => {
        this.mensajeExito.set('');
      }, 2000);

    } catch (error: any) {
      console.error('Error al crear nuevo espaciohora:', error);
      this.error.set('Error al crear el bloque horario');
    } finally {
      this.cargandoEspacioHora.set(false);
    }
  }

  formatearHora(hora: string): string {
    if (!hora) return '--:--';
    return hora.substring(0, 5); // De HH:MM:SS a HH:MM
  }

  async regenerarEspaciosHora(espacio: Espacio) {
    if (!confirm(`¿Deseas regenerar los bloques horarios de "${espacio.nombre}"? Se mantendrán los bloques con reserva activa.`)) {
      return;
    }

    try {
      this.cargandoEspacioHora.set(true);
      const seccion = this.seccionSeleccionada();
      
      if (!seccion) {
        this.error.set('No se encontró la sección');
        return;
      }

      const horarioInstitucion = await this.obtenerHorarioInstitucion(seccion.institucionid);
      
      if (!horarioInstitucion) {
        this.error.set('La institución no tiene horario configurado');
        return;
      }

      // Eliminar espaciohora existentes sin reserva
      await this.supabase
        .from('espaciohora')
        .delete()
        .eq('espacioid', espacio.espacioid)
        .is('reservaid', null);

      // Generar nuevos espaciohora
      const espaciosHora = this.generarEspaciosHora(
        espacio.espacioid,
        horarioInstitucion.horainicio,
        horarioInstitucion.horafin,
        espacio.horalimite || 60
      );

      const { error } = await this.supabase
        .from('espaciohora')
        .insert(espaciosHora);

      if (error) throw error;

      this.mensajeExito.set(`Se regeneraron ${espaciosHora.length} bloques horarios (se mantuvieron las reservas activas)`);
      this.activityLog.registrar('espaciohora_regenerado', 'Bloques regenerados', `${espaciosHora.length} bloques de "${espacio.nombre}" regenerados (conservando reservas)`);
      await this.cargarEspaciosHora(espacio.espacioid);

      setTimeout(() => {
        this.mensajeExito.set('');
      }, 2000);

    } catch (error: any) {
      console.error('Error al regenerar espaciohora:', error);
      this.error.set('Error al regenerar bloques horarios');
    } finally {
      this.cargandoEspacioHora.set(false);
    }
  }

  async regenerarTodoEspaciosHora(espacio: Espacio) {
    if (!confirm(`⚠️ ATENCIÓN: Esto eliminará TODOS los bloques de "${espacio.nombre}", incluyendo los que tienen reservas activas. ¿Estás seguro?`)) {
      return;
    }

    try {
      this.cargandoEspacioHora.set(true);
      const seccion = this.seccionSeleccionada();
      
      if (!seccion) {
        this.error.set('No se encontró la sección');
        return;
      }

      const horarioInstitucion = await this.obtenerHorarioInstitucion(seccion.institucionid);
      
      if (!horarioInstitucion) {
        this.error.set('La institución no tiene horario configurado');
        return;
      }

      // Eliminar TODOS los espaciohora (incluso con reserva)
      await this.supabase
        .from('espaciohora')
        .delete()
        .eq('espacioid', espacio.espacioid);

      // Generar nuevos espaciohora
      const espaciosHora = this.generarEspaciosHora(
        espacio.espacioid,
        horarioInstitucion.horainicio,
        horarioInstitucion.horafin,
        espacio.horalimite || 60
      );

      const { error } = await this.supabase
        .from('espaciohora')
        .insert(espaciosHora);

      if (error) throw error;

      this.mensajeExito.set(`Se regeneraron TODOS los bloques (${espaciosHora.length} bloques creados, se eliminaron las reservas)`);
      this.activityLog.registrar('espaciohora_regenerado', 'Regeneración completa', `TODOS los bloques de "${espacio.nombre}" regenerados (${espaciosHora.length} nuevos, reservas eliminadas)`);
      await this.cargarEspaciosHora(espacio.espacioid);

      setTimeout(() => {
        this.mensajeExito.set('');
      }, 2000);

    } catch (error: any) {
      console.error('Error al regenerar todo:', error);
      this.error.set('Error al regenerar bloques horarios');
    } finally {
      this.cargandoEspacioHora.set(false);
    }
  }

  limpiarMensajes() {
    this.error.set('');
    this.mensajeExito.set('');
  }

  // ==================== MANEJO DE IMÁGENES (MÚLTIPLES) ====================
  onFileSelected(event: any): void {
    const files = Array.from(event.target.files || []) as File[];
    
    if (files.length === 0) return;

    // Validar cada archivo
    for (const file of files) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        this.error.set('Por favor selecciona solo archivos de imagen válidos');
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error.set('Cada imagen no debe superar los 5MB');
        return;
      }
    }

    // Agregar archivos a la lista
    this.archivosSeleccionados.push(...files);

    // Crear previsualizaciones
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previsualizacionImagenes.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });

    console.log(`${files.length} archivo(s) seleccionado(s)`);
  }

  eliminarImagenPrevia(index: number): void {
    this.archivosSeleccionados.splice(index, 1);
    this.previsualizacionImagenes.splice(index, 1);
  }

  limpiarImagenes(): void {
    this.archivosSeleccionados = [];
    this.previsualizacionImagenes = [];
  }

  // ==================== MANEJO DE IMÁGENES SECCIONES (MÚLTIPLES) ====================
  onFileSelectedSeccion(event: any): void {
    const files = Array.from(event.target.files || []) as File[];
    
    if (files.length === 0) return;

    // Validar cada archivo
    for (const file of files) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        this.error.set('Por favor selecciona solo archivos de imagen válidos');
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error.set('Cada imagen no debe superar los 5MB');
        return;
      }
    }

    // Agregar archivos a la lista
    this.archivosSeleccionadosSeccion.push(...files);

    // Crear previsualizaciones
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previsualizacionImagenesSeccion.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });

    console.log(`${files.length} archivo(s) de sección seleccionado(s)`);
  }

  eliminarImagenPreviaSeccion(index: number): void {
    this.archivosSeleccionadosSeccion.splice(index, 1);
    this.previsualizacionImagenesSeccion.splice(index, 1);
  }

  limpiarImagenesSeccion(): void {
    this.archivosSeleccionadosSeccion = [];
    this.previsualizacionImagenesSeccion = [];
  }
}

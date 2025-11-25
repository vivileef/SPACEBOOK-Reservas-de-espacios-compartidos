import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../../../shared/services/database.service';
import { Institucion, Seccion, Espacio } from '../../../../shared/models/database.models';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../../../shared/services/supabase.service';
import { Auth } from '../../../../shared/services/auth.service';

interface EspacioHora {
  espaciohoraid: string;
  nombre: string;
  horainicio: string;
  horafin: string;
  espacioid: string;
  reservaid?: string | null;
  estado: boolean;
}

@Component({
  selector: 'app-catalogo-espacios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo-espacios.html',
  styleUrl: './catalogo-espacios.css',
})
export class CatalogoEspacios implements OnInit {
  private dbService = inject(DatabaseService);
  private supabase: SupabaseClient;
  private auth = inject(Auth);
  
  // Signals para datos
  instituciones = signal<Institucion[]>([]);
  secciones = signal<Seccion[]>([]);
  espacios = signal<Espacio[]>([]);
  
  // Navegación
  vistaActual = signal<'instituciones' | 'espacios'>('instituciones');
  institucionSeleccionada = signal<Institucion | null>(null);
  
  // Estados
  cargando = signal(true);
  error = signal('');
  mensajeExito = signal('');
  
  // Modal de reserva
  mostrarModalReserva = signal(false);
  espacioAReservar = signal<Espacio | null>(null);
  espaciosHoraDisponibles = signal<EspacioHora[]>([]);
  espaciosHoraSeleccionados = signal<Set<string>>(new Set());
  nombreReserva = signal('');
  cargandoReserva = signal(false);
  
  // Carrusel de imágenes institución
  indiceImagenInstitucion = signal(0);
  
  // Carrusel de imágenes por sección
  indicesImagenesSeccion = new Map<string, number>();

  constructor() {
    const supabaseService = inject(SupabaseService);
    this.supabase = supabaseService.getClient();
  }

  async ngOnInit() {
    await this.cargarInstituciones();
  }

  async cargarInstituciones() {
    try {
      this.cargando.set(true);
      this.error.set('');
      const data = await this.dbService.getInstituciones();
      this.instituciones.set(data);
    } catch (err: any) {
      this.error.set('Error al cargar instituciones: ' + err.message);
      console.error(err);
    } finally {
      this.cargando.set(false);
    }
  }

  async seleccionarInstitucion(institucion: Institucion) {
    try {
      this.cargando.set(true);
      this.error.set('');
      this.institucionSeleccionada.set(institucion);
      this.indiceImagenInstitucion.set(0);
      this.indicesImagenesSeccion.clear();
      
      // Cargar secciones de la institución
      const secciones = await this.dbService.getSecciones(institucion.institucionid);
      this.secciones.set(secciones);
      
      // Cargar espacios de todas las secciones
      const todosEspacios: Espacio[] = [];
      for (const seccion of secciones) {
        const espaciosSeccion = await this.dbService.getEspacios(seccion.seccionid);
        todosEspacios.push(...espaciosSeccion);
      }
      this.espacios.set(todosEspacios);
      
      this.vistaActual.set('espacios');
    } catch (err: any) {
      this.error.set('Error al cargar espacios: ' + err.message);
      console.error(err);
    } finally {
      this.cargando.set(false);
    }
  }

  volverAInstituciones() {
    this.vistaActual.set('instituciones');
    this.institucionSeleccionada.set(null);
    this.secciones.set([]);
    this.espacios.set([]);
  }

  async reservarEspacio(espacio: Espacio) {
    try {
      this.cargando.set(true);
      this.error.set('');
      this.espacioAReservar.set(espacio);
      this.espaciosHoraSeleccionados.set(new Set());
      this.nombreReserva.set('');
      
      // Cargar todos los espaciohora disponibles del espacio
      const { data, error } = await this.supabase
        .from('espaciohora')
        .select('*')
        .eq('espacioid', espacio.espacioid)
        .eq('estado', true) // Solo los disponibles
        .is('reservaid', null) // Sin reserva
        .order('horainicio', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        this.error.set('No hay bloques horarios disponibles para este espacio');
        return;
      }

      // Filtrar bloques cuya hora de fin ya pasó
      const ahora = new Date();
      const horaActual = ahora.getHours();
      const minutosActuales = ahora.getMinutes();
      const tiempoActualEnMinutos = horaActual * 60 + minutosActuales;

      const bloquesFuturos = data.filter(bloque => {
        const [horasFinStr, minutosFinStr] = (bloque.horafin || '00:00:00').split(':');
        const horasFin = parseInt(horasFinStr);
        const minutosFin = parseInt(minutosFinStr);
        const tiempoFinEnMinutos = horasFin * 60 + minutosFin;
        
        // Solo mostrar bloques cuya hora de fin no haya pasado
        return tiempoFinEnMinutos > tiempoActualEnMinutos;
      });

      if (bloquesFuturos.length === 0) {
        this.error.set('No hay bloques horarios disponibles para reservar hoy. Los espacios se liberaran mañana.');
        return;
      }

      this.espaciosHoraDisponibles.set(bloquesFuturos);
      this.mostrarModalReserva.set(true);

    } catch (err: any) {
      this.error.set('Error al cargar bloques horarios: ' + err.message);
      console.error(err);
    } finally {
      this.cargando.set(false);
    }
  }

  toggleEspacioHora(espaciohoraid: string) {
    const seleccionados = new Set(this.espaciosHoraSeleccionados());
    if (seleccionados.has(espaciohoraid)) {
      seleccionados.delete(espaciohoraid);
    } else {
      seleccionados.add(espaciohoraid);
    }
    this.espaciosHoraSeleccionados.set(seleccionados);
  }

  estaSeleccionado(espaciohoraid: string): boolean {
    return this.espaciosHoraSeleccionados().has(espaciohoraid);
  }

  async confirmarReserva() {
    const usuario = this.auth.profile();
    const espacio = this.espacioAReservar();
    const seleccionados = this.espaciosHoraSeleccionados();

    if (!usuario?.usuarioid) {
      this.error.set('Debe iniciar sesión para realizar una reserva');
      return;
    }

    if (seleccionados.size === 0) {
      this.error.set('Debe seleccionar al menos un bloque horario');
      return;
    }

    try {
      this.cargandoReserva.set(true);
      this.error.set('');

      // Generar nombre automático: "Reserva [Nombre del Espacio] - [Fecha]"
      const fechaHoy = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const nombreAutomatico = `Reserva ${espacio?.nombre} - ${fechaHoy}`;

      // 1. Crear la reserva
      const { data: reservaData, error: reservaError } = await this.supabase
        .from('reserva')
        .insert([{
          usuarioid: usuario.usuarioid,
          nombrereserva: nombreAutomatico,
          fechareserva: new Date().toISOString()
        }])
        .select()
        .single();

      if (reservaError) throw reservaError;

      // 2. Actualizar cada espaciohora seleccionado con la reserva
      const promesas = Array.from(seleccionados).map(espaciohoraid => {
        return this.supabase
          .from('espaciohora')
          .update({
            reservaid: reservaData.reservaid,
            estado: false // Marcar como ocupado
          })
          .eq('espaciohoraid', espaciohoraid);
      });

      const resultados = await Promise.all(promesas);
      const errores = resultados.filter(r => r.error);
      
      if (errores.length > 0) {
        console.error('Errores al actualizar espaciohora:', errores);
        throw new Error('Error al asignar algunos bloques horarios');
      }

      // 3. Verificar si TODOS los espaciohora del espacio están ocupados
      const { data: todosEspaciosHora, error: verificarError } = await this.supabase
        .from('espaciohora')
        .select('estado')
        .eq('espacioid', espacio!.espacioid);

      if (verificarError) throw verificarError;

      const todosOcupados = todosEspaciosHora?.every(eh => eh.estado === false);

      // 4. Si todos están ocupados, marcar el espacio como ocupado
      if (todosOcupados) {
        await this.supabase
          .from('espacio')
          .update({ estado: false })
          .eq('espacioid', espacio!.espacioid);
      }

      this.mensajeExito.set(`¡Reserva creada exitosamente! Se reservaron ${seleccionados.size} bloques horarios.`);
      
      // Recargar espacios para actualizar el estado
      await this.seleccionarInstitucion(this.institucionSeleccionada()!);
      
      setTimeout(() => {
        this.cerrarModalReserva();
        this.mensajeExito.set('');
      }, 2000);

    } catch (err: any) {
      this.error.set('Error al crear la reserva: ' + err.message);
      console.error(err);
    } finally {
      this.cargandoReserva.set(false);
    }
  }

  cerrarModalReserva() {
    this.mostrarModalReserva.set(false);
    this.espacioAReservar.set(null);
    this.espaciosHoraDisponibles.set([]);
    this.espaciosHoraSeleccionados.set(new Set());
    this.nombreReserva.set('');
    this.error.set('');
  }

  formatearHora(hora: string): string {
    if (!hora) return '--:--';
    return hora.substring(0, 5); // De HH:MM:SS a HH:MM
  }

  obtenerEstadoTexto(estado?: boolean): string {
    return estado === true ? 'Disponible' : estado === false ? 'Ocupado' : 'Sin definir';
  }

  obtenerEstadoClase(estado?: boolean): string {
    return estado === true ? 'bg-green-100 text-green-800' : estado === false ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
  }

  // Métodos para carrusel de institución
  siguienteImagenInstitucion() {
    const inst = this.institucionSeleccionada();
    if (!inst?.imagen_url || inst.imagen_url.length === 0) return;
    
    const indiceActual = this.indiceImagenInstitucion();
    const nuevoIndice = (indiceActual + 1) % inst.imagen_url.length;
    this.indiceImagenInstitucion.set(nuevoIndice);
  }

  anteriorImagenInstitucion() {
    const inst = this.institucionSeleccionada();
    if (!inst?.imagen_url || inst.imagen_url.length === 0) return;
    
    const indiceActual = this.indiceImagenInstitucion();
    const nuevoIndice = indiceActual === 0 ? inst.imagen_url.length - 1 : indiceActual - 1;
    this.indiceImagenInstitucion.set(nuevoIndice);
  }

  irAImagenInstitucion(indice: number) {
    this.indiceImagenInstitucion.set(indice);
  }

  // Métodos para carrusel de secciones
  obtenerIndiceImagenSeccion(seccionId: string): number {
    return this.indicesImagenesSeccion.get(seccionId) || 0;
  }

  siguienteImagenSeccion(seccion: Seccion) {
    if (!seccion.seccion_url || seccion.seccion_url.length === 0) return;
    
    const indiceActual = this.obtenerIndiceImagenSeccion(seccion.seccionid);
    const nuevoIndice = (indiceActual + 1) % seccion.seccion_url.length;
    this.indicesImagenesSeccion.set(seccion.seccionid, nuevoIndice);
  }

  anteriorImagenSeccion(seccion: Seccion) {
    if (!seccion.seccion_url || seccion.seccion_url.length === 0) return;
    
    const indiceActual = this.obtenerIndiceImagenSeccion(seccion.seccionid);
    const nuevoIndice = indiceActual === 0 ? seccion.seccion_url.length - 1 : indiceActual - 1;
    this.indicesImagenesSeccion.set(seccion.seccionid, nuevoIndice);
  }

  irAImagenSeccion(seccionId: string, indice: number) {
    this.indicesImagenesSeccion.set(seccionId, indice);
  }

  // Obtener espacios por sección
  obtenerEspaciosDeSeccion(seccionId: string): Espacio[] {
    return this.espacios().filter(e => e.seccionid === seccionId);
  }

  // Contar espacios disponibles por sección
  contarEspaciosDisponibles(seccionId: string): number {
    return this.obtenerEspaciosDeSeccion(seccionId).filter(e => e.estado === true).length;
  }
}

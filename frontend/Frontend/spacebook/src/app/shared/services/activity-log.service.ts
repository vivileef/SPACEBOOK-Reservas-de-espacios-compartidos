import { Injectable, signal } from '@angular/core';

export interface ActividadLog {
  id: string;
  tipo: 'espacio_creado' | 'espacio_editado' | 'espacio_eliminado' | 
        'espaciohora_creado' | 'espaciohora_editado' | 'espaciohora_eliminado' | 'espaciohora_regenerado' | 'espaciohora_renombrado' |
        'incidencia_creada' | 'incidencia_resuelta' | 'incidencia_eliminada' |
        'disponibilidad_editada' | 'seccion_creada' | 'seccion_editada' | 'seccion_eliminada' |
        'institucion_creada' | 'institucion_editada' | 'horario_creado' | 'horario_editado';
  titulo: string;
  descripcion: string;
  timestamp: Date;
  icono: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  private readonly MAX_ACTIVIDADES = 50;
  private readonly STORAGE_KEY = 'admin_actividades';
  
  actividades = signal<ActividadLog[]>([]);

  constructor() {
    this.cargarActividades();
  }

  // Cargar actividades desde localStorage
  private cargarActividades(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const actividades = JSON.parse(stored);
        // Convertir strings a Date objects
        actividades.forEach((a: any) => a.timestamp = new Date(a.timestamp));
        this.actividades.set(actividades);
      }
    } catch (error) {
      console.error('Error cargando actividades:', error);
    }
  }

  // Guardar actividades en localStorage
  private guardarActividades(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.actividades()));
    } catch (error) {
      console.error('Error guardando actividades:', error);
    }
  }

  // Registrar nueva actividad
  registrar(tipo: ActividadLog['tipo'], titulo: string, descripcion: string): void {
    const nuevaActividad: ActividadLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tipo,
      titulo,
      descripcion,
      timestamp: new Date(),
      icono: this.obtenerIcono(tipo),
      color: this.obtenerColor(tipo)
    };

    const actividadesActuales = [nuevaActividad, ...this.actividades()];
    
    // Mantener solo las últimas MAX_ACTIVIDADES
    if (actividadesActuales.length > this.MAX_ACTIVIDADES) {
      actividadesActuales.length = this.MAX_ACTIVIDADES;
    }

    this.actividades.set(actividadesActuales);
    this.guardarActividades();
  }

  // Obtener actividades recientes (límite opcional)
  obtenerRecientes(limite: number = 10): ActividadLog[] {
    return this.actividades().slice(0, limite);
  }

  // Limpiar todas las actividades
  limpiar(): void {
    this.actividades.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Obtener icono según tipo
  private obtenerIcono(tipo: ActividadLog['tipo']): string {
    const iconos: Record<ActividadLog['tipo'], string> = {
      espacio_creado: 'plus',
      espacio_editado: 'edit',
      espacio_eliminado: 'trash',
      espaciohora_creado: 'clock-plus',
      espaciohora_editado: 'clock-edit',
      espaciohora_eliminado: 'clock-trash',
      espaciohora_regenerado: 'refresh',
      espaciohora_renombrado: 'pencil',
      incidencia_creada: 'alert',
      incidencia_resuelta: 'check',
      incidencia_eliminada: 'trash',
      disponibilidad_editada: 'calendar',
      seccion_creada: 'folder-plus',
      seccion_editada: 'folder-edit',
      seccion_eliminada: 'folder-trash',
      institucion_creada: 'building-plus',
      institucion_editada: 'building-edit',
      horario_creado: 'time-plus',
      horario_editado: 'time-edit'
    };
    return iconos[tipo] || 'info';
  }

  // Obtener color según tipo
  private obtenerColor(tipo: ActividadLog['tipo']): string {
    if (tipo.includes('creado')) return 'bg-green-100';
    if (tipo.includes('editado') || tipo.includes('renombrado')) return 'bg-blue-100';
    if (tipo.includes('eliminado')) return 'bg-red-100';
    if (tipo.includes('regenerado')) return 'bg-purple-100';
    if (tipo.includes('resuelta')) return 'bg-green-100';
    if (tipo.includes('incidencia')) return 'bg-orange-100';
    if (tipo.includes('disponibilidad')) return 'bg-indigo-100';
    return 'bg-gray-100';
  }

  // Formatear tiempo transcurrido
  formatearTiempo(fecha: Date): string {
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    
    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (segundos < 60) return 'Justo ahora';
    if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (dias < 7) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    
    // Formatear fecha completa si es muy antigua
    return fecha.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}

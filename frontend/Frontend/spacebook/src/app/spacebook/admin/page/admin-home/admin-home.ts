import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../../shared/services/auth.service';
import { DatabaseService } from '../../../../shared/services/database.service';
import { ActivityLogService, ActividadLog } from '../../../../shared/services/activity-log.service';
import { SupabaseService } from '../../../../shared/services/supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';

interface ActividadReciente {
  id: string;
  tipo: 'reserva' | 'espacio' | 'incidencia' | 'cancelacion';
  titulo: string;
  descripcion: string;
  tiempo: string;
  icono: string;
  color: string;
}

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-4 sm:p-6 lg:p-8">
      <!-- Welcome Card -->
      <div class="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 text-white shadow-lg">
        <h2 class="text-2xl sm:text-3xl font-bold mb-2">
          ¡Bienvenido{{ userProfile()?.nombre ? ', ' + userProfile()?.nombre : '' }}! 👋
        </h2>
        <p class="text-sm sm:text-base text-red-100">
          Panel de administración de SpaceBook - Gestiona espacios y reservas
        </p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div class="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between">
            <div class="mb-3 sm:mb-0">
              <p class="text-gray-500 text-xs sm:text-sm font-medium">Total Espacios</p>
              <p class="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{{ totalEspacios() }}</p>
            </div>
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between">
            <div class="mb-3 sm:mb-0">
              <p class="text-gray-500 text-xs sm:text-sm font-medium">Disponibles</p>
              <p class="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{{ disponibles() }}</p>
            </div>
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between">
            <div class="mb-3 sm:mb-0">
              <p class="text-gray-500 text-xs sm:text-sm font-medium">Ocupados</p>
              <p class="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{{ ocupados() }}</p>
            </div>
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between">
            <div class="mb-3 sm:mb-0">
              <p class="text-gray-500 text-xs sm:text-sm font-medium">Reservas Hoy</p>
              <p class="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{{ reservasHoy() }}</p>
            </div>
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between">
            <div class="mb-3 sm:mb-0">
              <p class="text-gray-500 text-xs sm:text-sm font-medium">Incidencias Hoy</p>
              <p class="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{{ incidenciasHoy() }}</p>
            </div>
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <a routerLink="/admin-dashboard/administrar-espacios" 
           class="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 text-sm sm:text-base">Administrar Espacios</h3>
              <p class="text-xs sm:text-sm text-gray-500">Gestionar espacios</p>
            </div>
          </div>
        </a>

        <a routerLink="/admin-dashboard/calendario" 
           class="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 text-sm sm:text-base">Ver Calendario</h3>
              <p class="text-xs sm:text-sm text-gray-500">Disponibilidad</p>
            </div>
          </div>
        </a>

        <a routerLink="/admin-dashboard/incidencias" 
           class="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 text-sm sm:text-base">Crear Incidencia</h3>
              <p class="text-xs sm:text-sm text-gray-500">Reportar problemas</p>
            </div>
          </div>
        </a>

        <a routerLink="/admin-dashboard/reservas" 
           class="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 text-sm sm:text-base">Ver Reservas</h3>
              <p class="text-xs sm:text-sm text-gray-500">Gestionar reservas</p>
            </div>
          </div>
        </a>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-900">Actividad Reciente</h3>
          @if (actividadesAdmin().length > 0) {
            <button 
              (click)="limpiarActividades()"
              class="text-xs text-gray-500 hover:text-red-600 transition-colors">
              Limpiar todo
            </button>
          }
        </div>
        
        @if (actividadesAdmin().length === 0) {
          <div class="text-center py-8 text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
            <p class="text-sm">No hay actividad reciente</p>
            <p class="text-xs text-gray-400 mt-1">Las acciones que realices se mostrarán aquí</p>
          </div>
        } @else {
          <div class="space-y-3 max-h-96 overflow-y-auto">
            @for (actividad of actividadesAdmin(); track actividad.id) {
              <div class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                   [ngClass]="actividad.color">
                <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white">
                  <span class="text-lg">{{ getEmojiForActivity(actividad.tipo) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">{{ actividad.titulo }}</p>
                  <p class="text-xs text-gray-600 truncate">{{ actividad.descripcion }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ activityLogService.formatearTiempo(actividad.timestamp) }}</p>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class AdminHome implements OnInit {
  private auth = inject(Auth);
  private dbService = inject(DatabaseService);
  activityLogService = inject(ActivityLogService);
  private supabase: SupabaseClient;
  
  userProfile = this.auth.profile;
  
  totalEspacios = signal(0);
  disponibles = signal(0);
  ocupados = signal(0);
  reservasHoy = signal(0);
  incidenciasHoy = signal(0);
  
  actividadesRecientes = signal<ActividadReciente[]>([]);
  cargandoActividad = signal(true);
  
  actividadesAdmin = signal<ActividadLog[]>([]);

  constructor() {
    const supabaseService = inject(SupabaseService);
    this.supabase = supabaseService.getClient();
    
    // Efecto para actualizar actividades cuando cambien
    effect(() => {
      const actividades = this.activityLogService.actividades();
      this.actividadesAdmin.set(actividades.slice(0, 10));
    });
  }

  async ngOnInit() {
    // Verificar y cargar perfil si es necesario
    await this.verificarPerfil();
    
    // Cargar estadísticas y actividades en paralelo
    await Promise.all([
      this.cargarEstadisticas(),
      this.cargarActividadReciente()
    ]);
  }

  async verificarPerfil() {
    console.log('AdminHome: Verificando perfil...', this.auth.profile());
    
    // Si ya hay perfil, no hacer nada
    if (this.auth.profile()?.nombre) {
      console.log('AdminHome: Perfil ya disponible');
      return;
    }

    // Intentar obtener la sesión y cargar el perfil
    try {
      const session = await this.auth.getSession();
      if (session?.user?.email) {
        const email = session.user.email;
        console.log('AdminHome: Cargando perfil para email:', email);
        
        if (this.auth.isAdminEmail(email)) {
          const adminProfile = await this.auth.getAdminProfile(email);
          if ((adminProfile as any).data) {
            const adminData = (adminProfile as any).data;
            this.auth.profile.set({
              usuarioid: adminData.adminid,
              nombre: adminData.nombre,
              apellido: adminData.apellido,
              correo: adminData.correo,
              cedula: adminData.cedula,
              telefono: adminData.telefono,
              isAdmin: true
            });
            console.log('AdminHome: Perfil cargado exitosamente:', this.auth.profile());
          }
        }
      }
    } catch (error) {
      console.error('AdminHome: Error cargando perfil:', error);
    }
  }

  async cargarEstadisticas() {
    try {
      const espacios = await this.dbService.getEspacios();
      this.totalEspacios.set(espacios.length);
      
      const disponiblesCount = espacios.filter(e => e.estado).length;
      this.disponibles.set(disponiblesCount);
      this.ocupados.set(espacios.length - disponiblesCount);

      // Obtener fechas del día actual
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);

      // Consulta directa de reservas de hoy usando Supabase
      const { data: reservasHoy, error: errorReservas } = await this.supabase
        .from('reserva')
        .select('*')
        .gte('fechareserva', hoy.toISOString())
        .lt('fechareserva', manana.toISOString());

      if (errorReservas) {
        console.error('Error cargando reservas de hoy:', errorReservas);
        this.reservasHoy.set(0);
      } else {
        this.reservasHoy.set(reservasHoy?.length || 0);
      }

      // Consulta directa de incidencias de hoy usando Supabase
      const { data: incidenciasHoy, error: errorIncidencias } = await this.supabase
        .from('incidencia')
        .select('*')
        .gte('fechaIncidencia', hoy.toISOString())
        .lt('fechaIncidencia', manana.toISOString());

      if (errorIncidencias) {
        console.error('Error cargando incidencias de hoy:', errorIncidencias);
        this.incidenciasHoy.set(0);
      } else {
        this.incidenciasHoy.set(incidenciasHoy?.length || 0);
      }

    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }

  async cargarActividadReciente() {
    try {
      this.cargandoActividad.set(true);
      const actividades: ActividadReciente[] = [];

      // Últimas reservas
      const reservas = await this.dbService.getReservas();
      const ultimasReservas = reservas
        .sort((a, b) => new Date(b.fechareserva).getTime() - new Date(a.fechareserva).getTime())
        .slice(0, 3);

      for (const reserva of ultimasReservas) {
        actividades.push({
          id: `reserva-${reserva.reservaid}`,
          tipo: 'reserva',
          titulo: 'Nueva reserva confirmada',
          descripcion: `Reserva confirmada`,
          tiempo: this.calcularTiempo(reserva.fechareserva),
          icono: 'check',
          color: 'bg-green-100'
        });
      }

      // Últimas incidencias
      const incidencias = await this.dbService.getIncidencias();
      const ultimasIncidencias = incidencias
        .sort((a, b) => new Date(b.fechaIncidencia).getTime() - new Date(a.fechaIncidencia).getTime())
        .slice(0, 2);

      for (const incidencia of ultimasIncidencias) {
        actividades.push({
          id: `incidencia-${incidencia.incidenciaid}`,
          tipo: 'incidencia',
          titulo: 'Nueva incidencia reportada',
          descripcion: `${incidencia.tipo}: ${incidencia.descripcion?.substring(0, 50) || ''}...`,
          tiempo: this.calcularTiempo(incidencia.fechaIncidencia),
          icono: 'alert',
          color: 'bg-red-100'
        });
      }

      // Ordenar por fecha
      actividades.sort((a, b) => {
        const timeA = this.extraerTiempoNumerico(a.tiempo);
        const timeB = this.extraerTiempoNumerico(b.tiempo);
        return timeA - timeB;
      });

      this.actividadesRecientes.set(actividades.slice(0, 5));
    } catch (error) {
      console.error('Error cargando actividad reciente:', error);
    } finally {
      this.cargandoActividad.set(false);
    }
  }

  calcularTiempo(fecha: string): string {
    const ahora = new Date();
    const fechaEvento = new Date(fecha);
    const diferencia = ahora.getTime() - fechaEvento.getTime();
    
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 1) return 'Justo ahora';
    if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
  }

  extraerTiempoNumerico(tiempo: string): number {
    if (tiempo === 'Justo ahora') return 0;
    const match = tiempo.match(/\d+/);
    if (!match) return 0;
    const num = parseInt(match[0]);
    if (tiempo.includes('minuto')) return num;
    if (tiempo.includes('hora')) return num * 60;
    if (tiempo.includes('día')) return num * 1440;
    return 0;
  }

  getIconColor(tipo: string): string {
    switch(tipo) {
      case 'reserva': return 'text-green-600';
      case 'espacio': return 'text-blue-600';
      case 'incidencia': return 'text-red-600';
      case 'cancelacion': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  }

  limpiarActividades(): void {
    if (confirm('¿Estás seguro de que deseas limpiar todas las actividades?')) {
      this.activityLogService.limpiar();
    }
  }

  getEmojiForActivity(tipo: ActividadLog['tipo']): string {
    const emojis: Record<ActividadLog['tipo'], string> = {
      espacio_creado: '➕',
      espacio_editado: '✏️',
      espacio_eliminado: '🗑️',
      espaciohora_creado: '🕐',
      espaciohora_editado: '⏰',
      espaciohora_eliminado: '❌',
      espaciohora_regenerado: '🔄',
      espaciohora_renombrado: '📝',
      incidencia_creada: '⚠️',
      incidencia_resuelta: '✅',
      incidencia_eliminada: '🗑️',
      disponibilidad_editada: '📅',
      seccion_creada: '📁',
      seccion_editada: '📂',
      seccion_eliminada: '🗑️',
      institucion_creada: '🏢',
      institucion_editada: '🏛️',
      horario_creado: '⏱️',
      horario_editado: '⏲️'
    };
    return emojis[tipo] || 'ℹ️';
  }
}

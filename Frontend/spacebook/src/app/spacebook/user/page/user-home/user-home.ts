import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../../../shared/services/auth.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../../../shared/services/supabase.service';

interface ReservaResumen {
  reservaid: string;
  nombrereserva: string;
  fechareserva: string;
  nombreEspacio: string;
  primerBloque: { horainicio: string; horafin: string; } | null;
  estado: 'activa' | 'finalizada' | 'proxima';
}

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 sm:p-6 lg:p-8">
      <!-- Welcome Card -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 text-white shadow-lg">
        <h2 class="text-2xl sm:text-3xl font-bold mb-2">
          ¡Hola, {{ userProfile()?.nombre }}! 👋
        </h2>
        <p class="text-sm sm:text-base text-blue-100">
          Encuentra y reserva tu espacio de estacionamiento de manera rápida y segura
        </p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div class="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-xs sm:text-sm font-medium">Mis Reservas Activas</p>
              <p class="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{{ reservasActivas() }}</p>
            </div>
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-xs sm:text-sm font-medium">Reservas Finalizadas</p>
              <p class="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{{ reservasFinalizadas() }}</p>
            </div>
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-xs sm:text-sm font-medium">Próxima Reserva</p>
              <p class="text-lg sm:text-xl font-bold text-gray-900 mt-2">{{ proximaReservaTexto() }}</p>
            </div>
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
        <!-- Realizar Reserva -->
        <div class="bg-white rounded-2xl shadow-md p-4 sm:p-6 lg:p-8">
          <div class="flex items-center space-x-3 mb-4 sm:mb-6">
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <h3 class="text-lg sm:text-xl font-bold text-gray-900">Realizar Reserva</h3>
          </div>
          <p class="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Encuentra el espacio de estacionamiento perfecto cerca de tu ubicación
          </p>
          <button 
            (click)="irACatalogo()"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
            Buscar Ahora
          </button>
        </div>

        <!-- My Reservations -->
        <div class="bg-white rounded-2xl shadow-md p-4 sm:p-6 lg:p-8">
          <div class="flex items-center space-x-3 mb-4 sm:mb-6">
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900">Mis Reservas</h3>
          </div>
          <p class="text-gray-600 mb-6">
            Gestiona tus reservas activas y revisa tu historial
          </p>
          <button 
            (click)="irAMisReservas()"
            class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
            Ver Reservas
          </button>
        </div>
      </div>

      <!-- Recent Reservations -->
      <div class="bg-white rounded-2xl shadow-md p-4 sm:p-6 lg:p-8">
        <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Reservas Recientes</h3>
        
        @if (cargando()) {
          <div class="text-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p class="text-gray-500 mt-4">Cargando reservas...</p>
          </div>
        } @else if (reservasRecientes().length === 0) {
          <div class="text-center py-8 text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p>No tienes reservas recientes</p>
          </div>
        } @else {
          <div class="space-y-4">
            @for (reserva of reservasRecientes(); track reserva.reservaid) {
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div class="flex items-center space-x-4">
                  <div [class]="getColorClase(reserva.estado)">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">{{ reserva.nombreEspacio }}</p>
                    <p class="text-sm text-gray-500">{{ reserva.nombrereserva }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-medium text-gray-900">{{ formatearFechaHora(reserva) }}</p>
                  <span [class]="getBadgeClase(reserva.estado)">
                    {{ getEstadoTexto(reserva.estado) }}
                  </span>
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
export class UserHome implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);
  private supabase: SupabaseClient;
  
  userProfile = this.auth.profile;
  
  // Signals para datos
  reservasActivas = signal(0);
  reservasFinalizadas = signal(0);
  proximaReservaTexto = signal('Sin reservas');
  reservasRecientes = signal<ReservaResumen[]>([]);
  cargando = signal(true);

  constructor() {
    const supabaseService = inject(SupabaseService);
    this.supabase = supabaseService.getClient();
  }

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    try {
      this.cargando.set(true);
      const usuario = this.auth.profile();
      
      if (!usuario?.usuarioid) return;

      // Obtener todas las reservas del usuario con sus espacioshora
      const { data: reservas, error } = await this.supabase
        .from('reserva')
        .select(`
          reservaid,
          nombrereserva,
          fechareserva,
          espaciohora (
            espaciohoraid,
            horainicio,
            horafin,
            espacio (
              nombre
            )
          )
        `)
        .eq('usuarioid', usuario.usuarioid)
        .order('fechareserva', { ascending: false });

      if (error) throw error;

      const ahora = new Date();
      const reservasConEstado: ReservaResumen[] = [];
      let contadorFinalizadas = 0;
      let contadorActivas = 0;
      let proximaReserva: ReservaResumen | null = null;

      for (const reserva of reservas || []) {
        const bloques = Array.isArray(reserva.espaciohora) ? reserva.espaciohora : [];
        
        // Incluir reservas sin bloques (ya liberadas) como finalizadas
        if (bloques.length === 0) {
          contadorFinalizadas++;
          reservasConEstado.push({
            reservaid: reserva.reservaid,
            nombrereserva: reserva.nombrereserva,
            fechareserva: reserva.fechareserva,
            nombreEspacio: 'Espacio liberado',
            primerBloque: null,
            estado: 'finalizada'
          });
          continue;
        }

        const primerBloque = bloques[0];
        const espacioData = Array.isArray(primerBloque?.espacio) ? primerBloque.espacio[0] : primerBloque?.espacio;
        const nombreEspacio = espacioData?.nombre || 'Espacio sin nombre';
        
        // Combinar fecha de reserva con hora del primer bloque
        const fechaReserva = new Date(reserva.fechareserva);
        const [horas, minutos] = (primerBloque.horainicio || '00:00:00').split(':');
        fechaReserva.setHours(parseInt(horas), parseInt(minutos), 0);

        let estado: 'activa' | 'finalizada' | 'proxima';
        
        // Determinar estado
        const ultimoBloque = bloques[bloques.length - 1];
        const [horasF, minutosF] = (ultimoBloque.horafin || '23:59:59').split(':');
        const fechaFin = new Date(fechaReserva);
        fechaFin.setHours(parseInt(horasF), parseInt(minutosF), 0);

        if (fechaFin < ahora) {
          estado = 'finalizada';
          contadorFinalizadas++;
        } else if (fechaReserva <= ahora && fechaFin >= ahora) {
          estado = 'activa';
          contadorActivas++;
        } else {
          estado = 'proxima';
          contadorActivas++;
          if (!proximaReserva || fechaReserva < new Date(proximaReserva.fechareserva)) {
            proximaReserva = {
              reservaid: reserva.reservaid,
              nombrereserva: reserva.nombrereserva,
              fechareserva: fechaReserva.toISOString(),
              nombreEspacio,
              primerBloque: {
                horainicio: primerBloque.horainicio,
                horafin: primerBloque.horafin
              },
              estado
            };
          }
        }

        reservasConEstado.push({
          reservaid: reserva.reservaid,
          nombrereserva: reserva.nombrereserva,
          fechareserva: fechaReserva.toISOString(),
          nombreEspacio,
          primerBloque: {
            horainicio: primerBloque.horainicio,
            horafin: primerBloque.horafin
          },
          estado
        });
      }

      this.reservasActivas.set(contadorActivas);
      this.reservasFinalizadas.set(contadorFinalizadas);
      this.reservasRecientes.set(reservasConEstado.slice(0, 5));

      if (proximaReserva) {
        const fecha = new Date(proximaReserva.fechareserva);
        const hoy = new Date();
        const esHoy = fecha.toDateString() === hoy.toDateString();
        
        const hora = proximaReserva.primerBloque?.horainicio.substring(0, 5) || '--:--';
        
        if (esHoy) {
          this.proximaReservaTexto.set(`Hoy, ${hora}`);
        } else {
          const dia = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
          this.proximaReservaTexto.set(`${dia}, ${hora}`);
        }
      } else {
        this.proximaReservaTexto.set('Sin reservas');
      }

    } catch (err: any) {
      console.error('Error al cargar datos:', err);
    } finally {
      this.cargando.set(false);
    }
  }

  irACatalogo() {
    this.router.navigate(['/user-dashboard/catalogo-espacios']);
  }

  irAMisReservas() {
    this.router.navigate(['/user-dashboard/sistema-reservas']);
  }

  formatearFechaHora(reserva: ReservaResumen): string {
    const fecha = new Date(reserva.fechareserva);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);

    const hora = reserva.primerBloque?.horainicio?.substring(0, 5) || '--:--';

    if (fecha.toDateString() === hoy.toDateString()) {
      return `Hoy, ${hora}`;
    } else if (fecha.toDateString() === ayer.toDateString()) {
      return `Ayer, ${hora}`;
    } else {
      return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) + `, ${hora}`;
    }
  }

  getEstadoTexto(estado: string): string {
    const estados: Record<string, string> = {
      'activa': 'Activa',
      'finalizada': 'Finalizada',
      'proxima': 'Próxima'
    };
    return estados[estado] || estado;
  }

  getBadgeClase(estado: string): string {
    const clases: Record<string, string> = {
      'activa': 'text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full',
      'finalizada': 'text-xs text-gray-600 font-medium bg-gray-200 px-2 py-1 rounded-full',
      'proxima': 'text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full'
    };
    return clases[estado] || clases['proxima'];
  }

  getColorClase(estado: string): string {
    const clases: Record<string, string> = {
      'activa': 'w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600',
      'finalizada': 'w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600',
      'proxima': 'w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600'
    };
    return clases[estado] || clases['proxima'];
  }
}

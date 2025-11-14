import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-100 flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-red-700 text-white flex flex-col">
        <!-- Logo -->
        <div class="p-6 border-b border-red-600">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <div>
              <h2 class="font-bold text-lg">SpaceBook</h2>
              <p class="text-xs text-red-200">Admin Panel</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4 space-y-2">
          <a
            routerLink="/admin-dashboard"
            routerLinkActive="bg-red-600"
            [routerLinkActiveOptions]="{exact: true}"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span class="font-medium">Dashboard</span>
          </a>

          <a
            routerLink="/admin-dashboard/calendario"
            routerLinkActive="bg-red-600"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span class="font-medium">Calendario</span>
          </a>

          <a
            routerLink="/admin-dashboard/administrar-espacios"
            routerLinkActive="bg-red-600"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <span class="font-medium">Administrar Espacios</span>
          </a>

          <a
            routerLink="/admin-dashboard/visualizacion-disponibilidad"
            routerLinkActive="bg-red-600"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span class="font-medium">Disponibilidad</span>
          </a>
        </nav>

        <!-- User Info -->
        <div class="p-4 border-t border-red-600">
          @if (userProfile()) {
            <div class="flex items-center space-x-3 mb-3">
              <div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <span class="text-sm font-bold">{{ userProfile()?.nombre?.charAt(0) }}{{ userProfile()?.apellido?.charAt(0) }}</span>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium">{{ userProfile()?.nombre }} {{ userProfile()?.apellido }}</p>
                <p class="text-xs text-red-200">Administrador</p>
              </div>
            </div>
          }
          <button
            (click)="logout()"
            class="w-full px-4 py-2 bg-red-800 hover:bg-red-900 rounded-lg transition-colors text-sm font-medium flex items-center justify-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col">
        <!-- Top Header -->
        <header class="bg-white shadow-sm">
          <div class="px-8 py-4">
            <h1 class="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            <p class="text-sm text-gray-500">Sistema de Gestión de Estacionamiento</p>
          </div>
        </header>

      <!-- Main Content Area -->
      <main class="flex-1 p-8 bg-gray-50 overflow-y-auto">
        <router-outlet />
      </main>
      </div>
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);

  userProfile = this.auth.profile;

  ngOnInit() {
    // Verificar si es admin, si no redirigir
    if (!this.auth.isAdmin()) {
      console.warn('Acceso denegado: No es administrador');
      this.router.navigate(['/user-dashboard']);
    }
  }

  async logout() {
    try {
      await this.auth.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}

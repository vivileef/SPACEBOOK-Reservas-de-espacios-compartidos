import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Mobile Menu Button -->
      <button 
        (click)="toggleSidebar()"
        class="lg:hidden fixed top-4 left-4 z-50 p-2 bg-red-700 text-white rounded-lg shadow-lg">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <!-- Overlay for mobile -->
      @if (sidebarOpen()) {
        <div 
          (click)="toggleSidebar()"
          class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30">
        </div>
      }

      <!-- Sidebar -->
      <aside [class]="'bg-red-700 text-white flex flex-col fixed left-0 top-0 h-screen z-40 transition-transform duration-300 ' + 
        'w-64 ' +
        (sidebarOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')">
        <!-- Logo -->
        <div class="p-6 border-b border-red-600 flex-shrink-0">
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

        <!-- Navigation - Scrollable -->
        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
          <a
            routerLink="/admin-dashboard"
            routerLinkActive="bg-red-600"
            [routerLinkActiveOptions]="{exact: true}"
            (click)="closeSidebarOnMobile()"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors cursor-pointer">
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span class="font-medium">Dashboard</span>
          </a>

          <a
            routerLink="/admin-dashboard/calendario"
            routerLinkActive="bg-red-600"
            (click)="closeSidebarOnMobile()"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors cursor-pointer">
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span class="font-medium">Calendario</span>
          </a>

          <a
            routerLink="/admin-dashboard/administrar-espacios"
            routerLinkActive="bg-red-600"
            (click)="closeSidebarOnMobile()"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors cursor-pointer">
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <span class="font-medium">Administrar Espacios</span>
          </a>

          <a
            routerLink="/admin-dashboard/visualizacion-disponibilidad"
            routerLinkActive="bg-red-600"
            (click)="closeSidebarOnMobile()"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors cursor-pointer">
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span class="font-medium">Disponibilidad</span>
          </a>

          <a
            routerLink="/admin-dashboard/incidencias"
            routerLinkActive="bg-red-600"
            (click)="closeSidebarOnMobile()"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors cursor-pointer">
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <span class="font-medium">Incidencias</span>
          </a>

          <a
            routerLink="/admin-dashboard/reservas"
            routerLinkActive="bg-red-600"
            (click)="closeSidebarOnMobile()"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors cursor-pointer">
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
            <span class="font-medium">Ver Reservas</span>
          </a>
        </nav>

        <!-- User Info -->
        <div class="p-4 border-t border-red-600">
          @if (userProfile()) {
            <div class="flex items-center space-x-3 mb-3">
              <div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <span class="text-sm font-bold">{{ getInitials() }}</span>
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
      <div class="flex-1 flex flex-col lg:ml-64">
        <!-- Top Header -->
        <header class="bg-white shadow-sm">
          <div class="px-4 sm:px-6 lg:px-8 py-4">
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900 ml-12 lg:ml-0">Panel de Administración</h1>
            <p class="text-xs sm:text-sm text-gray-500 ml-12 lg:ml-0">Sistema de Gestión de Estacionamiento</p>
          </div>
        </header>

        <!-- Main Content Area -->
        <main class="flex-1 overflow-y-auto bg-gray-50">
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
  cargando = signal(false);
  sidebarOpen = signal(false);

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebarOnMobile() {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      this.sidebarOpen.set(false);
    }
  }

  async ngOnInit() {
    console.log('AdminDashboard: Iniciando, perfil actual:', this.auth.profile());
    
    // Verificar y cargar perfil si es necesario
    await this.verificarPerfil();
    
    // Verificar que sea admin
    if (!this.auth.isAdmin()) {
      console.warn('AdminDashboard: No es administrador');
      this.router.navigate(['/user-dashboard']);
    }
  }

  async verificarPerfil() {
    // Si ya hay perfil con nombre, no hacer nada
    if (this.auth.profile()?.nombre) {
      console.log('AdminDashboard: Perfil ya disponible');
      return;
    }

    // Intentar cargar el perfil
    try {
      const session = await this.auth.getSession();
      if (session?.user?.email) {
        const email = session.user.email;
        console.log('AdminDashboard: Cargando perfil para email:', email);
        
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
            console.log('AdminDashboard: Perfil cargado:', this.auth.profile());
          }
        }
      }
    } catch (error) {
      console.error('AdminDashboard: Error cargando perfil:', error);
    }
  }

  getInitials(): string {
    const profile = this.userProfile();
    if (!profile) return '';
    const nombre = profile.nombre?.charAt(0) || '';
    const apellido = profile.apellido?.charAt(0) || '';
    return `${nombre}${apellido}`.toUpperCase();
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

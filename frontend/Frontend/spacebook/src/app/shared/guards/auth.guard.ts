import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  try {
    // Verificar si hay sesión activa
    const session = await auth.getSession();
    
    if (!session) {
      console.warn('No hay sesión activa, redirigiendo a login');
      router.navigate(['/login']);
      return false;
    }

    // Si no hay perfil cargado, intentar cargarlo
    if (!auth.profile()) {
      const userId = session.user?.id;
      const email = session.user?.email;
      
      if (!userId || !email) {
        console.warn('Sesión sin usuario válido');
        router.navigate(['/login']);
        return false;
      }

      // Cargar perfil de usuario regular
      const profileRes = await auth.getProfile(userId);
      if ((profileRes as any).data) {
        auth.profile.set({
          ...(profileRes as any).data,
          isAdmin: false
        });
      } else {
        console.warn('No se encontró perfil de usuario');
        router.navigate(['/login']);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error en authGuard:', error);
    router.navigate(['/login']);
    return false;
  }
};

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth } from '../services/auth.service';

export const adminGuard: CanActivateFn = async (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  try {
    // Verificar si hay sesión activa
    const session = await auth.getSession();
    
    if (!session) {
      console.warn('AdminGuard: No hay sesión activa, redirigiendo a login');
      router.navigate(['/login']);
      return false;
    }

    const email = session.user?.email;
    console.log('AdminGuard: Email de sesión:', email);

    if (!email || !auth.isAdminEmail(email)) {
      console.warn('AdminGuard: Usuario no es administrador, redirigiendo a user dashboard');
      router.navigate(['/user-dashboard']);
      return false;
    }

    // Si no hay perfil cargado, intentar cargarlo
    if (!auth.profile()) {
      console.log('AdminGuard: Cargando perfil de administrador...');
      const adminProfile = await auth.getAdminProfile(email);
      
      console.log('AdminGuard: Respuesta de getAdminProfile:', adminProfile);
      
      if ((adminProfile as any).data) {
        const adminData = (adminProfile as any).data;
        console.log('AdminGuard: Datos del admin:', adminData);
        
        auth.profile.set({
          usuarioid: adminData.adminid,
          nombre: adminData.nombre,
          apellido: adminData.apellido,
          correo: adminData.correo,
          cedula: adminData.cedula,
          telefono: adminData.telefono,
          isAdmin: true
        });
        
        console.log('AdminGuard: Perfil establecido:', auth.profile());
      } else {
        console.error('AdminGuard: No se encontró perfil de administrador en la BD. Respuesta completa:', adminProfile);
        // En lugar de redirigir, intentar con datos básicos del usuario de Supabase Auth
        const user = session.user;
        auth.profile.set({
          usuarioid: user.id,
          nombre: user.user_metadata?.['nombre'] || user.email?.split('@')[0] || 'Admin',
          apellido: user.user_metadata?.['apellido'] || '',
          correo: user.email || email,
          cedula: 0,
          telefono: 0,
          isAdmin: true
        });
        console.log('AdminGuard: Usando perfil básico de Auth:', auth.profile());
      }
    } else {
      console.log('AdminGuard: Perfil ya cargado:', auth.profile());
    }

    return true;
  } catch (error) {
    console.error('Error en adminGuard:', error);
    router.navigate(['/login']);
    return false;
  }
};

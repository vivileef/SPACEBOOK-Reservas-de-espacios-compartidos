import { Injectable, signal, WritableSignal } from '@angular/core';
import { SupabaseClient,createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

// Tipo para el perfil que almacenamos en la tabla `usuario`
export interface UserProfile {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private s_client: SupabaseClient;
  // Señal pública que contiene el perfil del usuario autenticado (o null)
  public currentUser: WritableSignal<UserProfile | null>;

  
  constructor() { 
  this.s_client = createClient(environment.apiUrl,environment.apiKey);
  this.currentUser = signal<UserProfile | null>(null);
  }
  // Definición del tipo de perfil que usamos en la tabla `usuario`
  // (export no necesario dentro del servicio, pero lo definimos para tipado interno)
  //regiter
  // Contract for a user profile stored in the `usuario` table

  /**
   * Registra en Auth y crea/actualiza el perfil en la tabla `usuario`.
   * profile puede contener atributos adicionales como name, role, etc.
   */
  async signUp(email: string, password: string, profile?: { name?: string; role?: string }) {
    const { data, error } = await this.s_client.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { data, error };
    }

    // En v2, el usuario queda en data.user
    const user = (data as any)?.user;

    if (user) {
      // Intentamos insertar el perfil en la tabla `usuario` usando el id del usuario de Auth.
      // Si la fila ya existe, usamos upsert para actualizar.
      try {
        const profileRow: any = {
          id: user.id,
          email: user.email,
          name: profile?.name ?? null,
          role: profile?.role ?? 'user',
        };

        const insert = await this.s_client
          .from('usuario')
          .upsert(profileRow, { onConflict: 'id' });

        // devolver tanto la respuesta de auth como la del insert para transparencia
        return { data, profileInsert: insert, error: null };
      } catch (e: any) {
        // Si el insert falla, devolvemos el error pero dejamos el usuario creado en Auth.
        return { data, error: e };
      }
    }

    return { data, error: null };
  }

  async signIn(email: string, password: string) {
    // Inicia sesión y devuelve la sesión/usuario. Además intenta cargar el perfil desde la tabla `usuario`
    const res = await this.s_client.auth.signInWithPassword({
      email,
      password,
    });

    if (res.error) {
      return res;
    }

    // Extraer user id (según la versión de supabase-js)
    const userId = (res as any)?.data?.user?.id ?? (res as any)?.data?.session?.user?.id;

    if (userId) {
      const profileRes = await this.getProfile(userId);
      if (!(profileRes as any).error) {
  // Guardar el perfil en la señal para consumo por la app
  this.currentUser.set((profileRes as any).data as UserProfile);
      } else {
        // Si no existe perfil en la tabla, establecer info mínima basada en auth
        const authUser = (res as any)?.data?.user ?? (res as any)?.data?.session?.user;
  this.currentUser.set({ id: userId, email: authUser?.email ?? null, name: null, role: 'user' });
      }
    }

    return res;
  }

  async signOut() {
    await this.s_client.auth.signOut();
  this.currentUser.set(null);
  }

  // Obtiene el perfil desde la tabla `usuario` por id
  async getProfile(userId: string) {
    return this.s_client.from('usuario').select('*').eq('id', userId).single();
  }

  // Actualiza el perfil en la tabla `usuario`
  async updateProfile(userId: string, attrs: Partial<{ name: string; role: string; email: string }>) {
    return this.s_client.from('usuario').update(attrs).eq('id', userId);
  }
}

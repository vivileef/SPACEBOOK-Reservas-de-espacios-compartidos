import { Injectable, signal, WritableSignal } from '@angular/core';
import { createClient, SupabaseClient, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

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
  private supabase: SupabaseClient;
  // Señal con la sesión actual (null si no hay sesión)
  public session: WritableSignal<Session | null>;
  // Señal con el perfil del usuario autenticado (null si no existe)
  public profile: WritableSignal<UserProfile | null>;

  constructor() {
    this.supabase = createClient(environment.apiUrl, environment.apiKey);
    this.session = signal<Session | null>(null);
    this.profile = signal<UserProfile | null>(null);
  }

  // Registrar usuario
  async signUp(email: string, password: string, profile?: { name?: string; role?: string }) {
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) throw error;

    // si se creó el usuario en Auth, intentamos crear/upsert el perfil en la tabla `usuario`
    const userId = (data as any)?.user?.id ?? (data as any)?.user?.id;
    if (userId) {
      const profileRow: any = {
        id: userId,
        email,
        name: profile?.name ?? null,
        role: profile?.role ?? 'user',
      };

      // upsert el perfil (crea o actualiza)
      const res = await this.supabase.from('usuario').upsert(profileRow, { onConflict: 'id' });
      if ((res as any).error) {
        // no hacemos rollback del auth user, pero informamos del error
        throw (res as any).error;
      }
      // actualizar señal local
      this.profile.set(profileRow as UserProfile);
    }

    return data;
  }

  // Iniciar sesión
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Guardar sesión en la señal
    this.session.set((data as any)?.session ?? null);

    // cargar perfil desde tabla `usuario` si existe
    const userId = (data as any)?.user?.id ?? (data as any)?.session?.user?.id;
    if (userId) {
      const profileRes = await this.getProfile(userId);
      if (!(profileRes as any).error) {
        this.profile.set((profileRes as any).data as UserProfile);
      } else {
        // si no hay perfil, limpiar
        this.profile.set(null);
      }
    }
    return data;
  }

  // Cerrar sesión
  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
    this.session.set(null);
  }

  // Obtener sesión actual
  async getSession(): Promise<Session | null> {
    const { data } = await this.supabase.auth.getSession();
    const s = (data as any).session ?? null;
    this.session.set(s);
    return s;
  }

  // Escuchar cambios de sesión (login/logout)
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      // Actualizar señal local
      this.session.set(session as Session | null);
      // si hay sesión, intentar cargar perfil
      const userId = (session as any)?.user?.id ?? null;
      if (userId) {
        this.getProfile(userId).then((r) => {
          if (!(r as any).error) this.profile.set((r as any).data as UserProfile);
        }).catch(() => this.profile.set(null));
      } else {
        this.profile.set(null);
      }
      callback(event, session as Session | null);
    });
  }

  // Opcional: obtener access token actual
  getAccessToken(): string | null {
    return this.session()?.access_token ?? null;
  }

  // Obtener perfil desde la tabla `usuario`
  async getProfile(userId: string) {
    return this.supabase.from('usuario').select('*').eq('id', userId).single();
  }

  // Actualizar perfil
  async updateProfile(userId: string, attrs: Partial<UserProfile>) {
    return this.supabase.from('usuario').update(attrs).eq('id', userId);
  }
}

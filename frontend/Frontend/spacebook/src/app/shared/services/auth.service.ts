import { Injectable, signal, WritableSignal, inject } from '@angular/core';
import { SupabaseClient, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

export interface UserProfile {
  usuarioid: string;
  nombre: string;
  apellido: string;
  correo: string;
  cedula: number;
  telefono: number;
  fechacreacion?: string;
  isAdmin?: boolean;
}

export interface AdminProfile {
  adminid: string;
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  cedula: number;
  telefono: number;
}

export class Auth {
  private supabase: SupabaseClient;
  // Señal con la sesión actual (null si no hay sesión)
  public session: WritableSignal<Session | null>;
  // Señal con el perfil del usuario autenticado (null si no existe)
  public profile: WritableSignal<UserProfile | null>;
  // Correos de administradores
  private readonly ADMIN_EMAILS = [
    'stalin2005tumbaco@gmail.com',
    'giorno2005@outlook.es'
  ];

  constructor() {
    // Usar la instancia compartida de Supabase
    const supabaseService = inject(SupabaseService);
    this.supabase = supabaseService.getClient();

    this.session = signal<Session | null>(null);
    this.profile = signal<UserProfile | null>(null);

    // Inicializar sesión desde el cliente (si existe)
    this.getSession().catch(() => {});
  }

  private clearSupabaseStorage() {
    try {
      // Limpiar localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      // Limpiar sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  // Registrar usuario
  async signUp(
    email: string, 
    password: string, 
    userData: { 
      nombre: string; 
      apellido: string; 
      cedula: number; 
      telefono: number; 
    }
  ) {
    // 1. Crear usuario en Supabase Auth
    const { data, error } = await this.supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          nombre: userData.nombre,
          apellido: userData.apellido
        }
      }
    });
    
    if (error) throw error;

    // 2. Insertar en la tabla usuarios
    const userId = data?.user?.id;
    if (userId) {
      const usuarioData = {
        usuarioid: userId,
        nombre: userData.nombre,
        apellido: userData.apellido,
        correo: email,
        cedula: userData.cedula,
        telefono: userData.telefono,
        contrasena: '', // No guardamos la contraseña en texto plano
        fechacreacion: new Date().toISOString()
      };

      // Insertar en la tabla usuarios
      const { error: insertError } = await this.supabase
        .from('usuarios')
        .insert([usuarioData]);

      if (insertError) {
        console.error('Error al insertar en tabla usuarios:', insertError);
        throw insertError;
      }

      // Actualizar señal local con el perfil
      this.profile.set({
        usuarioid: userId,
        nombre: userData.nombre,
        apellido: userData.apellido,
        correo: email,
        cedula: userData.cedula,
        telefono: userData.telefono,
        fechacreacion: usuarioData.fechacreacion
      });
    }

    return data;
  }

  // Iniciar sesión
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Guardar sesión en la señal
    this.session.set(data?.session ?? null);

    // Verificar si es administrador
    const isAdmin = this.isAdminEmail(email);

    // Cargar perfil desde la tabla correspondiente
    const userId = data?.user?.id ?? data?.session?.user?.id;
    if (userId) {
      if (isAdmin) {
        // Buscar en tabla administrador
        const adminRes = await this.getAdminProfile(email);
        if (!(adminRes as any).error && (adminRes as any).data) {
          const adminData = (adminRes as any).data as AdminProfile;
          // Convertir a UserProfile con flag de admin
          this.profile.set({
            usuarioid: adminData.adminid,
            nombre: adminData.nombre,
            apellido: adminData.apellido,
            correo: adminData.correo,
            cedula: adminData.cedula,
            telefono: adminData.telefono,
            isAdmin: true
          });
        }
      } else {
        // Buscar en tabla usuarios
        const profileRes = await this.getProfile(userId);
        if (!(profileRes as any).error && (profileRes as any).data) {
          const userData = (profileRes as any).data as UserProfile;
          this.profile.set({
            ...userData,
            isAdmin: false
          });
        } else {
          console.warn('Usuario sin registro en tabla usuarios');
          this.profile.set(null);
        }
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
      
      // Si hay sesión, intentar cargar perfil desde tabla usuarios
      const userId = session?.user?.id ?? null;
      if (userId) {
        this.getProfile(userId).then((r) => {
          if (!(r as any).error && (r as any).data) {
            this.profile.set((r as any).data as UserProfile);
          } else {
            this.profile.set(null);
          }
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

  // Obtener perfil desde la tabla `usuarios`
  async getProfile(userId: string) {
    return this.supabase.from('usuarios').select('*').eq('usuarioid', userId).single();
  }

  // Obtener perfil de administrador
  async getAdminProfile(email: string) {
    return this.supabase.from('administrador').select('*').eq('correo', email).single();
  }

  // Verificar si un correo es de administrador
  isAdminEmail(email: string): boolean {
    return this.ADMIN_EMAILS.includes(email.toLowerCase());
  }

  // Verificar si el usuario actual es admin
  isAdmin(): boolean {
    return this.profile()?.isAdmin ?? false;
  }

  // Actualizar perfil
  async updateProfile(userId: string, attrs: Partial<UserProfile>) {
    return this.supabase.from('usuarios').update(attrs).eq('usuarioid', userId);
  }
}

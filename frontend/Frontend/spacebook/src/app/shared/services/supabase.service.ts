import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * Servicio singleton para compartir una única instancia de Supabase Client
 * Esto evita problemas con múltiples instancias y sesiones desincronizadas
 */
@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private static instance: SupabaseClient;

  constructor() {
    if (!SupabaseService.instance) {
      SupabaseService.instance = createClient(environment.apiUrl, environment.apiKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'spacebook-auth'
        }
      });
    }
  }

  /**
   * Obtener la instancia única de Supabase Client
   */
  getClient(): SupabaseClient {
    return SupabaseService.instance;
  }
}

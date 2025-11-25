import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Notificacion, CreateNotificacionDTO, UpdateNotificacionDTO } from '../../models/interfaces';
import { SupabaseService } from '../supabase.service';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseService = inject(SupabaseService);
    this.supabase = supabaseService.getClient();
  }

  async getNotificaciones(usuarioId?: string): Promise<Notificacion[]> {
    let query = this.supabase.from('notificacion').select('*');
    
    if (usuarioId) {
      query = query.eq('usuarioid', usuarioId);
    }
    
    query = query.order('fechanotificacion', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getNotificacion(id: string): Promise<Notificacion | null> {
    const { data, error } = await this.supabase
      .from('notificacion')
      .select('*')
      .eq('notificacionid', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createNotificacion(notificacion: CreateNotificacionDTO): Promise<Notificacion> {
    const { data, error } = await this.supabase
      .from('notificacion')
      .insert([notificacion])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateNotificacion(notificacion: UpdateNotificacionDTO): Promise<Notificacion> {
    const { notificacionid, ...updates } = notificacion;
    
    const { data, error } = await this.supabase
      .from('notificacion')
      .update(updates)
      .eq('notificacionid', notificacionid)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteNotificacion(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('notificacion')
      .delete()
      .eq('notificacionid', id);

    if (error) throw error;
  }

  async marcarNotificacionesComoLeidas(usuarioId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notificacion')
      .update({ leida: true })
      .eq('usuarioid', usuarioId);

    if (error) throw error;
  }
}

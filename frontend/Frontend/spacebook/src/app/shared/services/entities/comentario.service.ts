import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Comentario, CreateComentarioDTO, UpdateComentarioDTO } from '../../models/interfaces';
import { SupabaseService } from '../supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ComentarioService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseService = inject(SupabaseService);
    this.supabase = supabaseService.getClient();
  }

  async getComentarios(reservaId?: string): Promise<Comentario[]> {
    let query = this.supabase.from('comentario').select('*');
    
    if (reservaId) {
      query = query.eq('reservaid', reservaId);
    }
    
    query = query.order('fecha', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getComentario(id: string): Promise<Comentario | null> {
    const { data, error } = await this.supabase
      .from('comentario')
      .select('*')
      .eq('comentarioid', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createComentario(comentario: CreateComentarioDTO): Promise<Comentario> {
    const { data, error } = await this.supabase
      .from('comentario')
      .insert([comentario])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateComentario(comentario: UpdateComentarioDTO): Promise<Comentario> {
    const { comentarioid, ...updates } = comentario;
    
    const { data, error } = await this.supabase
      .from('comentario')
      .update(updates)
      .eq('comentarioid', comentarioid)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteComentario(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('comentario')
      .delete()
      .eq('comentarioid', id);

    if (error) throw error;
  }
}

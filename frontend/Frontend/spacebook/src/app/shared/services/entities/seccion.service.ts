import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Seccion, CreateSeccionDTO, UpdateSeccionDTO } from '../../models/interfaces';
import { SupabaseService } from '../supabase.service';

@Injectable({
  providedIn: 'root'
})
export class SeccionService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseService = inject(SupabaseService);
    this.supabase = supabaseService.getClient();
  }

  async getSecciones(institucionId?: string): Promise<Seccion[]> {
    let query = this.supabase.from('seccion').select('*');
    
    if (institucionId) {
      query = query.eq('institucionid', institucionId);
    }
    
    query = query.order('nombre', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getSeccion(id: string): Promise<Seccion | null> {
    const { data, error } = await this.supabase
      .from('seccion')
      .select('*')
      .eq('seccionid', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createSeccion(seccion: CreateSeccionDTO): Promise<Seccion> {
    const { data, error } = await this.supabase
      .from('seccion')
      .insert([seccion])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSeccion(seccion: UpdateSeccionDTO): Promise<Seccion> {
    const { seccionid, ...updates } = seccion;
    
    const { data, error } = await this.supabase
      .from('seccion')
      .update(updates)
      .eq('seccionid', seccionid)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSeccion(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('seccion')
      .delete()
      .eq('seccionid', id);

    if (error) throw error;
  }
}

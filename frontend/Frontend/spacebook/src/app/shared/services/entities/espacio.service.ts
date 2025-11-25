import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Espacio, CreateEspacioDTO, UpdateEspacioDTO } from '../../models/interfaces';
import { SupabaseService } from '../supabase.service';

@Injectable({
  providedIn: 'root'
})
export class EspacioService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseService = inject(SupabaseService);
    this.supabase = supabaseService.getClient();
  }

  async getEspacios(seccionId?: string): Promise<Espacio[]> {
    let query = this.supabase.from('espacio').select('*');
    
    if (seccionId) {
      query = query.eq('seccionid', seccionId);
    }
    
    query = query.order('nombre', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getEspacio(id: string): Promise<Espacio | null> {
    const { data, error } = await this.supabase
      .from('espacio')
      .select('*')
      .eq('espacioid', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createEspacio(espacio: CreateEspacioDTO): Promise<Espacio> {
    const { data, error } = await this.supabase
      .from('espacio')
      .insert([espacio])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEspacio(espacio: UpdateEspacioDTO): Promise<Espacio> {
    const { espacioid, ...updates } = espacio;
    
    const { data, error } = await this.supabase
      .from('espacio')
      .update(updates)
      .eq('espacioid', espacioid)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEspacio(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('espacio')
      .delete()
      .eq('espacioid', id);

    if (error) throw error;
  }
}

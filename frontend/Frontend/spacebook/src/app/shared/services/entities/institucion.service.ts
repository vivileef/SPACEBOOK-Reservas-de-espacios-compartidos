import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Institucion, CreateInstitucionDTO, UpdateInstitucionDTO } from '../../models/interfaces';
import { SupabaseService } from '../supabase.service';

@Injectable({
  providedIn: 'root'
})
export class InstitucionService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseService = inject(SupabaseService);
    this.supabase = supabaseService.getClient();
  }

  async getInstituciones(): Promise<Institucion[]> {
    const { data, error } = await this.supabase
      .from('institucion')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getInstitucion(id: string): Promise<Institucion | null> {
    const { data, error } = await this.supabase
      .from('institucion')
      .select('*')
      .eq('institucionid', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createInstitucion(institucion: CreateInstitucionDTO): Promise<Institucion> {
    const institucionData: any = {
      nombre: institucion.nombre,
      tipo: institucion.tipo,
      direccion: institucion.direccion,
      servicio: institucion.servicio,
      imagen_url: institucion.imagen_url || []
    };
    
    if (institucion.horarioid) {
      institucionData.horarioid = institucion.horarioid;
    }

    const { data, error } = await this.supabase
      .from('institucion')
      .insert([institucionData])
      .select()
      .single();

    if (error) {
      console.error('Error creating institucion:', error);
      throw error;
    }
    return data;
  }

  async updateInstitucion(institucion: UpdateInstitucionDTO): Promise<Institucion> {
    const { institucionid, ...updates } = institucion;
    
    const updateData: any = {
      nombre: updates.nombre,
      tipo: updates.tipo,
      direccion: updates.direccion,
      servicio: updates.servicio,
      imagen_url: updates.imagen_url !== undefined ? updates.imagen_url : undefined
    };
    
    if (updates.horarioid !== undefined) {
      updateData.horarioid = updates.horarioid;
    }
    
    const { data, error } = await this.supabase
      .from('institucion')
      .update(updateData)
      .eq('institucionid', institucionid)
      .select()
      .single();

    if (error) {
      console.error('Error updating institucion:', error);
      throw error;
    }
    return data;
  }

  async deleteInstitucion(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('institucion')
      .delete()
      .eq('institucionid', id);

    if (error) throw error;
  }
}

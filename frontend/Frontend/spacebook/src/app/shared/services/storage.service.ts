import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private supabase: SupabaseClient;
  private readonly bucketName = 'spacebook';

  constructor() {
    // Usar la instancia compartida de Supabase
    const supabaseService = inject(SupabaseService);
    this.supabase = supabaseService.getClient();
  }

  /**
   * Verificar que el usuario esté autenticado
   */
  private async verifyAuth(): Promise<void> {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    
    if (error || !session) {
      console.error('Usuario no autenticado:', error);
      throw new Error('Debes estar autenticado para realizar esta operación');
    }
    
    console.log('Usuario autenticado:', session.user.email);
  }

  /**
   * Subir un archivo a una carpeta específica del bucket
   * @param file - Archivo a subir
   * @param folder - Carpeta destino (ej: 'institucion', 'espacio')
   * @returns URL pública del archivo subido
   */
  async uploadFile(file: File, folder: string): Promise<string> {
    try {
      // Verificar autenticación antes de subir
      await this.verifyAuth();

      // Generar nombre único para evitar colisiones
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 9);
      const fileName = `${timestamp}_${randomStr}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      console.log('Intentando subir archivo:', filePath);

      // Subir el archivo
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error al subir archivo:', error);
        throw error;
      }

      // Obtener la URL pública
      const { data: publicUrlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      console.log('Archivo subido exitosamente:', publicUrlData.publicUrl);
      return publicUrlData.publicUrl;

    } catch (error: any) {
      console.error('Error en uploadFile:', error);
      throw new Error(`Error al subir archivo: ${error.message}`);
    }
  }

  /**
   * Eliminar un archivo del storage
   * @param imageUrl - URL completa de la imagen a eliminar
   */
  async deleteFile(imageUrl: string): Promise<void> {
    try {
      // Extraer la ruta del archivo desde la URL
      const filePath = this.extractFilePathFromUrl(imageUrl);
      
      if (!filePath) {
        console.warn('No se pudo extraer la ruta del archivo de la URL:', imageUrl);
        return;
      }

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Error al eliminar archivo:', error);
        throw error;
      }

      console.log('Archivo eliminado exitosamente:', filePath);
    } catch (error: any) {
      console.error('Error en deleteFile:', error);
      throw new Error(`Error al eliminar archivo: ${error.message}`);
    }
  }

  /**
   * Actualizar una imagen (elimina la anterior y sube la nueva)
   * @param oldImageUrl - URL de la imagen anterior (puede ser null)
   * @param newFile - Nuevo archivo a subir
   * @param folder - Carpeta destino
   * @returns URL pública del nuevo archivo
   */
  async updateFile(oldImageUrl: string | null, newFile: File, folder: string): Promise<string> {
    try {
      // Si existe una imagen anterior, eliminarla
      if (oldImageUrl) {
        await this.deleteFile(oldImageUrl);
      }

      // Subir la nueva imagen
      return await this.uploadFile(newFile, folder);
    } catch (error: any) {
      console.error('Error en updateFile:', error);
      throw new Error(`Error al actualizar archivo: ${error.message}`);
    }
  }

  /**
   * Obtener URL pública de un archivo
   * @param filePath - Ruta del archivo en el bucket (ej: 'institucion/123.jpg')
   */
  getPublicUrl(filePath: string): string {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Extraer la ruta del archivo desde una URL pública de Supabase
   * @param publicUrl - URL pública completa
   * @returns Ruta del archivo dentro del bucket
   */
  private extractFilePathFromUrl(publicUrl: string): string {
    try {
      // Ejemplo de URL: https://xxx.supabase.co/storage/v1/object/public/spacebook/institucion/12345.jpg
      // Necesitamos extraer: institucion/12345.jpg
      
      const bucketPrefix = `${this.bucketName}/`;
      const startIndex = publicUrl.indexOf(bucketPrefix);
      
      if (startIndex === -1) {
        console.error('URL no contiene el nombre del bucket esperado:', publicUrl);
        return '';
      }
      
      return publicUrl.substring(startIndex + bucketPrefix.length);
    } catch (error) {
      console.error('Error al extraer ruta del archivo:', error);
      return '';
    }
  }

  /**
   * Listar archivos en una carpeta
   * @param folder - Nombre de la carpeta
   */
  async listFiles(folder: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .list(folder);

      if (error) {
        console.error('Error al listar archivos:', error);
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error('Error en listFiles:', error);
      throw new Error(`Error al listar archivos: ${error.message}`);
    }
  }

  /**
   * Verificar si un archivo existe
   * @param filePath - Ruta del archivo
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .list(filePath);

      return !error && data !== null;
    } catch (error) {
      console.error('Error al verificar existencia del archivo:', error);
      return false;
    }
  }

  /**
   * Subir múltiples archivos
   * @param files - Array de archivos a subir
   * @param folder - Carpeta destino
   * @returns Array de URLs públicas
   */
  async uploadMultipleFiles(files: File[], folder: string): Promise<string[]> {
    const urls: string[] = [];
    
    for (const file of files) {
      try {
        const url = await this.uploadFile(file, folder);
        urls.push(url);
      } catch (error) {
        console.error(`Error subiendo archivo ${file.name}:`, error);
        // Continuar con los demás archivos
      }
    }
    
    return urls;
  }

  /**
   * Eliminar múltiples archivos
   * @param imageUrls - Array de URLs de imágenes a eliminar
   */
  async deleteMultipleFiles(imageUrls: string[]): Promise<void> {
    for (const url of imageUrls) {
      try {
        await this.deleteFile(url);
      } catch (error) {
        console.error(`Error eliminando archivo ${url}:`, error);
        // Continuar con los demás archivos
      }
    }
  }

  /**
   * Actualizar array de imágenes (elimina las antiguas y sube las nuevas)
   * @param oldImageUrls - Array de URLs antiguas (puede ser vacío o undefined)
   * @param newFiles - Archivos nuevos a subir
   * @param folder - Carpeta destino
   * @returns Array de URLs públicas de los nuevos archivos
   */
  async updateMultipleFiles(oldImageUrls: string[] | undefined, newFiles: File[], folder: string): Promise<string[]> {
    try {
      // Eliminar imágenes antiguas si existen
      if (oldImageUrls && oldImageUrls.length > 0) {
        await this.deleteMultipleFiles(oldImageUrls);
      }

      // Subir nuevas imágenes
      return await this.uploadMultipleFiles(newFiles, folder);
    } catch (error: any) {
      console.error('Error en updateMultipleFiles:', error);
      throw new Error(`Error al actualizar archivos: ${error.message}`);
    }
  }
}

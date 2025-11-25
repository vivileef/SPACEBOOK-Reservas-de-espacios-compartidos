// ==================== TABLA: seccion ====================
export interface Seccion {
  seccionid: string;
  institucionid?: string;
  nombre: string;
  tipo?: string;
  capacidad?: number;
  calificacion?: number;
  amenidades?: string;
  seccion_url?: string[]; // Array de URLs de imágenes en Storage
}

export interface CreateSeccionDTO {
  institucionid?: string;
  nombre: string;
  tipo?: string;
  capacidad?: number;
  calificacion?: number;
  amenidades?: string;
  seccion_url?: string[]; // Array de URLs de imágenes en Storage
}

export interface UpdateSeccionDTO extends Partial<CreateSeccionDTO> {
  seccionid: string;
  seccion_url?: string[]; // Array de URLs de imágenes en Storage
}

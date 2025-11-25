// ==================== TABLA: institucion ====================
export interface Institucion {
  institucionid: string;
  nombre: string;
  tipo?: string;
  direccion?: string;
  servicio?: string;
  horarioid?: string;
  imagen_url?: string[]; // Array de URLs de imágenes en Storage
}

export interface CreateInstitucionDTO {
  nombre: string;
  tipo?: string;
  direccion?: string;
  servicio?: string;
  horarioid?: string;
  imagen_url?: string[]; // Array de URLs de imágenes en Storage
}

export interface UpdateInstitucionDTO extends Partial<CreateInstitucionDTO> {
  institucionid: string;
}

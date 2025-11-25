// ==================== TABLA: comentario ====================
export interface Comentario {
  comentarioid: string;
  fecha: string;
  descripcion?: string;
  reservaid?: string;
  calificacion?: number;
}

export interface CreateComentarioDTO {
  fecha: string;
  descripcion?: string;
  reservaid?: string;
  calificacion?: number;
}

export interface UpdateComentarioDTO extends Partial<CreateComentarioDTO> {
  comentarioid: string;
}

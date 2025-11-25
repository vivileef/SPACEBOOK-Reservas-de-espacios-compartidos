// ==================== TABLA: espacio ====================
export interface Espacio {
  espacioid: string;
  nombre?: string;
  estado?: boolean;
  seccionid?: string;
  reservaid?: string;
}

export interface CreateEspacioDTO {
  nombre?: string;
  estado?: boolean;
  seccionid?: string;
  reservaid?: string;
}

export interface UpdateEspacioDTO extends Partial<CreateEspacioDTO> {
  espacioid: string;
}

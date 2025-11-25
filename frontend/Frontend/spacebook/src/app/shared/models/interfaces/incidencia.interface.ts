// ==================== TABLA: incidencia ====================
export interface Incidencia {
  incidenciaid: string;
  usuarioid: string;
  fechaIncidencia: string;
  tipo?: string;
  descripcion?: string;
}

export interface CreateIncidenciaDTO {
  usuarioid: string;
  fechaIncidencia: string;
  tipo?: string;
  descripcion?: string;
}

export interface UpdateIncidenciaDTO extends Partial<CreateIncidenciaDTO> {
  incidenciaid: string;
}

// ==================== TABLA: notificacion ====================
export interface Notificacion {
  notificacionid: string;
  fechanotificacion: string;
  descripcion?: string;
  usuarioid?: string;
}

export interface CreateNotificacionDTO {
  fechanotificacion: string;
  descripcion?: string;
  usuarioid?: string;
}

export interface UpdateNotificacionDTO extends Partial<CreateNotificacionDTO> {
  notificacionid: string;
}

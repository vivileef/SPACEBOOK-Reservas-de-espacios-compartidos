// ==================== TABLA: reserva ====================
export interface Reserva {
  reservaid: string;
  usuarioid?: string;
  nombrereserva?: string;
  descripcion?: string;
  fechareserva: string;
}

export interface CreateReservaDTO {
  usuarioid?: string;
  nombrereserva?: string;
  descripcion?: string;
  fechareserva: string;
}

export interface UpdateReservaDTO extends Partial<CreateReservaDTO> {
  reservaid: string;
}

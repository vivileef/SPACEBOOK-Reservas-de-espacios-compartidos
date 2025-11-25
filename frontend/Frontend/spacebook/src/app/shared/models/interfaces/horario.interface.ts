// ==================== TABLA: horario ====================
export interface Horario {
  horarioid: string;
  horainicio?: string;
  horafin?: string;
  semana?: string;
}

export interface CreateHorarioDTO {
  horainicio?: string;
  horafin?: string;
  semana?: string;
}

export interface UpdateHorarioDTO extends Partial<CreateHorarioDTO> {
  horarioid: string;
}

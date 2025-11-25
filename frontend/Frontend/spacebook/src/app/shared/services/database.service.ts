import { Injectable, inject } from '@angular/core';
import { InstitucionService } from './entities/institucion.service';
import { SeccionService } from './entities/seccion.service';
import { EspacioService } from './entities/espacio.service';
import { HorarioService } from './entities/horario.service';
import { ReservaService } from './entities/reserva.service';
import { ComentarioService } from './entities/comentario.service';
import { IncidenciaService } from './entities/incidencia.service';
import { NotificacionService } from './entities/notificacion.service';
import type {
  Institucion,
  Seccion,
  Espacio,
  Horario,
  Reserva,
  Comentario,
  Incidencia,
  Notificacion,
  CreateInstitucionDTO,
  UpdateInstitucionDTO,
  CreateSeccionDTO,
  UpdateSeccionDTO,
  CreateEspacioDTO,
  UpdateEspacioDTO,
  CreateHorarioDTO,
  UpdateHorarioDTO,
  CreateReservaDTO,
  UpdateReservaDTO,
  CreateComentarioDTO,
  UpdateComentarioDTO,
  CreateIncidenciaDTO,
  UpdateIncidenciaDTO,
  CreateNotificacionDTO,
  UpdateNotificacionDTO
} from '../models/database.models';

/**
 * DatabaseService - Facade service that delegates to entity-specific services
 * This service provides a unified interface for all database operations
 */
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private institucionService = inject(InstitucionService);
  private seccionService = inject(SeccionService);
  private espacioService = inject(EspacioService);
  private horarioService = inject(HorarioService);
  private reservaService = inject(ReservaService);
  private comentarioService = inject(ComentarioService);
  private incidenciaService = inject(IncidenciaService);
  private notificacionService = inject(NotificacionService);

  // ==================== INSTITUCIONES ====================
  
  getInstituciones(): Promise<Institucion[]> {
    return this.institucionService.getInstituciones();
  }

  getInstitucion(id: string): Promise<Institucion | null> {
    return this.institucionService.getInstitucion(id);
  }

  createInstitucion(institucion: CreateInstitucionDTO): Promise<Institucion> {
    return this.institucionService.createInstitucion(institucion);
  }

  updateInstitucion(institucion: UpdateInstitucionDTO): Promise<Institucion> {
    return this.institucionService.updateInstitucion(institucion);
  }

  deleteInstitucion(id: string): Promise<void> {
    return this.institucionService.deleteInstitucion(id);
  }

  // ==================== SECCIONES ====================
  
  getSecciones(institucionId?: string): Promise<Seccion[]> {
    return this.seccionService.getSecciones(institucionId);
  }

  getSeccion(id: string): Promise<Seccion | null> {
    return this.seccionService.getSeccion(id);
  }

  createSeccion(seccion: CreateSeccionDTO): Promise<Seccion> {
    return this.seccionService.createSeccion(seccion);
  }

  updateSeccion(seccion: UpdateSeccionDTO): Promise<Seccion> {
    return this.seccionService.updateSeccion(seccion);
  }

  deleteSeccion(id: string): Promise<void> {
    return this.seccionService.deleteSeccion(id);
  }

  // ==================== ESPACIOS ====================
  
  getEspacios(seccionId?: string): Promise<Espacio[]> {
    return this.espacioService.getEspacios(seccionId);
  }

  getEspacio(id: string): Promise<Espacio | null> {
    return this.espacioService.getEspacio(id);
  }

  createEspacio(espacio: CreateEspacioDTO): Promise<Espacio> {
    return this.espacioService.createEspacio(espacio);
  }

  updateEspacio(espacio: UpdateEspacioDTO): Promise<Espacio> {
    return this.espacioService.updateEspacio(espacio);
  }

  deleteEspacio(id: string): Promise<void> {
    return this.espacioService.deleteEspacio(id);
  }

  // ==================== HORARIOS ====================
  
  getHorarios(): Promise<Horario[]> {
    return this.horarioService.getHorarios();
  }

  getHorario(id: string): Promise<Horario | null> {
    return this.horarioService.getHorario(id);
  }

  createHorario(horario: CreateHorarioDTO): Promise<Horario> {
    return this.horarioService.createHorario(horario);
  }

  updateHorario(horario: UpdateHorarioDTO): Promise<Horario> {
    return this.horarioService.updateHorario(horario);
  }

  deleteHorario(id: string): Promise<void> {
    return this.horarioService.deleteHorario(id);
  }

  // ==================== RESERVAS ====================
  
  getReservas(usuarioId?: string): Promise<Reserva[]> {
    return this.reservaService.getReservas(usuarioId);
  }

  getReserva(id: string): Promise<Reserva | null> {
    return this.reservaService.getReserva(id);
  }

  createReserva(reserva: CreateReservaDTO): Promise<Reserva> {
    return this.reservaService.createReserva(reserva);
  }

  updateReserva(reserva: UpdateReservaDTO): Promise<Reserva> {
    return this.reservaService.updateReserva(reserva);
  }

  deleteReserva(id: string): Promise<void> {
    return this.reservaService.deleteReserva(id);
  }

  getReservasActivas(usuarioId: string): Promise<Reserva[]> {
    return this.reservaService.getReservasActivas(usuarioId);
  }

  // ==================== COMENTARIOS ====================
  
  getComentarios(reservaId?: string): Promise<Comentario[]> {
    return this.comentarioService.getComentarios(reservaId);
  }

  getComentario(id: string): Promise<Comentario | null> {
    return this.comentarioService.getComentario(id);
  }

  createComentario(comentario: CreateComentarioDTO): Promise<Comentario> {
    return this.comentarioService.createComentario(comentario);
  }

  updateComentario(comentario: UpdateComentarioDTO): Promise<Comentario> {
    return this.comentarioService.updateComentario(comentario);
  }

  deleteComentario(id: string): Promise<void> {
    return this.comentarioService.deleteComentario(id);
  }

  // ==================== INCIDENCIAS ====================
  
  getIncidencias(usuarioId?: string): Promise<Incidencia[]> {
    return this.incidenciaService.getIncidencias(usuarioId);
  }

  getIncidencia(id: string): Promise<Incidencia | null> {
    return this.incidenciaService.getIncidencia(id);
  }

  createIncidencia(incidencia: CreateIncidenciaDTO): Promise<Incidencia> {
    return this.incidenciaService.createIncidencia(incidencia);
  }

  updateIncidencia(incidencia: UpdateIncidenciaDTO): Promise<Incidencia> {
    return this.incidenciaService.updateIncidencia(incidencia);
  }

  deleteIncidencia(id: string): Promise<void> {
    return this.incidenciaService.deleteIncidencia(id);
  }

  // ==================== NOTIFICACIONES ====================
  
  getNotificaciones(usuarioId?: string): Promise<Notificacion[]> {
    return this.notificacionService.getNotificaciones(usuarioId);
  }

  getNotificacion(id: string): Promise<Notificacion | null> {
    return this.notificacionService.getNotificacion(id);
  }

  createNotificacion(notificacion: CreateNotificacionDTO): Promise<Notificacion> {
    return this.notificacionService.createNotificacion(notificacion);
  }

  updateNotificacion(notificacion: UpdateNotificacionDTO): Promise<Notificacion> {
    return this.notificacionService.updateNotificacion(notificacion);
  }

  deleteNotificacion(id: string): Promise<void> {
    return this.notificacionService.deleteNotificacion(id);
  }

  marcarNotificacionesComoLeidas(usuarioId: string): Promise<void> {
    return this.notificacionService.marcarNotificacionesComoLeidas(usuarioId);
  }
}

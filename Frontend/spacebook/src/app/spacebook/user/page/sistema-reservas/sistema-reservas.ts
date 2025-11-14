import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Seccion {
  id: string;
  nombre: string;
  tipo: string;
  capacidad: number;
  disponible: boolean;
}

interface Espacio {
  id: string;
  nombre: string;
  estado: boolean;
  seccionId: string;
}

@Component({
  selector: 'app-sistema-reservas',
  imports: [CommonModule, FormsModule],
  templateUrl: './sistema-reservas.html',
  styleUrl: './sistema-reservas.css',
})
export class SistemaReservas {
  // Institución seleccionada (estática para este ejemplo)
  institucion = {
    nombre: 'Universidad Técnica de Manabí',
    tipo: 'Educativa',
    direccion: 'Av. Urbina y Che Guevara, Portoviejo',
    servicio: 'Espacios de Estudio y Biblioteca'
  };

  // Secciones disponibles
  secciones: Seccion[] = [
    { id: '1', nombre: 'Biblioteca Central', tipo: 'Biblioteca', capacidad: 100, disponible: true },
    { id: '2', nombre: 'Sala de Lectura A', tipo: 'Sala de Lectura', capacidad: 30, disponible: true },
    { id: '3', nombre: 'Sala de Lectura B', tipo: 'Sala de Lectura', capacidad: 25, disponible: true },
    { id: '4', nombre: 'Laboratorio de Computación 1', tipo: 'Laboratorio', capacidad: 40, disponible: false },
    { id: '5', nombre: 'Sala de Estudio Grupal', tipo: 'Sala Grupal', capacidad: 15, disponible: true },
    { id: '6', nombre: 'Auditorio Principal', tipo: 'Auditorio', capacidad: 200, disponible: true }
  ];

  // Espacios por sección
  espaciosPorSeccion: { [key: string]: Espacio[] } = {
    '1': [
      { id: 'e1-1', nombre: 'Mesa 001', estado: true, seccionId: '1' },
      { id: 'e1-2', nombre: 'Mesa 002', estado: true, seccionId: '1' },
      { id: 'e1-3', nombre: 'Mesa 003', estado: false, seccionId: '1' },
      { id: 'e1-4', nombre: 'Mesa 004', estado: true, seccionId: '1' },
      { id: 'e1-5', nombre: 'Cubículo 001', estado: true, seccionId: '1' },
      { id: 'e1-6', nombre: 'Cubículo 002', estado: false, seccionId: '1' }
    ],
    '2': [
      { id: 'e2-1', nombre: 'Asiento A-01', estado: true, seccionId: '2' },
      { id: 'e2-2', nombre: 'Asiento A-02', estado: true, seccionId: '2' },
      { id: 'e2-3', nombre: 'Asiento A-03', estado: false, seccionId: '2' },
      { id: 'e2-4', nombre: 'Asiento A-04', estado: true, seccionId: '2' }
    ],
    '3': [
      { id: 'e3-1', nombre: 'Asiento B-01', estado: true, seccionId: '3' },
      { id: 'e3-2', nombre: 'Asiento B-02', estado: true, seccionId: '3' },
      { id: 'e3-3', nombre: 'Asiento B-03', estado: true, seccionId: '3' }
    ],
    '5': [
      { id: 'e5-1', nombre: 'Sala Grupal 1', estado: true, seccionId: '5' },
      { id: 'e5-2', nombre: 'Sala Grupal 2', estado: false, seccionId: '5' }
    ],
    '6': [
      { id: 'e6-1', nombre: 'Sección VIP', estado: true, seccionId: '6' },
      { id: 'e6-2', nombre: 'Sección General', estado: true, seccionId: '6' }
    ]
  };

  // Señales para el formulario
  seccionSeleccionada = signal<Seccion | null>(null);
  espacioSeleccionado = signal<Espacio | null>(null);
  fechaInicio = signal('');
  horaInicio = signal('');
  fechaFin = signal('');
  horaFin = signal('');
  proposito = signal('');
  
  // Estados
  mostrarEspacios = signal(false);
  procesandoReserva = signal(false);
  mostrarConfirmacion = signal(false);

  seleccionarSeccion(seccion: Seccion) {
    this.seccionSeleccionada.set(seccion);
    this.espacioSeleccionado.set(null);
    this.mostrarEspacios.set(true);
  }

  seleccionarEspacio(espacio: Espacio) {
    this.espacioSeleccionado.set(espacio);
  }

  getEspaciosDisponibles(): Espacio[] {
    const seccion = this.seccionSeleccionada();
    if (!seccion) return [];
    return this.espaciosPorSeccion[seccion.id] || [];
  }

  limpiarFormulario() {
    this.seccionSeleccionada.set(null);
    this.espacioSeleccionado.set(null);
    this.fechaInicio.set('');
    this.horaInicio.set('');
    this.fechaFin.set('');
    this.horaFin.set('');
    this.proposito.set('');
    this.mostrarEspacios.set(false);
  }

  confirmarReserva() {
    if (!this.seccionSeleccionada() || !this.espacioSeleccionado() || 
        !this.fechaInicio() || !this.horaInicio() || !this.fechaFin() || !this.horaFin()) {
      return;
    }

    this.procesandoReserva.set(true);
    
    // Simulación de llamada a API
    setTimeout(() => {
      this.procesandoReserva.set(false);
      this.mostrarConfirmacion.set(true);
      
      // Auto-cerrar confirmación después de 3 segundos
      setTimeout(() => {
        this.mostrarConfirmacion.set(false);
        this.limpiarFormulario();
      }, 3000);
    }, 1500);
  }

  cancelarReserva() {
    this.limpiarFormulario();
  }

  getSeccionsDisponibles(): Seccion[] {
    return this.secciones.filter(s => s.disponible);
  }
}

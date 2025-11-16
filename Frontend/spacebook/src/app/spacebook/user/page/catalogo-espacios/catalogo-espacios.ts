import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Espacio {
  id: string;
  nombre: string;
  descripcion: string;
  capacidad: number;
  imagen: string;
  disponible: boolean;
}

@Component({
  selector: 'app-catalogo-espacios',
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo-espacios.html',
  styleUrl: './catalogo-espacios.css',
})
export class CatalogoEspacios {
  filtro = '';

  modalOpen = false;
  modalEsp: Espacio | null = null;

  espacios: Espacio[] = [
    {
      id: 's1',
      nombre: 'Sala de Reuniones A',
      descripcion: 'Sala con proyector, 10 sillas y pizarra blanca.',
      capacidad: 10,
      imagen: '/assets/images/espacios/reunion-a.jpg',
      disponible: true,
    },
    {
      id: 's2',
      nombre: 'Auditorio Principal',
      descripcion: 'Auditorio para conferencias con capacidad amplia.',
      capacidad: 200,
      imagen: '/assets/images/espacios/auditorio.jpg',
      disponible: true,
    },
    {
      id: 's3',
      nombre: 'Sala de Estudio B',
      descripcion: 'Espacio silencioso para estudio individual y grupal.',
      capacidad: 30,
      imagen: '/assets/images/espacios/estudio-b.jpg',
      disponible: false,
    }
  ];

  verDetalle(esp: Espacio) {
    // abrir modal con detalle
    this.modalEsp = esp;
    this.modalOpen = true;
  }

  reservar(esp: Espacio) {
    // placeholder: iniciar flujo de reservas
    if (!esp.disponible) return;
    // Simulación: aquí invocarías el flujo de reservas
    alert(`Reservando ${esp.nombre}`);
    // cerrar modal después de reservar
    this.closeModal();
  }

  closeModal() {
    this.modalOpen = false;
    this.modalEsp = null;
  }

  filteredEspacios(): Espacio[] {
    const q = this.filtro?.trim().toLowerCase();
    if (!q) return this.espacios;
    return this.espacios.filter(e => e.nombre.toLowerCase().includes(q) || (e.descripcion || '').toLowerCase().includes(q));
  }
}

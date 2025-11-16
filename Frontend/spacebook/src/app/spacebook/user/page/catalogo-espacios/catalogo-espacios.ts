import { Component, OnInit } from '@angular/core';
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
export class CatalogoEspacios implements OnInit {
  filtro = '';
  filtroDebounced = '';
  private searchTimer: any = null;

  minCapacidad: number | null = null;
  onlyDisponibles = false;
  sortBy: 'relevance' | 'capacidad-desc' | 'capacidad-asc' = 'relevance';

  modalOpen = false;
  modalEsp: Espacio | null = null;

  loading = true;

  espacios: Espacio[] = [
    {
      id: 's1',
      nombre: 'Sala de Reuniones A',
      descripcion: 'Sala con proyector, 10 sillas y pizarra blanca.',
      capacidad: 10,
      imagen: '/assets/images/espacios/reunion-a.jpg.svg',
      disponible: true,
    },
    {
      id: 's2',
      nombre: 'Auditorio Principal',
      descripcion: 'Auditorio para conferencias con capacidad amplia.',
      capacidad: 200,
      imagen: '/assets/images/espacios/auditorio.jpg.svg',
      disponible: true,
    },
    {
      id: 's3',
      nombre: 'Sala de Estudio B',
      descripcion: 'Espacio silencioso para estudio individual y grupal.',
      capacidad: 30,
      imagen: '/assets/images/espacios/estudio-b.jpg.svg',
      disponible: false,
    }
  ];

  ngOnInit() {
    // Simular carga para mostrar skeletons; en producción esto vendría de la API
    setTimeout(() => {
      this.loading = false;
    }, 600);
  }

  onFiltroInput() {
    // debounce simple
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.filtroDebounced = this.filtro.trim().toLowerCase();
    }, 300);
  }

  verDetalle(esp: Espacio) {
    this.modalEsp = esp;
    this.modalOpen = true;
  }

  reservar(esp: Espacio) {
    if (!esp || !esp.disponible) return;
    // Aquí debe integrarse el flujo real de reservas. Por ahora simulamos.
    alert(`Reservando ${esp.nombre}`);
    this.closeModal();
  }

  closeModal() {
    this.modalOpen = false;
    this.modalEsp = null;
  }

  filteredEspacios(): Espacio[] {
    let list = [...this.espacios];

    // aplicar filtro de texto si existe (debounced)
    const q = this.filtroDebounced;
    if (q) {
      list = list.filter(e => e.nombre.toLowerCase().includes(q) || (e.descripcion || '').toLowerCase().includes(q));
    }

    // filtro por capacidad
    if (this.minCapacidad != null) {
      list = list.filter(e => e.capacidad >= (this.minCapacidad || 0));
    }

    // filter disponibilidad
    if (this.onlyDisponibles) {
      list = list.filter(e => e.disponible);
    }

    // ordenar
    if (this.sortBy === 'capacidad-desc') {
      list.sort((a, b) => b.capacidad - a.capacidad);
    } else if (this.sortBy === 'capacidad-asc') {
      list.sort((a, b) => a.capacidad - b.capacidad);
    }

    return list;
  }
}

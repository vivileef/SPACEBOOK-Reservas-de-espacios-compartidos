import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Auth } from './shared/services/auth.service';
import { SupabaseService } from './shared/services/supabase.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected title = 'spacebook';
  private auth = inject(Auth);
  private supabaseService = inject(SupabaseService);

  ngOnInit(): void {
    // Restaurar sesión si existe
    this.auth.getSession().then((s) => {
      // sesión ya almacenada en el servicio
      console.log('Restored session', s);
    }).catch((e) => console.warn('Error getting session', e));

    // Escuchar cambios de auth para reaccionar (login/logout)
    this.auth.onAuthStateChange((event, session) => {
      console.log('Auth event', event, session);
    });

    // Ejecutar limpieza automática de bloques vencidos
    this.liberarBloquesVencidosDiariamente();
  }

  private async liberarBloquesVencidosDiariamente() {
    const supabase = this.supabaseService.getClient();
    const ahora = new Date();

    try {
      // Obtener todos los bloques ocupados manualmente (sin reserva)
      const { data: bloquesOcupados, error } = await supabase
        .from('espaciohora')
        .select('espaciohoraid, horafin, espacioid')
        .eq('estado', false)
        .is('reservaid', null);

      if (error) throw error;
      if (!bloquesOcupados || bloquesOcupados.length === 0) return;

      const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}:00`;

      // Filtrar bloques cuya hora ya pasó hoy
      const bloquesALiberar = bloquesOcupados.filter(bloque => {
        return bloque.horafin < horaActual;
      });

      if (bloquesALiberar.length === 0) return;

      // Liberar bloques
      await Promise.all(
        bloquesALiberar.map(bloque =>
          supabase
            .from('espaciohora')
            .update({ estado: true })
            .eq('espaciohoraid', bloque.espaciohoraid)
        )
      );

      // Actualizar estados de espacios
      const espaciosAfectados = [...new Set(bloquesALiberar.map(b => b.espacioid))];
      for (const espacioid of espaciosAfectados) {
        const { data: todosLosBloques } = await supabase
          .from('espaciohora')
          .select('estado')
          .eq('espacioid', espacioid);

        if (todosLosBloques?.every(b => b.estado === true)) {
          await supabase
            .from('espacio')
            .update({ estado: true })
            .eq('espacioid', espacioid);
        }
      }

      console.log(`✅ Liberados ${bloquesALiberar.length} bloques vencidos`);
    } catch (err) {
      console.error('Error al liberar bloques:', err);
    }

    // Programar siguiente ejecución a las 00:01 del próximo día
    const proximaEjecucion = new Date();
    proximaEjecucion.setDate(proximaEjecucion.getDate() + 1);
    proximaEjecucion.setHours(0, 1, 0, 0); // 00:01:00

    const tiempoHastaProximaEjecucion = proximaEjecucion.getTime() - ahora.getTime();

    setTimeout(() => {
      this.liberarBloquesVencidosDiariamente();
    }, tiempoHastaProximaEjecucion);
  }
}

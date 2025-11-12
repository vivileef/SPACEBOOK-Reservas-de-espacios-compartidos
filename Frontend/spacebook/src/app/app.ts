import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Auth } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected title = 'spacebook';
  private auth = inject(Auth);

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
  }
}

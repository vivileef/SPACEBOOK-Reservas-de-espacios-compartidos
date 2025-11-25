import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './Login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);

  isSubmitting = signal(false);
  errorMessage = signal('');

  loginForm = new FormGroup({
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    password: new FormControl<string>('', [Validators.required, Validators.minLength(6)]),
  });

  async onSubmit() {
    if (this.isSubmitting() || this.loginForm.invalid) return;
    this.isSubmitting.set(true);
    this.errorMessage.set('');

    try {
        const res: any = await this.auth.signIn(this.loginForm.value.email!, this.loginForm.value.password!);
        if (res?.error) {
          // Mensaje genérico por seguridad - no revelar si existe el usuario
          this.errorMessage.set('Usuario o contraseña incorrectos');
      } else {
        // Inicio de sesión correcto; redirigir según el rol
        if (this.auth.isAdmin()) {
          console.log('Redirigiendo a admin dashboard');
          await this.router.navigate(['/admin-dashboard']);
        } else {
          console.log('Redirigiendo a user dashboard');
          await this.router.navigate(['/user-dashboard']);
        }
      }
    } catch (e: any) {
      this.errorMessage.set('Usuario o contraseña incorrectos');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

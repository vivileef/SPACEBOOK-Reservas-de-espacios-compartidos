import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Auth } from '../../../services/auth.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-component',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './registerComponent.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent { 
  authService = inject(Auth);
  router = inject(Router);
  
  // Señal para controlar el estado de envío y evitar clics múltiples
  isSubmitting = signal(false);
  errorMessage = signal('');
  
  registerForm = new FormGroup({
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    name: new FormControl<string>('', [Validators.required, Validators.minLength(2)]),
    password: new FormControl<string>('', [Validators.required, Validators.minLength(6)]),
  });
  
  async onSubmit() {
    // EVITAR CLICS MÚLTIPLES: Si ya está enviando, no hacer nada
    if (this.isSubmitting() || this.registerForm.invalid) {
      return;
    }
    
    // Marcar como "enviando" para deshabilitar el botón
    this.isSubmitting.set(true);
    this.errorMessage.set('');
    
    try {
      await this.authService.signUp(
        this.registerForm.value.email!,
        this.registerForm.value.password!,
        { name: this.registerForm.value.name! }
      );

      console.log('User registered successfully');
      // Esperar un poco antes de redirigir
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 500);
    } catch (error: any) {
      console.error('Error registering user:', error);
      this.errorMessage.set(error.message || 'Error al registrar usuario');
    } finally {
      // Volver a habilitar el botón después de 2 segundos
      setTimeout(() => {
        this.isSubmitting.set(false);
      }, 2000);
    }
  }
}

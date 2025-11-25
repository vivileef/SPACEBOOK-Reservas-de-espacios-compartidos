import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Auth } from '../../../services/auth.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-component',
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
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
    nombre: new FormControl<string>('', [Validators.required, Validators.minLength(2)]),
    apellido: new FormControl<string>('', [Validators.required, Validators.minLength(2)]),
    correo: new FormControl<string>('', [Validators.required, Validators.email]),
    cedula: new FormControl<number | null>(null, [Validators.required]),
    telefono: new FormControl<number | null>(null, [Validators.required]),
    contrasena: new FormControl<string>('', [Validators.required, Validators.minLength(6)]),
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
        this.registerForm.value.correo!,
        this.registerForm.value.contrasena!,
        {
          nombre: this.registerForm.value.nombre!,
          apellido: this.registerForm.value.apellido!,
          cedula: this.registerForm.value.cedula!,
          telefono: this.registerForm.value.telefono!
        }
      );

      console.log('Usuario registrado exitosamente');
      // Esperar un poco antes de redirigir
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 500);
    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      this.errorMessage.set(error.message || 'Error al registrar usuario');
    } finally {
      // Volver a habilitar el botón después de 2 segundos
      setTimeout(() => {
        this.isSubmitting.set(false);
      }, 2000);
    }
  }
}

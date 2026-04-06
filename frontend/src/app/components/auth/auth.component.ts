import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  isLogin = true;
  authForm: FormGroup;
  errorMsg = '';
  loading = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      // Register only
      identificacion: [''],
      nombre: [''],
      apellido: [''],
      rol: ['ESTUDIANTE']
    });
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.errorMsg = '';
    
    if (this.isLogin) {
      this.authForm.get('identificacion')?.clearValidators();
      this.authForm.get('nombre')?.clearValidators();
      this.authForm.get('apellido')?.clearValidators();
    } else {
      this.authForm.get('identificacion')?.setValidators(Validators.required);
      this.authForm.get('nombre')?.setValidators(Validators.required);
      this.authForm.get('apellido')?.setValidators(Validators.required);
    }
    
    this.authForm.get('identificacion')?.updateValueAndValidity();
    this.authForm.get('nombre')?.updateValueAndValidity();
    this.authForm.get('apellido')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.authForm.invalid) {
      this.errorMsg = 'Por favor revisa los campos en rojo.';
      this.authForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const val = this.authForm.value;

    if (this.isLogin) {
      this.authService.login(val.email, val.password).subscribe({
        next: (res) => {
          this.loading = false;
          // Verificar que el login fue exitoso antes de navegar
          if (res.exitoso) {
            console.log('Login exitoso, token guardado');
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMsg = res.mensaje || 'Error al iniciar sesión';
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error en login:', err);
          this.errorMsg = err.error?.mensaje || 'Error al iniciar sesión';
        }
      });
    } else {
      this.authService.register(val).subscribe({
        next: (res) => {
          this.loading = false;
          if (res.exitoso) {
            this.isLogin = true;
            this.errorMsg = '';
            alert('¡Cuenta creada exitosamente! Ahora inicia sesión.');
          } else {
            this.errorMsg = res.mensaje || 'Error al crear la cuenta';
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err.error?.mensaje || 'Hubo un error al crear la cuenta';
        }
      });
    }
  }
}
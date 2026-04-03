import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // Logueado = permitir paso
    return true;
  } else {
    // Redirigir al login si no está y retornar false
    // router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    console.warn('Acceso denegado: se requiere autenticación');
    return false; // o router.createUrlTree(['/login'])
  }
};

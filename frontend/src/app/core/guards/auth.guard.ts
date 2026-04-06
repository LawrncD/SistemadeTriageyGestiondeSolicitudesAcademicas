import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('AuthGuard: Verificando acceso a', state.url);
  
  if (authService.isAuthenticated()) {
    // Logueado = permitir paso
    console.log('AuthGuard: Usuario autenticado, permitiendo acceso');
    return true;
  } else {
    // Redirigir al login si no está autenticado
    console.warn('AuthGuard: Usuario NO autenticado, redirigiendo a login');
    return router.createUrlTree(['/login']);
  }
};

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si hay token, clonamos la petición y le añadimos el header de Authorization con Bearer
  let authReq = req;
  if (token) {
    console.log('Interceptor: Añadiendo token Bearer a la petición:', req.url);
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    console.log('Interceptor: No hay token disponible para:', req.url);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // No hacer logout si el error es del endpoint de login/registro
      const isAuthEndpoint = req.url.includes('/api/auth/');
      
      console.log('Interceptor: Error HTTP', error.status, 'en', req.url);
      
      // Manejo global de errores HTTP (ej: Token expirado o 401)
      if ((error.status === 401 || error.status === 403) && !isAuthEndpoint) {
        console.error('Interceptor: Token inválido o expirado. Cerrando sesión...');
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};

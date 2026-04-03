import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si hay token, clonamos la petición y le añadimos el header de Authorization
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Manejo global de errores HTTP (ej: Token expirado o 401)
      if (error.status === 401 || error.status === 403) {
        console.error('El token ha expirado o no está autorizado. Cerrando sesión...');
        authService.logout();
        // Redirigirías al router acá (ej. inject(Router).navigate(['/login']))
      }
      return throwError(() => error);
    })
  );
};

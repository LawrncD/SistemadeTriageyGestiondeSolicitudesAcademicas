import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'jwt_token';

  constructor() {}

  // Guardar token en localStorage
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    // Aquí puedes redirigir al login si existe la ruta
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    const token = this.getToken();
    // En una aplicación real, aquí verificarías la expiración del JWT
    return !!token;
  }
}

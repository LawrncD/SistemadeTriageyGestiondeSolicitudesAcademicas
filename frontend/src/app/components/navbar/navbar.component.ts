import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <a routerLink="/" class="brand-link">
          <span class="brand-icon">🎓</span>
          <span class="brand-text">Sistema de Triage Académico</span>
        </a>
      </div>
      <div class="navbar-menu">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
          <span class="nav-icon">📊</span> Dashboard
        </a>
        <a routerLink="/solicitudes" routerLinkActive="active" class="nav-link">
          <span class="nav-icon">📋</span> Solicitudes
        </a>
        <a routerLink="/solicitudes/nueva" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
          <span class="nav-icon">➕</span> Nueva Solicitud
        </a>
        <a routerLink="/usuarios" routerLinkActive="active" class="nav-link">
          <span class="nav-icon">👥</span> Usuarios
        </a>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: #ffffff;
      padding: 1rem 3rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #e5e0d8;
      font-family: inherit;
    }
    .brand-link {
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .brand-icon { font-size: 1.2rem; filter: grayscale(100%); }
    .brand-text {
      color: #3b3631;
      font-size: 1.3rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      border-bottom: 1px solid #9c9186;
      padding-bottom: 2px;
    }
    .navbar-menu {
      display: flex;
      gap: 1.5rem;
    }
    .nav-link {
      color: #7a7066;
      text-decoration: none;
      padding: 0.3rem 0;
      font-size: 1rem;
      font-weight: 400;
      letter-spacing: 0.5px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      text-transform: lowercase;
      font-variant: small-caps;
      border-bottom: 1px solid transparent;
    }
    .nav-link span.nav-icon { filter: grayscale(100%) opacity(0.7); font-size: 0.9rem; }
    .nav-link:hover {
      color: #3b3631;
      border-bottom: 1px solid #cfc5bb;
    }
    .nav-link.active {
      color: #2b2520;
      border-bottom: 1px solid #735c4b;
      font-weight: 600;
    }
  `]
})
export class NavbarComponent {}

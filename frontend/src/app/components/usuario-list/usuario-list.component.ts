import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import {
  UsuarioResponse,
  UsuarioRequest,
  Rol,
  ROL_LABELS
} from '../../models';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Usuarios</h1>
          <p class="page-subtitle">Gestión de usuarios del sistema</p>
        </div>
        <button class="btn-primary" (click)="mostrarFormulario = !mostrarFormulario">
          @if (mostrarFormulario) {
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Cerrar
          } @else {
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo Usuario
          }
        </button>
      </header>

      @if (mensaje) {
        <div class="alert" [class.alert-success]="!esError" [class.alert-error]="esError">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            @if (esError) {
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            } @else {
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            }
          </svg>
          {{ mensaje }}
        </div>
      }

      <!-- Create/Edit Form -->
      @if (mostrarFormulario) {
        <div class="form-card fade-in">
          <h2 class="form-title">{{ editandoId ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
          <form (ngSubmit)="guardar()" #form="ngForm">
            <div class="form-grid">
              <div class="form-group">
                <label for="identificacion">Identificación</label>
                <input type="text" id="identificacion" [(ngModel)]="formUsuario.identificacion" name="identificacion"
                  required placeholder="Ej: 1234567890">
              </div>
              <div class="form-group">
                <label for="nombre">Nombre</label>
                <input type="text" id="nombre" [(ngModel)]="formUsuario.nombre" name="nombre"
                  required placeholder="Nombre">
              </div>
              <div class="form-group">
                <label for="apellido">Apellido</label>
                <input type="text" id="apellido" [(ngModel)]="formUsuario.apellido" name="apellido"
                  required placeholder="Apellido">
              </div>
              <div class="form-group">
                <label for="email">Correo electrónico</label>
                <input type="email" id="email" [(ngModel)]="formUsuario.email" name="email"
                  required placeholder="correo@ejemplo.com">
              </div>
              <div class="form-group">
                <label for="rol">Rol</label>
                <select id="rol" [(ngModel)]="formUsuario.rol" name="rol" required>
                  @for (r of roles; track r) {
                    <option [value]="r">{{ rolLabel(r) }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label for="password">Contraseña</label>
                <input type="password" id="password" [(ngModel)]="formUsuario.password" name="password"
                  [required]="!editandoId" minlength="4" placeholder="••••••••">
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="cancelarForm()">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="form.invalid">
                {{ editandoId ? 'Actualizar' : 'Crear Usuario' }}
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Users List -->
      <div class="card">
        <div class="card-header">
          <h2>Lista de Usuarios</h2>
          <span class="badge-count">{{ usuarios.length }} usuarios</span>
        </div>
        
        @if (cargando) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Cargando usuarios...</p>
          </div>
        } @else if (usuarios.length === 0) {
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
            <p>No hay usuarios registrados</p>
            <button class="btn-link" (click)="mostrarFormulario = true">Crear primer usuario</button>
          </div>
        } @else {
          <div class="users-list">
            @for (u of usuarios; track u.id) {
              <div class="user-item" [class.inactive]="!u.activo">
                <div class="user-avatar" [class]="'avatar-' + u.rol.toLowerCase()">
                  {{ u.nombre.charAt(0) }}{{ u.apellido.charAt(0) }}
                </div>
                <div class="user-info">
                  <div class="user-name">{{ u.nombre }} {{ u.apellido }}</div>
                  <div class="user-meta">
                    <span class="user-email">{{ u.email }}</span>
                    <span class="user-id">ID: {{ u.identificacion }}</span>
                  </div>
                </div>
                <div class="user-role">
                  <span class="badge" [class]="'badge-' + u.rol.toLowerCase()">
                    {{ rolLabel(u.rol) }}
                  </span>
                </div>
                <div class="user-status">
                  <span class="status-indicator" [class.active]="u.activo" [class.inactive]="!u.activo"></span>
                  {{ u.activo ? 'Activo' : 'Inactivo' }}
                </div>
                <div class="user-actions">
                  <button class="btn-icon" (click)="editar(u)" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  @if (u.activo) {
                    <button class="btn-icon btn-danger" (click)="desactivar(u.id)" title="Desactivar">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                      </svg>
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .fade-in {
      animation: fadeIn 0.3s ease-out;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--color-text, #3d3d3d);
      margin-bottom: 0.25rem;
      letter-spacing: -0.02em;
    }

    .page-subtitle {
      color: var(--color-text-secondary, #6b6b6b);
      font-size: 0.95rem;
    }

    /* Buttons */
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.7rem 1.25rem;
      background: var(--color-primary, #8b7355);
      color: white;
      border: none;
      border-radius: var(--radius-md, 10px);
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary:hover {
      background: var(--color-primary-hover, #6d5a44);
      transform: translateY(-1px);
    }

    .btn-primary:active {
      transform: translateY(0);
    }

    .btn-primary:disabled {
      background: var(--color-border, #e0dcd5);
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.7rem 1.25rem;
      background: transparent;
      color: var(--color-text-secondary, #6b6b6b);
      border: 1px solid var(--color-border, #e0dcd5);
      border-radius: var(--radius-md, 10px);
      font-weight: 500;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-secondary:hover {
      border-color: var(--color-text-secondary, #6b6b6b);
      background: var(--color-bg-alt, #edeae5);
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-bg, #f7f5f2);
      border: none;
      border-radius: var(--radius-sm, 6px);
      color: var(--color-text-secondary, #6b6b6b);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-icon:hover {
      background: var(--color-bg-alt, #edeae5);
      color: var(--color-text, #3d3d3d);
    }

    .btn-icon.btn-danger:hover {
      background: #fef2f2;
      color: var(--color-danger, #b85450);
    }

    .btn-link {
      background: none;
      border: none;
      color: var(--color-primary, #8b7355);
      font-weight: 500;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .btn-link:hover {
      text-decoration: underline;
    }

    /* Alert */
    .alert {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-radius: var(--radius-md, 10px);
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      font-weight: 500;
      animation: fadeIn 0.3s ease-out;
    }

    .alert-error {
      background: #fef2f2;
      color: var(--color-danger, #b85450);
      border: 1px solid #fecaca;
    }

    .alert-success {
      background: #f0fdf4;
      color: var(--color-success, #5d8a66);
      border: 1px solid #bbf7d0;
    }

    /* Form Card */
    .form-card {
      background: var(--color-card, #ffffff);
      border-radius: var(--radius-lg, 16px);
      border: 1px solid var(--color-border, #e0dcd5);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text, #3d3d3d);
      margin-bottom: 1.25rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .form-group label {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--color-text-secondary, #6b6b6b);
    }

    .form-group input,
    .form-group select {
      padding: 0.65rem 0.9rem;
      border: 1px solid var(--color-border, #e0dcd5);
      border-radius: var(--radius-sm, 6px);
      font-size: 0.9rem;
      color: var(--color-text, #3d3d3d);
      background: var(--color-card, #ffffff);
      transition: all 0.2s ease;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--color-primary, #8b7355);
      box-shadow: 0 0 0 3px rgba(139, 115, 85, 0.1);
    }

    .form-group input::placeholder {
      color: var(--color-text-muted, #9a9a9a);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--color-border, #e0dcd5);
    }

    /* Card */
    .card {
      background: var(--color-card, #ffffff);
      border-radius: var(--radius-lg, 16px);
      border: 1px solid var(--color-border, #e0dcd5);
      overflow: hidden;
    }

    .card-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--color-border, #e0dcd5);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-header h2 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text, #3d3d3d);
    }

    .badge-count {
      font-size: 0.8rem;
      color: var(--color-text-muted, #9a9a9a);
      background: var(--color-bg-alt, #edeae5);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
    }

    /* Users List */
    .users-list {
      padding: 0.5rem;
    }

    .user-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: var(--radius-md, 10px);
      transition: all 0.2s ease;
    }

    .user-item:hover {
      background: var(--color-bg, #f7f5f2);
    }

    .user-item.inactive {
      opacity: 0.5;
    }

    .user-avatar {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-sm, 6px);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.9rem;
      flex-shrink: 0;
    }

    .avatar-estudiante { background: #e8f4fd; color: #3b82b6; }
    .avatar-docente { background: #f3e8fd; color: #8b5cf6; }
    .avatar-administrativo { background: #fef3e2; color: #d97706; }
    .avatar-responsable { background: #e8f5e9; color: #22863a; }

    .user-info {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-weight: 600;
      color: var(--color-text, #3d3d3d);
      font-size: 0.95rem;
    }

    .user-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.8rem;
      color: var(--color-text-muted, #9a9a9a);
      margin-top: 0.2rem;
    }

    .user-role {
      flex-shrink: 0;
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 0.3rem 0.7rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .badge-estudiante { background: #e8f4fd; color: #3b82b6; }
    .badge-docente { background: #f3e8fd; color: #8b5cf6; }
    .badge-administrativo { background: #fef3e2; color: #d97706; }
    .badge-responsable { background: #e8f5e9; color: #22863a; }

    .user-status {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      color: var(--color-text-secondary, #6b6b6b);
      min-width: 80px;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-indicator.active { background: var(--color-success, #5d8a66); }
    .status-indicator.inactive { background: var(--color-danger, #b85450); }

    .user-actions {
      display: flex;
      gap: 0.35rem;
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: var(--color-text-muted, #9a9a9a);
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--color-border, #e0dcd5);
      border-top-color: var(--color-primary, #8b7355);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--color-text-muted, #9a9a9a);
    }

    .empty-state svg {
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state p {
      margin-bottom: 0.75rem;
    }

    /* Responsive */
    @media (max-width: 900px) {
      .form-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .page {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        gap: 1rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .user-item {
        flex-wrap: wrap;
      }

      .user-meta {
        flex-direction: column;
        gap: 0.2rem;
      }

      .user-status {
        min-width: auto;
      }
    }
  `]
})
export class UsuarioListComponent implements OnInit {
  usuarios: UsuarioResponse[] = [];
  cargando = true;
  mostrarFormulario = false;
  editandoId: number | null = null;
  mensaje = '';
  esError = false;
  roles = Object.values(Rol);

  formUsuario: UsuarioRequest = {
    identificacion: '',
    nombre: '',
    apellido: '',
    email: '',
    rol: Rol.ESTUDIANTE,
    password: ''
  };

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.usuarioService.listarTodos().subscribe({
      next: res => {
        this.usuarios = res.exitoso ? res.datos : [];
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  guardar(): void {
    const obs = this.editandoId
      ? this.usuarioService.actualizar(this.editandoId, this.formUsuario)
      : this.usuarioService.crear(this.formUsuario);

    obs.subscribe({
      next: res => {
        if (res.exitoso) {
          this.show(this.editandoId ? 'Usuario actualizado' : 'Usuario creado exitosamente', false);
          this.cancelarForm();
          this.cargar();
        }
      },
      error: err => this.show(err.error?.mensaje || 'Error al guardar', true)
    });
  }

  editar(u: UsuarioResponse): void {
    this.editandoId = u.id;
    this.formUsuario = {
      identificacion: u.identificacion,
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      rol: u.rol,
      password: ''
    };
    this.mostrarFormulario = true;
  }

  desactivar(id: number): void {
    if (confirm('¿Desactivar este usuario?')) {
      this.usuarioService.desactivar(id).subscribe({
        next: () => { this.show('Usuario desactivado', false); this.cargar(); },
        error: err => this.show(err.error?.mensaje || 'Error al desactivar', true)
      });
    }
  }

  cancelarForm(): void {
    this.mostrarFormulario = false;
    this.editandoId = null;
    this.formUsuario = {
      identificacion: '',
      nombre: '',
      apellido: '',
      email: '',
      rol: Rol.ESTUDIANTE,
      password: ''
    };
  }

  private show(msg: string, error: boolean): void {
    this.mensaje = msg;
    this.esError = error;
    setTimeout(() => this.mensaje = '', 4000);
  }

  rolLabel(r: Rol): string { return ROL_LABELS[r] || r; }
}

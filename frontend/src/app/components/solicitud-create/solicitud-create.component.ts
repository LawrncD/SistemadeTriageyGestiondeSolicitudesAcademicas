import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { UsuarioService } from '../../services/usuario.service';
import {
  SolicitudRequest,
  UsuarioResponse,
  CanalOrigen,
  CANAL_LABELS,
  Rol
} from '../../models';

@Component({
  selector: 'app-solicitud-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <h1 class="page-title">Nueva Solicitud</h1>

      <div class="form-card">
        @if (mensajeError) {
          <div class="alert alert-error">{{ mensajeError }}</div>
        }
        @if (mensajeExito) {
          <div class="alert alert-success">{{ mensajeExito }}</div>
        }

        <form (ngSubmit)="enviar()" #form="ngForm">
          <div class="form-grid">
            <div class="form-group full-width">
              <label for="titulo">Título *</label>
              <input id="titulo" type="text" [(ngModel)]="solicitud.titulo" name="titulo"
                required minlength="5" #titulo="ngModel"
                placeholder="Describe brevemente tu solicitud">
              @if (titulo.invalid && titulo.touched) {
                <span class="field-error">El título es obligatorio (mín. 5 caracteres)</span>
              }
            </div>

            <div class="form-group full-width">
              <label for="descripcion">Descripción *</label>
              <textarea id="descripcion" [(ngModel)]="solicitud.descripcion" name="descripcion"
                required minlength="10" #desc="ngModel" rows="4"
                placeholder="Detalla tu solicitud académica..."></textarea>
              @if (desc.invalid && desc.touched) {
                <span class="field-error">La descripción es obligatoria (mín. 10 caracteres)</span>
              }
            </div>

            <div class="form-group">
              <label for="canal">Canal de Origen *</label>
              <select id="canal" [(ngModel)]="solicitud.canalOrigen" name="canalOrigen" required>
                @for (c of canales; track c) {
                  <option [value]="c">{{ canalLabel(c) }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label for="solicitante">Solicitante *</label>
              <select id="solicitante" [(ngModel)]="solicitud.solicitanteId" name="solicitanteId" required>
                <option [ngValue]="0" disabled>Seleccione...</option>
                @for (u of usuarios; track u.id) {
                  <option [ngValue]="u.id">{{ u.nombre }} {{ u.apellido }} ({{ u.rol }})</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label for="fechaLimite">Fecha Límite (opcional)</label>
              <input id="fechaLimite" type="date" [(ngModel)]="solicitud.fechaLimite" name="fechaLimite">
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-outline" (click)="cancelar()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || enviando">
              {{ enviando ? 'Registrando...' : '📋 Registrar Solicitud' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 2rem 3rem; max-width: 800px; margin: 0 auto; min-height: calc(100vh - 60px); }
    .page-title { 
      font-size: 1.8rem; font-weight: 400; color: #000; 
      font-variant: small-caps; letter-spacing: 1px; 
      margin-bottom: 2rem; border-bottom: 1px solid #000; padding-bottom: 0.5rem;
    }
    .form-card {
      background: #fff;
      padding: 0rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem 1.5rem;
    }
    .full-width { grid-column: 1 / -1; }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .form-group label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #333;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 0.5rem;
      border: none;
      border-bottom: 1px solid #000;
      border-radius: 0;
      font-size: 1rem;
      font-family: inherit;
      background: transparent;
      transition: all 0.2s;
    }
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-bottom: 2px solid #5c4d42;
    }
    .form-group textarea { resize: vertical; }
    .field-error { color: #8a2be2; font-size: 0.8rem; font-style: italic; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid #000;
    }
    .btn {
      padding: 0.5rem 1.5rem;
      border: 1px solid #000;
      background: #fff;
      color: #000;
      font-family: inherit;
      font-weight: 400;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary:hover:not(:disabled) { background: #000; color: #fff; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; border-color: #999; color: #999; }
    .btn-outline { border: 1px dashed #666; color: #444; }
    .btn-outline:hover { border-style: solid; border-color: #000; color: #000; }
    
    .alert {
      padding: 1rem; margin-bottom: 2rem; font-size: 0.95rem; font-style: italic;
      border: 1px solid currentColor;
    }
    .alert-error { color: #8a2be2; }
    .alert-success { color: #2e7d32; }
  `]
})
export class SolicitudCreateComponent implements OnInit {
  solicitud: SolicitudRequest = {
    titulo: '',
    descripcion: '',
    canalOrigen: CanalOrigen.CSU,
    solicitanteId: 0,
    fechaLimite: ''
  };

  usuarios: UsuarioResponse[] = [];
  canales = Object.values(CanalOrigen);
  enviando = false;
  mensajeError = '';
  mensajeExito = '';

  constructor(
    private solicitudService: SolicitudService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioService.listarActivos().subscribe({
      next: res => { if (res.exito) this.usuarios = res.datos; },
      error: () => {}
    });
  }

  enviar(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    this.enviando = true;

    const dto = { ...this.solicitud };
    if (!dto.fechaLimite) delete dto.fechaLimite;

    this.solicitudService.registrar(dto).subscribe({
      next: res => {
        this.enviando = false;
        if (res.exito) {
          this.mensajeExito = 'Solicitud registrada exitosamente';
          setTimeout(() => this.router.navigate(['/solicitudes', res.datos.id]), 1000);
        } else {
          this.mensajeError = res.mensaje;
        }
      },
      error: err => {
        this.enviando = false;
        this.mensajeError = err.error?.mensaje || 'Error al registrar la solicitud';
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/solicitudes']);
  }

  canalLabel(c: CanalOrigen): string { return CANAL_LABELS[c] || c; }
}

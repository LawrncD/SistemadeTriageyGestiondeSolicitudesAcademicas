import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { UsuarioService } from '../../services/usuario.service';
import { IaService, SugerenciaIAResponseDTO } from '../../services/ia.service';
import {
  SolicitudResponse,
  UsuarioResponse,
  HistorialResponse,
  EstadoSolicitud,
  TipoSolicitud,
  Prioridad,
  Rol,
  ESTADO_LABELS,
  PRIORIDAD_LABELS,
  TIPO_SOLICITUD_LABELS,
  CANAL_LABELS,
  CanalOrigen
} from '../../models';

@Pipe({ name: 'anyToTipo', standalone: true })
export class AnyToTipoPipe implements PipeTransform {
  transform(value: any): TipoSolicitud { return value as TipoSolicitud; }
}

@Component({
  selector: 'app-solicitud-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AnyToTipoPipe],
  template: `
    <div class="page">
      @if (cargando) {
        <div class="skeleton-container">
          <div class="skeleton title-skeleton"></div>
          <div class="detail-grid">
            <div class="skeleton card-skeleton"></div>
            <div class="skeleton card-skeleton"></div>
          </div>
        </div>
      } @else if (!solicitud) {
        <div class="empty">Solicitud no encontrada.</div>
      } @else {
        <!-- Header -->
        <div class="detail-header">
          <div>
            <a routerLink="/solicitudes" class="back-link">← Volver a solicitudes</a>
            <h1 class="page-title">#{{ solicitud.id }} — {{ solicitud.titulo }}</h1>
          </div>
          <div class="header-badges">
            <span class="badge badge-lg" [class]="'badge-' + solicitud.estado.toLowerCase()">
              {{ estadoLabel(solicitud.estado) }}
            </span>
            @if (solicitud.prioridad) {
              <span class="badge badge-lg" [class]="'badge-p-' + solicitud.prioridad.toLowerCase()">
                {{ prioridadLabel(solicitud.prioridad) }}
              </span>
            }
          </div>
        </div>

        @if (mensaje) {
          <div class="alert" [class.alert-success]="!esError" [class.alert-error]="esError">
            {{ mensaje }}
          </div>
        }

        <div class="detail-grid">
          <!-- Info Card -->
          <div class="card info-card">
            <h2>Información General</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Descripción</span>
                <span class="info-value desc">{{ solicitud.descripcion }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Tipo</span>
                <span class="info-value">
                  @if (solicitud.tipo) {
                    {{ tipoLabel(solicitud.tipo) }}
                  } @else {
                    <em class="text-muted">Sin clasificar</em>
                  }
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Canal de Origen</span>
                <span class="info-value">{{ canalLabel(solicitud.canalOrigen) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Solicitante</span>
                <span class="info-value">{{ solicitud.solicitante.nombre }} {{ solicitud.solicitante.apellido }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Responsable</span>
                <span class="info-value">
                  @if (solicitud.responsable) {
                    {{ solicitud.responsable.nombre }} {{ solicitud.responsable.apellido }}
                  } @else {
                    <em class="text-muted">Sin asignar</em>
                  }
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Fecha Creación</span>
                <span class="info-value">{{ solicitud.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Fecha Límite</span>
                <span class="info-value">
                  @if (solicitud.fechaLimite) {
                    {{ solicitud.fechaLimite | date:'dd/MM/yyyy' }}
                  } @else {
                    <em class="text-muted">No definida</em>
                  }
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Última Actualización</span>
                <span class="info-value">{{ solicitud.fechaUltimaActualizacion | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              @if (solicitud.observaciones) {
                <div class="info-item full">
                  <span class="info-label">Observaciones</span>
                  <span class="info-value desc">{{ solicitud.observaciones }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Actions Panel -->
          @if (solicitud.estado !== 'CERRADA') {
            <div class="card actions-card">
              <h2>Acciones</h2>

              <!-- RF-02: Clasificar -->
              @if (solicitud.estado === 'REGISTRADA') {
                <div class="action-section">
                  <div class="action-section-header">
                    <h3>🏷️ Clasificar Solicitud (RF-02)</h3>
                    <button class="btn btn-ia" (click)="sugerirIA()" [disabled]="cargandoIA" title="Obtener sugerencia de Inteligencia Artificial (Opcional)">
                      ✨ {{ cargandoIA ? 'Analizando...' : 'Asistente IA' }}
                    </button>
                  </div>
                  
                  @if (sugerenciaIA) {
                    <div class="ia-suggestion slide-in">
                      <div class="ia-badge">IA</div>
                      <div class="ia-content">
                        <strong>Clasificación sugerida:</strong> {{ tipoLabel(sugerenciaIA.tipoSugerido | anyToTipo) }}<br>
                        <em>"{{ sugerenciaIA.razonamiento }}"</em>
                      </div>
                      <button class="btn-icon" (click)="aplicarSugerenciaIA()" title="Aplicar sugerencia">✅</button>
                    </div>
                  }

                  <div class="action-form">
                    <select [(ngModel)]="clasificarTipo" class="action-input">
                      @for (t of tipos; track t) {
                        <option [value]="t">{{ tipoLabel(t) }}</option>
                      }
                    </select>
                    <input type="text" [(ngModel)]="clasificarObs" placeholder="Observaciones..."
                      class="action-input">
                    <button class="btn btn-action" (click)="clasificar()">Clasificar</button>
                  </div>
                </div>
              }

              <!-- RF-03: Priorizar -->
              @if (solicitud.estado === 'CLASIFICADA' || solicitud.estado === 'REGISTRADA') {
                <div class="action-section">
                  <h3>📊 Priorizar Solicitud (RF-03)</h3>
                  <div class="action-form">
                    <select [(ngModel)]="priorizarPrioridad" class="action-input">
                      <option value="">Auto (por reglas)</option>
                      @for (p of prioridadesEnum; track p) {
                        <option [value]="p">{{ prioridadLabel(p) }}</option>
                      }
                    </select>
                    <button class="btn btn-action" (click)="priorizar()">Priorizar</button>
                  </div>
                </div>
              }

              <!-- RF-05: Asignar -->
              @if (!solicitud.responsable) {
                <div class="action-section">
                  <h3>👤 Asignar Responsable (RF-05)</h3>
                  <div class="action-form">
                    <select [(ngModel)]="asignarResponsableId" class="action-input">
                      <option [ngValue]="0" disabled>Seleccione responsable...</option>
                      @for (r of responsables; track r.id) {
                        <option [ngValue]="r.id">{{ r.nombre }} {{ r.apellido }}</option>
                      }
                    </select>
                    <input type="text" [(ngModel)]="asignarObs" placeholder="Observaciones..."
                      class="action-input">
                    <button class="btn btn-action" [disabled]="asignarResponsableId === 0"
                      (click)="asignar()">Asignar</button>
                  </div>
                </div>
              }

              <!-- RF-04: Cambiar estado -->
              <div class="action-section">
                <h3>🔄 Cambiar Estado (RF-04)</h3>
                <div class="action-form">
                  <select [(ngModel)]="nuevoEstado" class="action-input">
                    @for (e of estadosDisponibles; track e) {
                      <option [value]="e">{{ estadoLabel(e) }}</option>
                    }
                  </select>
                  <input type="text" [(ngModel)]="estadoObs" placeholder="Observaciones..."
                    class="action-input">
                  <button class="btn btn-action" (click)="cambiarEstado()">Cambiar</button>
                </div>
              </div>

              <!-- RF-08: Cerrar -->
              @if (solicitud.estado === 'ATENDIDA') {
                <div class="action-section cerrar">
                  <h3>🔒 Cerrar Solicitud (RF-08)</h3>
                  <div class="action-form">
                    <input type="text" [(ngModel)]="cerrarObs" placeholder="Observaciones de cierre *"
                      class="action-input" required>
                    <button class="btn btn-danger" [disabled]="!cerrarObs"
                      (click)="cerrar()">Cerrar Solicitud</button>
                  </div>
                </div>
              }
            </div>
          }

          <!-- RF-06: Historial / Trazabilidad -->
          <div class="card historial-card full-width">
            <h2>📜 Historial de Trazabilidad (RF-06)</h2>
            @if (historial.length === 0) {
              <p class="text-muted">No hay registros de historial.</p>
            } @else {
              <div class="timeline">
                @for (h of historial; track h.id) {
                  <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <div class="timeline-header">
                        <strong>{{ h.accion }}</strong>
                        <span class="timeline-date">{{ h.fechaHora | date:'dd/MM/yyyy HH:mm:ss' }}</span>
                      </div>
                      @if (h.usuario) {
                        <div class="timeline-user">
                          Por: {{ h.usuario.nombre }} {{ h.usuario.apellido }}
                        </div>
                      }
                      @if (h.observaciones) {
                        <div class="timeline-obs">{{ h.observaciones }}</div>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`

.page { padding: 3rem; background: #fff; color: #222; font-family: inherit; }
.loading, .empty { text-align: center; padding: 4rem; color: #555; font-style: italic; border: 1px dashed #999; }
.back-link { color: #000; text-decoration: none; font-size: 0.95rem; font-variant: small-caps; border-bottom: 1px dotted #000; padding-bottom: 2px; }
.back-link:hover { border-bottom-style: solid; }
.page-title { font-size: 2.2rem; font-weight: normal; color: #000; margin: 1.5rem 0; letter-spacing: 0.5px; border-bottom: 2px solid #000; padding-bottom: 0.75rem; font-variant: small-caps; }
.detail-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
.header-badges { display: flex; gap: 0.8rem; flex-wrap: wrap; }
.badge { padding: 0.25rem 0.75rem; font-size: 0.8rem; letter-spacing: 1px; text-transform: uppercase; border: 1px solid currentColor; background: transparent !important; color: #000; }
.badge-lg { font-size: 0.9rem; padding: 0.4rem 1rem; }
.badge-cerrada { text-decoration: line-through; color: #555; border-style: dashed; }
.badge-p-baja, .badge-p-media { color: #555; border-style: dotted; }
.badge-p-alta, .badge-p-critica { color: #000; font-weight: bold; border-width: 2px; }
.alert { padding: 1rem 1.25rem; margin-bottom: 2rem; font-style: italic; border-left: 3px solid currentColor; background: #fbfbfb; }
.alert-error { color: #555; border-color: #000; font-weight: bold; }
.alert-success { color: #222; border-style: dashed; }
.detail-grid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 2.5rem; align-items: start; }
.card { background: #fff; padding: 0; border: none; }
.card h2 { font-size: 1.2rem; color: #000; margin-bottom: 1.5rem; font-weight: normal; font-variant: small-caps; letter-spacing: 1px; padding-bottom: 0.25rem; border-bottom: 1px dotted #000; }
.info-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
.info-item { display: flex; flex-direction: column; gap: 0.4rem; }
.info-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #555; }
.info-value { font-size: 1.05rem; color: #111; line-height: 1.5; word-break: break-word; }
.info-value.desc { background: transparent; padding: 0 0 0 1rem; border-left: 2px solid #000; font-style: italic; }
.text-muted { color: #777; font-style: italic; }
.action-section { padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid #000; background: #fdfdfd; }
.action-section.cerrar { border-style: dashed; background: #fff; }
.action-section h3 { font-size: 1rem; color: #000; margin-bottom: 1.25rem; font-weight: normal; font-variant: small-caps; }
.action-form { display: flex; flex-direction: column; gap: 1rem; }
.action-input { padding: 0.5rem; border: none; border-bottom: 1px solid #000; font-family: inherit; font-size: 0.95rem; background: transparent; width: 100%; }
.action-input:focus { border-bottom-width: 2px; outline: none; padding-bottom: 0.5rem; }
.btn { padding: 0.6rem 1.5rem; border: 1px solid #000; background: #fff; color: #000; font-family: inherit; font-weight: normal; font-variant: small-caps; font-size: 1rem; cursor: pointer; transition: all 0.2s; align-self: flex-start; text-transform: lowercase; }
.btn:hover:not(:disabled) { background: #000; color: #fff; }
.btn:disabled { opacity: 0.4; cursor: not-allowed; border-style: dashed; }
.btn-danger { color: #000; font-weight: bold; border-width: 2px; }
.action-section-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1rem; border-bottom: 1px dotted #000; padding-bottom: 0.5rem; }
.btn-ia { background: transparent; color: #000; padding: 0.2rem 0.5rem; border: 1px dashed #000; font-size: 0.8rem; letter-spacing: 1px; }
.btn-ia:hover:not(:disabled) { background: #000; color: #fff; }
.ia-suggestion { background: #fbfbfb; border: 1px solid #000; border-left: 4px solid #000; padding: 1.25rem; margin-bottom: 1.25rem; display: flex; align-items: flex-start; gap: 1rem; font-size: 0.95rem; color: #222; }
.ia-badge { font-family: monospace; letter-spacing: 2px; font-weight: bold; font-size: 0.8rem; margin-top: 2px; border: 1px solid #000; padding: 0.1rem 0.4rem; }
.ia-content em { color: #555; font-style: italic; display: block; margin-top: 0.5rem; line-height: 1.4; border-top: 1px dotted #ccc; padding-top: 0.5rem; }
.btn-icon { background: none; border: 1px solid #000; cursor: pointer; padding: 0.2rem 0.6rem; font-size: 1rem; border-radius: 0; }
.btn-icon:hover { background: #000; color: #fff; }
.historial-card { margin-top: 3rem; border-top: 2px solid #000; padding-top: 2rem; grid-column: 1 / -1; }
.timeline { position: relative; padding-left: 1.5rem; margin-top: 1.5rem; }
.timeline::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 1px; background: #000; }
.timeline-item { position: relative; margin-bottom: 2.5rem; }
.timeline-dot { position: absolute; left: -1.75rem; top: 6px; width: 11px; height: 11px; background: #fff; border: 2px solid #000; border-radius: 0; }
.timeline-item:hover .timeline-dot { background: #000; }
.timeline-content { padding: 0 0 0 1rem; background: transparent; border: none; }
.timeline-header { display: flex; justify-content: flex-start; align-items: baseline; gap: 1rem; margin-bottom: 0.4rem; }
.timeline-header strong { color: #000; font-weight: normal; font-size: 1rem; font-variant: small-caps; }
.timeline-date { font-size: 0.85rem; color: #666; font-family: monospace; }
.timeline-user { font-size: 0.9rem; color: #444; font-style: italic; display: block; margin-top: 0.2rem; }
.timeline-obs { margin-top: 0.75rem; font-size: 0.95rem; color: #222; background: #fdfdfd; padding: 0.8rem 1rem; border-left: 1px dashed #000; }
.skeleton-container { display: flex; flex-direction: column; gap: 2rem; }
.skeleton { background: #eee; animation: pulse 1.5s infinite; border-radius: 0; }
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
.title-skeleton { height: 35px; width: 50%; }
.card-skeleton { height: 200px; width: 100%; border: 1px solid #ddd; }
@media (max-width: 900px) { .detail-grid { grid-template-columns: 1fr; } }

`]
})
export class SolicitudDetailComponent implements OnInit {
  solicitud: SolicitudResponse | null = null;
  historial: HistorialResponse[] = [];
  responsables: UsuarioResponse[] = [];
  cargando = true;
  mensaje = '';
  esError = false;

  cargandoIA = false;
  sugerenciaIA: SugerenciaIAResponseDTO | null = null;

  // Form models
  clasificarTipo: TipoSolicitud = TipoSolicitud.REGISTRO_ASIGNATURAS;
  clasificarObs = '';
  priorizarPrioridad = '';
  asignarResponsableId = 0;
  asignarObs = '';
  nuevoEstado: EstadoSolicitud = EstadoSolicitud.CLASIFICADA;
  estadoObs = '';
  cerrarObs = '';

  tipos = Object.values(TipoSolicitud);
  prioridadesEnum = Object.values(Prioridad);

  private solicitudId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private solicitudService: SolicitudService,
    private usuarioService: UsuarioService,
    private iaService: IaService
  ) {}

  ngOnInit(): void {
    this.solicitudId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar();
    this.usuarioService.listarPorRol(Rol.RESPONSABLE).subscribe({
      next: res => { if (res.exito) this.responsables = res.datos; }
    });
  }

  cargar(): void {
    this.cargando = true;
    this.solicitudService.obtenerPorId(this.solicitudId).subscribe({
      next: res => {
        if (res.exito) {
          this.solicitud = res.datos;
          this.historial = res.datos.historial || [];
          this.actualizarEstadosDisponibles();
        }
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  get estadosDisponibles(): EstadoSolicitud[] {
    if (!this.solicitud) return [];
    const transiciones: Record<string, EstadoSolicitud[]> = {
      'REGISTRADA': [EstadoSolicitud.CLASIFICADA],
      'CLASIFICADA': [EstadoSolicitud.EN_ATENCION],
      'EN_ATENCION': [EstadoSolicitud.ATENDIDA],
      'ATENDIDA': [EstadoSolicitud.CERRADA],
      'CERRADA': []
    };
    return transiciones[this.solicitud.estado] || [];
  }

  actualizarEstadosDisponibles(): void {
    const disponibles = this.estadosDisponibles;
    if (disponibles.length > 0) {
      this.nuevoEstado = disponibles[0];
    }
  }

  sugerirIA(): void {
    this.cargandoIA = true;
    this.sugerenciaIA = null;
    this.iaService.obtenerClasificacionSugerida(this.solicitudId).subscribe({
      next: (res) => {
        if (res.exito) {
          this.sugerenciaIA = res.datos;
        } else {
          this.onError({ error: { mensaje: 'No se pudo obtener sugerencia IA, pero puede continuar manualmente.' }});
        }
        this.cargandoIA = false;
      },
      error: () => {
        this.cargandoIA = false;
        // Gracia (Fallback) RF-11
        this.onError({ error: { mensaje: 'Servicio IA no disponible. La aplicación sigue operando normalmente.' }});
      }
    });
  }

  aplicarSugerenciaIA(): void {
    if (this.sugerenciaIA) {
      this.clasificarTipo = this.sugerenciaIA.tipoSugerido as TipoSolicitud;
      this.clasificarObs = `Sugerencia IA Aplicada. Razón: ${this.sugerenciaIA.razonamiento}`;
    }
  }

  clasificar(): void {
    this.solicitudService.clasificar(this.solicitudId, {
      tipo: this.clasificarTipo,
      observaciones: this.clasificarObs || undefined
    }).subscribe({
      next: () => this.onSuccess('Solicitud clasificada correctamente'),
      error: err => this.onError(err)
    });
  }

  priorizar(): void {
    this.solicitudService.priorizar(this.solicitudId, {
      prioridad: this.priorizarPrioridad ? this.priorizarPrioridad as Prioridad : undefined
    }).subscribe({
      next: () => this.onSuccess('Solicitud priorizada correctamente'),
      error: err => this.onError(err)
    });
  }

  asignar(): void {
    this.solicitudService.asignar(this.solicitudId, {
      responsableId: this.asignarResponsableId,
      observaciones: this.asignarObs || undefined
    }).subscribe({
      next: () => this.onSuccess('Responsable asignado correctamente'),
      error: err => this.onError(err)
    });
  }

  cambiarEstado(): void {
    this.solicitudService.cambiarEstado(this.solicitudId, {
      nuevoEstado: this.nuevoEstado,
      observaciones: this.estadoObs || undefined
    }).subscribe({
      next: () => this.onSuccess('Estado cambiado correctamente'),
      error: err => this.onError(err)
    });
  }

  cerrar(): void {
    this.solicitudService.cerrar(this.solicitudId, {
      observaciones: this.cerrarObs
    }).subscribe({
      next: () => this.onSuccess('Solicitud cerrada correctamente'),
      error: err => this.onError(err)
    });
  }

  private onSuccess(msg: string): void {
    this.mensaje = msg;
    this.esError = false;
    this.cargar();
    setTimeout(() => this.mensaje = '', 4000);
  }

  private onError(err: any): void {
    this.mensaje = err.error?.mensaje || 'Error al procesar la operación';
    this.esError = true;
    setTimeout(() => this.mensaje = '', 5000);
  }

  estadoLabel(e: EstadoSolicitud): string { return ESTADO_LABELS[e] || e; }
  prioridadLabel(p: Prioridad): string { return PRIORIDAD_LABELS[p] || p; }
  tipoLabel(t: TipoSolicitud): string { return TIPO_SOLICITUD_LABELS[t] || t; }
  canalLabel(c: CanalOrigen): string { return CANAL_LABELS[c] || c; }
}

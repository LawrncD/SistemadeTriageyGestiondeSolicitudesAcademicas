import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SolicitudService } from '../../services/solicitud.service';
import {
  SolicitudResponse,
  EstadoSolicitud,
  TipoSolicitud,
  Prioridad,
  ESTADO_LABELS,
  PRIORIDAD_LABELS,
  TIPO_SOLICITUD_LABELS,
  CANAL_LABELS,
  CanalOrigen
} from '../../models';

@Component({
  selector: 'app-solicitud-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">Solicitudes</h1>
        <a routerLink="/solicitudes/nueva" class="btn btn-primary">
          ➕ Nueva Solicitud
        </a>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="filters-row">
          <div class="filter-group">
            <label>Estado</label>
            <select [(ngModel)]="filtroEstado" (change)="aplicarFiltros()">
              <option value="">Todos</option>
              @for (e of estados; track e) {
                <option [value]="e">{{ estadoLabel(e) }}</option>
              }
            </select>
          </div>
          <div class="filter-group">
            <label>Tipo</label>
            <select [(ngModel)]="filtroTipo" (change)="aplicarFiltros()">
              <option value="">Todos</option>
              @for (t of tipos; track t) {
                <option [value]="t">{{ tipoLabel(t) }}</option>
              }
            </select>
          </div>
          <div class="filter-group">
            <label>Prioridad</label>
            <select [(ngModel)]="filtroPrioridad" (change)="aplicarFiltros()">
              <option value="">Todas</option>
              @for (p of prioridades; track p) {
                <option [value]="p">{{ prioridadLabel(p) }}</option>
              }
            </select>
          </div>
          <button class="btn btn-outline" (click)="limpiarFiltros()">Limpiar</button>
        </div>
      </div>

      <!-- Table -->
      <div class="table-card">
        @if (cargando) {
          <div class="loading">Cargando solicitudes...</div>
        } @else if (solicitudes.length === 0) {
          <div class="empty">No se encontraron solicitudes.</div>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Canal</th>
                <th>Solicitante</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (s of solicitudes; track s.id) {
                <tr>
                  <td class="id-cell">#{{ s.id }}</td>
                  <td class="title-cell">{{ s.titulo }}</td>
                  <td>
                    <span class="badge badge-tipo">{{ tipoLabel(s.tipo) }}</span>
                  </td>
                  <td>
                    <span class="badge" [class]="'badge-' + s.estado.toLowerCase()">
                      {{ estadoLabel(s.estado) }}
                    </span>
                  </td>
                  <td>
                    @if (s.prioridad) {
                      <span class="badge" [class]="'badge-p-' + s.prioridad.toLowerCase()">
                        {{ prioridadLabel(s.prioridad) }}
                      </span>
                    } @else {
                      <span class="text-muted">—</span>
                    }
                  </td>
                  <td>{{ canalLabel(s.canalOrigen) }}</td>
                  <td>{{ s.solicitante.nombre }} {{ s.solicitante.apellido }}</td>
                  <td>{{ s.fechaCreacion | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <a [routerLink]="['/solicitudes', s.id]" class="btn-sm btn-view">Ver</a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
        <div class="table-footer">
          Total: <strong>{{ solicitudes.length }}</strong> solicitudes
        </div>
      </div>
    </div>
  `,
  styles: [`

    .page { padding: 3rem; background: #fff; color: #222; font-family: inherit; }
    .page-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2.5rem; border-bottom: 2px solid #000; padding-bottom: 0.75rem; }
    .page-title { font-size: 2.2rem; font-weight: normal; color: #000; font-variant: small-caps; letter-spacing: 0.5px; margin: 0; }
    .btn { padding: 0.6rem 1.5rem; border: 1px solid #000; background: #fff; color: #000; font-family: inherit; font-variant: small-caps; font-size: 1rem; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-block; }
    .btn:hover { background: #000; color: #fff; }
    .filters { background: #fbfbfb; border: 1px dashed #000; padding: 1.5rem; margin-bottom: 2.5rem; display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: flex-end; }
    .filter-group { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; min-width: 200px; }
    .filter-group label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #555; }
    .filter-group select { padding: 0.5rem; border: none; border-bottom: 1px solid #000; font-family: inherit; font-size: 0.95rem; background: transparent; width: 100%; border-radius: 0; }
    .filter-group select:focus { border-bottom-width: 2px; outline: none; padding-bottom: 0.5rem; }
    .table-card { margin-top: 1rem; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { padding: 1rem; border-bottom: 2px solid #000; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1.5px; color: #000; font-weight: normal; font-variant: small-caps; }
    .data-table td { padding: 1rem; border-bottom: 1px dotted #000; font-size: 0.95rem; color: #222; vertical-align: middle; }
    .data-table tr:hover td { background: #fbfbfb; }
    .badge { padding: 0.25rem 0.75rem; font-size: 0.75rem; letter-spacing: 1px; text-transform: uppercase; border: 1px solid currentColor; background: transparent !important; color: #000; white-space: nowrap; }
    .badge-tipo { border-style: dotted; color: #555; }
    .badge-cerrada { text-decoration: line-through; color: #555; border-style: dashed; }
    .badge-p-baja, .badge-p-media { color: #555; border-style: dotted; }
    .badge-p-alta, .badge-p-critica { color: #000; font-weight: bold; border-width: 2px; }
    .btn-sm { padding: 0.25rem 0.75rem; border: 1px solid #000; background: transparent; color: #000; font-variant: small-caps; font-size: 0.85rem; text-decoration: none; cursor: pointer; transition: all 0.2s; display: inline-block; }
    .btn-sm:hover { background: #000; color: #fff; }
    .table-footer { padding: 1rem 0; font-size: 0.9rem; color: #555; font-style: italic; border-top: 2px solid #000; margin-top: 2rem; display: flex; justify-content: space-between; }
    .loading, .empty { text-align: center; padding: 4rem; color: #555; font-style: italic; border: 1px dashed #999; margin-top: 2rem; }
    .text-muted { color: #777; font-style: italic; }
    @media (max-width: 900px) {
      .filters { flex-direction: column; gap: 1rem; }
      .data-table { font-size: 0.85rem; }
      .data-table th, .data-table td { padding: 0.75rem 0.5rem; }
      .page { padding: 1.5rem; }
    }

  `]
})
export class SolicitudListComponent implements OnInit {
  solicitudes: SolicitudResponse[] = [];
  cargando = true;
  estados = Object.values(EstadoSolicitud);
  tipos = Object.values(TipoSolicitud);
  prioridades = Object.values(Prioridad);

  filtroEstado = '';
  filtroTipo = '';
  filtroPrioridad = '';

  constructor(private solicitudService: SolicitudService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.solicitudService.listarTodas().subscribe({
      next: res => {
        this.solicitudes = res.exito ? res.datos : [];
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  aplicarFiltros(): void {
    this.cargando = true;
    const filtros: any = {};
    if (this.filtroEstado) filtros.estado = this.filtroEstado;
    if (this.filtroTipo) filtros.tipo = this.filtroTipo;
    if (this.filtroPrioridad) filtros.prioridad = this.filtroPrioridad;

    this.solicitudService.listar(filtros).subscribe({
      next: res => {
        this.solicitudes = res.exito ? res.datos : [];
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroTipo = '';
    this.filtroPrioridad = '';
    this.cargar();
  }

  estadoLabel(e: EstadoSolicitud): string { return ESTADO_LABELS[e] || e; }
  tipoLabel(t: TipoSolicitud): string { return TIPO_SOLICITUD_LABELS[t] || t; }
  prioridadLabel(p: Prioridad): string { return PRIORIDAD_LABELS[p] || p; }
  canalLabel(c: CanalOrigen): string { return CANAL_LABELS[c] || c; }
}

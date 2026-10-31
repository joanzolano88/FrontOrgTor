import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';
import { ModalidadTorneo } from 'src/enums/ModalidadTorneo';
import { Torneo } from 'src/models/Torneo';

interface TablaEstadisticas {
  goleadores: { jugador: string; equipo: string | null; goles: number }[];
  vallasMenosVencidas: {
    arquero: string;
    equipo: string | null;
    partidosJugados: number;
    golesRecibidos: number;
  }[];
}

interface EstadisticasTorneo {
  faseGrupos: TablaEstadisticas | null;
  eliminatorias: TablaEstadisticas | null;
  torneoCompleto: TablaEstadisticas;
}

@Component({
  selector: 'app-estadisticas-torneo',
  templateUrl: './estadisticas-torneo.page.html',
  styleUrls: ['./estadisticas-torneo.page.scss'],
  standalone: false
})
export class EstadisticasTorneoPage implements OnInit {
  torneoId: number;
  torneo = new Torneo();
  estadisticas?: EstadisticasTorneo;
  alcance: 'FASE_GRUPOS' | 'ELIMINATORIAS' | 'TORNEO' = 'FASE_GRUPOS';
  cargando = true;
  error = '';

  constructor(route: ActivatedRoute, private crud: CrudService) {
    this.torneoId = Number(route.snapshot.paramMap.get('idTorneo'));
  }

  ngOnInit(): void {
    if (!Number.isInteger(this.torneoId) || this.torneoId <= 0) {
      this.cargando = false;
      this.error = 'No se encontró el torneo solicitado.';
      return;
    }

    this.crud.obtenerParametro(this.torneoId, 'torneo').subscribe({
      next: torneo => this.torneo = torneo as Torneo,
      error: err => this.error = err?.error?.message || 'No se pudo cargar la información del torneo.'
    });
    this.crud.obtener<EstadisticasTorneo>(`torneo/${this.torneoId}/estadisticas`).subscribe({
      next: estadisticas => {
        this.estadisticas = estadisticas;
        this.cargando = false;
      },
      error: err => {
        this.error = err?.error?.message || 'No se pudieron cargar las estadísticas del torneo.';
        this.cargando = false;
      }
    });
  }

  esTorneoConFasesGrupos(): boolean {
    return this.torneo.modalidadTorneo === ModalidadTorneo.GRUPOS
      || this.torneo.modalidadTorneo === ModalidadTorneo.ELIMINATORIAS_GRUPOS;
  }

  tablasSeleccionadas(): TablaEstadisticas | null {
    if (!this.estadisticas) return null;
    if (!this.esTorneoConFasesGrupos() || this.alcance === 'TORNEO') {
      return this.estadisticas.torneoCompleto;
    }
    return this.alcance === 'FASE_GRUPOS'
      ? this.estadisticas.faseGrupos
      : this.estadisticas.eliminatorias;
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';
import { Jugador } from 'src/models/Jugador';

interface ParticipacionJugador {
  id?: number;
  torneo?: { id?: number; nombre?: string; ubicacion?: string };
  equipo?: { id?: number; nombre?: string; escudo?: string };
  participando?: boolean;
  jugoPartido?: boolean;
  cambioEquipo?: boolean;
}

interface EventoJugador {
  id?: number;
  tipo?: string;
  minuto?: number;
  partido?: { id?: number; fechaPartido?: string; equipoLocal?: { nombre?: string }; equipoVisitante?: { nombre?: string } };
}

interface PerfilJugador {
  jugador?: Jugador;
  participaciones?: ParticipacionJugador[];
  participacionTorneo?: ParticipacionJugador;
  sancionTorneo?: { permanente?: boolean; partidosPendientes?: number };
  eventosTorneo?: EventoJugador[];
}

@Component({
  selector: 'app-perfil-jugador',
  templateUrl: './perfil-jugador.page.html',
  styleUrls: ['./perfil-jugador.page.scss'],
  standalone: false
})
export class PerfilJugadorPage implements OnInit {
  jugadorId?: number;
  perfil?: PerfilJugador;
  perfilTorneo?: PerfilJugador;
  torneoSeleccionadoId?: number;
  cargando = true;
  cargandoTorneo = false;
  error = '';
  errorTorneo = '';

  constructor(
    private crud: CrudService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('idJugador'));
    if (!Number.isInteger(id) || id <= 0) {
      this.cargando = false;
      this.error = 'No se encontró el jugador solicitado.';
      return;
    }
    this.jugadorId = id;
    this.crud.obtenerPerfilJugador(id).subscribe({
      next: perfil => {
        this.perfil = perfil;
        this.cargando = false;
        this.route.queryParamMap.subscribe(params => {
          const torneoId = Number(params.get('torneoId'));
          if (!Number.isInteger(torneoId) || torneoId <= 0) {
            this.torneoSeleccionadoId = undefined;
            this.perfilTorneo = undefined;
            this.errorTorneo = '';
            return;
          }
          this.cargarDetalleTorneo(torneoId);
        });
      },
      error: err => {
        this.cargando = false;
        this.error = err?.error?.message || 'No se pudo cargar el perfil del jugador.';
      }
    });
  }

  participaciones(): ParticipacionJugador[] {
    return this.perfil?.participaciones || [];
  }

  seleccionarTorneo(participacion: ParticipacionJugador): void {
    const torneoId = participacion.torneo?.id;
    if (!torneoId || !this.jugadorId) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { torneoId },
      queryParamsHandling: 'merge'
    });
  }

  nombreEstado(participacion: ParticipacionJugador): string {
    if (participacion.participando) return 'Participó';
    if (participacion.jugoPartido) return 'Jugó partidos';
    return 'Inscrito';
  }

  nombreEvento(tipo?: string): string {
    switch (tipo) {
      case 'GOL': return 'Gol';
      case 'AUTOGOL': return 'Autogol';
      case 'ASISTENCIA': return 'Asistencia';
      case 'TARJETA_AMARILLA': return 'Tarjeta amarilla';
      case 'TARJETA_ROJA': return 'Tarjeta roja';
      case 'ENTRA_TITULAR': return 'Ingreso al partido';
      case 'SALE_TITULAR': return 'Sustitución';
      default: return tipo || 'Evento';
    }
  }

  contarEventos(tipo: string): number {
    return (this.perfilTorneo?.eventosTorneo || []).filter(evento => evento.tipo === tipo).length;
  }

  private cargarDetalleTorneo(torneoId: number): void {
    if (!this.jugadorId) return;
    this.torneoSeleccionadoId = torneoId;
    this.perfilTorneo = undefined;
    this.errorTorneo = '';
    this.cargandoTorneo = true;
    this.crud.obtenerPerfilJugador(this.jugadorId, torneoId).subscribe({
      next: perfil => {
        this.perfilTorneo = perfil;
        this.cargandoTorneo = false;
      },
      error: err => {
        this.errorTorneo = err?.error?.message || 'No se pudo cargar el historial del jugador en este torneo.';
        this.cargandoTorneo = false;
      }
    });
  }
}

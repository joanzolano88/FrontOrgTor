import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { CrudService } from 'src/app/services/crud.service';
import { SesionService } from 'src/app/services/restriccion/sesion.service';
import { Equipo } from 'src/models/Equipo';
import { Pago } from 'src/models/Pago';

@Component({
  selector: 'app-detalle-equipo-torneo',
  templateUrl: './detalle-equipo-torneo.page.html',
  styleUrls: ['./detalle-equipo-torneo.page.scss'],
  standalone: false
})
export class DetalleEquipoTorneoPage implements OnInit {
  equipo: Equipo = new Equipo();
  participacion: any;
  jugadores: any[] = [];
  pagos: Pago[] = [];
  nuevoPago = new Pago();
  jugadorPagoId?: number;
  jugadorInscripcionId?: number;
  inscribiendoJugador = false;
  mensajeInscripcion = '';
  esOrganizador = false;
  esDelegado = false;
  usuarioId?: number;
  usuarioIdentificacion?: string;
  error = '';
  cargando = true;
  readonly equipoId: number;
  readonly torneoId: number;

  constructor(route: ActivatedRoute, private crud: CrudService, private sesion: SesionService,
    private alertController: AlertController) {
    this.equipoId = Number(route.snapshot.paramMap.get('idEquipoDetalle'));
    this.torneoId = Number(route.snapshot.paramMap.get('idTorneoDetalle'));
  }

  ngOnInit() {
    const usuario = this.crud.obtenerUsuario();
    this.usuarioId = usuario.id;
    this.usuarioIdentificacion = usuario.identificacion;
    const esTipoOrganizador = this.sesion.validacionOrganizador();
    this.crud.obtenerEquipoEnTorneo(this.equipoId, this.torneoId).subscribe({
      next: equipo => {
        this.equipo = equipo;
        this.participacion = equipo.participacionTorneo;
        this.esDelegado = usuario.numeroCelular === equipo.delegado?.numeroCelular;
        this.esOrganizador = esTipoOrganizador && usuario.id === equipo.participacionTorneo?.torneo?.encargadoTorneo?.id;
        this.cargarJugadores();
        this.cargando = false;
      },
      error: err => {
        this.error = err?.error?.message || 'No se pudo cargar la participación del equipo.';
        this.cargando = false;
      }
    });
  }

  cargarJugadores() {
    this.crud.obtenerParticipacionesEquipo(this.equipoId).subscribe({
      next: participaciones => {
        this.jugadores = (participaciones || []).filter(item =>
          this.idRelacion(item.torneo) === this.torneoId &&
          this.idRelacion(item.equipo) === this.equipoId);
        this.cargarPagos();
      },
      error: err => this.error = err?.error?.message || 'No se pudo cargar el plantel inscrito.'
    });
  }

  private idRelacion(relacion: any): number | undefined {
    const id = typeof relacion === 'object' && relacion !== null ? relacion.id : relacion;
    const idNumerico = Number(id);
    return Number.isFinite(idNumerico) && idNumerico > 0 ? idNumerico : undefined;
  }

  cargarPagos() {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId) return;
    this.crud.obtenerPagosTorneo(this.torneoId, usuarioId).subscribe({
      next: pagos => this.pagos = (pagos || []).filter(pago => pago.equipoId === this.equipoId ||
        this.jugadores.some(item => this.idRelacion(item.jugador) === Number(pago.jugadorId))),
      error: err => this.error = err?.error?.message || 'No se pudieron cargar los pagos de este torneo.'
    });
  }

  jugadorInscrito(jugadorId?: number): boolean {
    return !!jugadorId && this.jugadores.some(item => this.idRelacion(item.jugador) === jugadorId);
  }

  yaEstoyInscrito(): boolean {
    return !!this.usuarioIdentificacion && this.jugadores.some(item =>
      typeof item.jugador === 'object' && item.jugador?.identificacion === this.usuarioIdentificacion);
  }

  unirmeComoJugador() {
    if (!this.usuarioId || this.participacion?.estado !== 'ACEPTADO' || this.yaEstoyInscrito()) return;
    this.crud.registrarseComoJugador(this.equipoId, this.torneoId, this.usuarioId).subscribe({
      next: () => this.cargarJugadores(),
      error: err => this.error = err?.error?.message || 'No se pudo registrar tu participación.'
    });
  }

  agregarJugador(jugador: any) {
    const jugadorId = Number(jugador?.id);
    const usuarioId = Number(this.crud.obtenerUsuario().id);
    if (this.inscribiendoJugador) return;
    if (!Number.isFinite(usuarioId) || usuarioId <= 0) {
      this.error = 'Inicia sesión nuevamente para inscribir jugadores.';
      return;
    }
    if (!Number.isFinite(jugadorId) || jugadorId <= 0) {
      this.error = 'Selecciona un jugador del plantel antes de inscribirlo.';
      return;
    }
    if (!this.esDelegado) {
      this.error = 'Solo el delegado del equipo puede inscribir jugadores.';
      return;
    }

    this.error = '';
    this.mensajeInscripcion = '';
    this.inscribiendoJugador = true;
    this.crud.agregarJugadorATorneo(this.equipoId, this.torneoId, jugadorId, usuarioId).subscribe({
      next: () => {
        this.jugadorInscripcionId = undefined;
        this.mensajeInscripcion = 'Jugador inscrito correctamente en el torneo.';
        this.cargarJugadores();
      },
      error: err => {
        this.error = err?.error?.message || err?.error?.detail || err?.message || 'No se pudo inscribir al jugador.';
        this.inscribiendoJugador = false;
      },
      complete: () => this.inscribiendoJugador = false
    });
  }

  quitarJugador(participacion: any) {
    const usuarioId = this.crud.obtenerUsuario().id;
    const jugador = participacion.jugador;
    if (!usuarioId || !jugador?.id || participacion.jugoPartido || !this.esDelegado) return;
    this.crud.eliminarJugadorDeTorneo(this.equipoId, this.torneoId, jugador.id, usuarioId).subscribe({
      next: () => this.cargarJugadores(),
      error: err => this.error = err?.error?.message || 'No se pudo retirar al jugador del torneo.'
    });
  }

  async registrarPago() {
    if (this.nuevoPago.valor <= 0) {
      this.error = 'El monto debe ser mayor que cero.';
      return;
    }
    this.nuevoPago.equipoId = this.jugadorPagoId ? undefined : this.equipoId;
    this.nuevoPago.jugadorId = this.jugadorPagoId;
    const alerta = await this.alertController.create({
      header: 'Confirmar pago recibido',
      message: `${this.nuevoPago.tipo} · $${this.nuevoPago.valor.toLocaleString('es-CO')} · ${this.nuevoPago.concepto || 'Sin concepto'}`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Registrar', role: 'confirm', handler: () => this.enviarPago() }
      ]
    });
    await alerta.present();
  }

  private enviarPago() {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId) return;
    const pago = {
      ...this.nuevoPago,
      equipo: this.jugadorPagoId ? undefined : { id: this.equipoId },
      jugador: this.jugadorPagoId ? { id: this.jugadorPagoId } : undefined
    };
    this.crud.registrarPagoTorneo(this.torneoId, pago, usuarioId).subscribe({
      next: pago => {
        this.pagos = [pago, ...this.pagos];
        this.nuevoPago = new Pago();
        this.jugadorPagoId = undefined;
        this.error = '';
      },
      error: err => this.error = err?.error?.message || 'No se pudo registrar el pago.'
    });
  }

  whatsappPago(pago: Pago) {
    if (!this.esOrganizador) return;
    const phone = pago.jugadorNumeroCelular || pago.delegadoNumeroCelular;
    if (!phone) {
      this.error = 'El destinatario no tiene celular registrado.';
      return;
    }
    const recipient = pago.jugadorNombre || pago.equipoNombre || 'destinatario';
    const message = `Pago registrado para ${recipient}. Tipo: ${pago.tipo}. Monto: $${pago.valor.toLocaleString('es-CO')}. Fecha: ${pago.fecha || ''}. Concepto: ${pago.concepto || ''}.`;
    window.open(`https://wa.me/57${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  }
}
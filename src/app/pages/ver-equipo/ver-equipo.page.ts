import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';
import { Equipo } from 'src/models/Equipo';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-ver-equipo',
  templateUrl: './ver-equipo.page.html',
  styleUrls: ['./ver-equipo.page.scss'],
  standalone: false
})
export class VerEquipoPage {
  equipo: Equipo = new Equipo();
  esDelegado = false;
  idTorneo = '';
  mensajeJugadores = '';
  identificacionJugador = '';
  esJugador = false;
  solicitandoUnirse = false;
  solicitudesJugadores: any[] = [];
  participacionesTorneos: any[] = [];
  cargandoTorneos = false;
  errorTorneos = '';
  torneoSeleccionadoId?: number;

  constructor(private crud: CrudService, private route: ActivatedRoute,
    private router: Router, private alertController: AlertController) {
    this.idTorneo = this.route.snapshot.paramMap.get('idTorneo') || '';
    const idEquipo = this.route.snapshot.paramMap.get('idEquipo');
    const cargarEquipo = (equipo: Equipo) => {
      this.equipo = equipo;
      const usuario = this.crud.obtenerUsuario();
      this.esDelegado = !!usuario.numeroCelular && usuario.numeroCelular === equipo.delegado?.numeroCelular;
      this.esJugador = usuario.tipoUsuario === 'JUGADOR';
      if (this.esDelegado && equipo.id && usuario.id) this.cargarSolicitudesJugadores(equipo.id, usuario.id);
      if (equipo.id) {
        this.cargarTorneosEquipo(equipo);
      }
    };
    if (idEquipo && Number(this.idTorneo) > 0) {
      this.crud.obtenerEquipoEnTorneo(Number(idEquipo), Number(this.idTorneo)).subscribe(cargarEquipo);
    } else {
      this.crud.obtenerParametro(idEquipo, 'equipo').subscribe(cargarEquipo);
    }
  }

  torneosConParticipacion(): any[] {
    return this.participacionesTorneos.filter(participacion => !!participacion?.torneo?.id);
  }

  esParticipacionAceptada(participacion: any): boolean {
    return String(participacion?.estado || '').trim().toLocaleUpperCase() === 'ACEPTADO';
  }

  colorEstadoParticipacion(participacion: any): string {
    if (this.esParticipacionAceptada(participacion)) return 'success';
    if (String(participacion?.estado || '').trim().toLocaleUpperCase() === 'PENDIENTE') return 'warning';
    return 'medium';
  }

  etiquetaEstadoParticipacion(participacion: any): string {
    const estado = String(participacion?.estado || '').trim().toLocaleUpperCase();
    return estado || 'REGISTRADO';
  }

  torneoSeleccionado(): any {
    return this.torneosConParticipacion().find(participacion =>
      this.esParticipacionAceptada(participacion) &&
      participacion.torneo?.id === this.torneoSeleccionadoId)?.torneo;
  }

  participacionSeleccionada(): any {
    return this.torneosConParticipacion().find(participacion =>
      this.esParticipacionAceptada(participacion) &&
      participacion.torneo?.id === this.torneoSeleccionadoId);
  }

  abrirDetalleTorneo(participacion: any) {
    const equipoId = this.equipo.id;
    const torneoId = participacion?.torneo?.id;
    if (!equipoId || !torneoId || !this.esParticipacionAceptada(participacion)) return;
    this.router.navigateByUrl(`/auth/torneos/torneo/${torneoId}/equipo/${equipoId}/participacion/${equipoId}/${torneoId}`);
  }

  private cargarTorneosEquipo(equipo: Equipo): void {
    if (!equipo.id) return;
    this.cargandoTorneos = true;
    this.errorTorneos = '';
    this.crud.obtenerTorneosEquipo(equipo.id).subscribe({
      next: respuesta => {
        const participaciones = Array.isArray(respuesta) ? respuesta : [];
        const participacionDelEquipo = equipo.participacionTorneo;
        if (participacionDelEquipo?.torneo?.id &&
            !participaciones.some(item => item.torneo?.id === participacionDelEquipo.torneo?.id)) {
          participaciones.push(participacionDelEquipo);
        }
        if (!participaciones.length && equipo.torneo?.id) {
          participaciones.push({
            torneo: equipo.torneo,
            estado: equipo.faseActual ? 'ACEPTADO' : 'PENDIENTE'
          });
        }
        this.participacionesTorneos = participaciones;
        const torneoActual = Number(this.idTorneo);
        const participacionSeleccionada = participaciones.find(item =>
          this.esParticipacionAceptada(item) && item.torneo?.id === torneoActual) ||
          participaciones.find(item => this.esParticipacionAceptada(item));
        this.torneoSeleccionadoId = participacionSeleccionada?.torneo?.id;
        this.cargandoTorneos = false;
      },
      error: error => {
        this.participacionesTorneos = [];
        this.cargandoTorneos = false;
        this.errorTorneos = error?.error?.message || 'No se pudieron cargar los torneos del equipo.';
      }
    });
  }

  abrirPerfilJugador(jugador: any) {
    if (!jugador?.id) return;
    this.router.navigateByUrl(`/auth/jugador/${jugador.id}/perfil`);
  }

  cargarSolicitudesJugadores(idEquipo: number, usuarioId: number) {
    this.crud.obtenerSolicitudesJugadores(idEquipo, usuarioId).subscribe({
      next: solicitudes => this.solicitudesJugadores = solicitudes || [],
      error: () => this.solicitudesJugadores = []
    });
  }

  resolverSolicitudJugador(solicitud: any, aceptar: boolean) {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !solicitud?.id) return;
    const accion = aceptar
      ? this.crud.aceptarSolicitudJugador(solicitud.id, usuarioId)
      : this.crud.rechazarSolicitudJugador(solicitud.id, usuarioId);
    accion.subscribe({
      next: (equipo: Equipo) => {
        if (aceptar) this.equipo = equipo;
        this.solicitudesJugadores = this.solicitudesJugadores.filter(item => item.id !== solicitud.id);
        this.mensajeJugadores = aceptar ? 'Solicitud aceptada.' : 'Solicitud rechazada.';
      },
      error: err => this.mensajeJugadores = err?.error?.message || 'No se pudo resolver la solicitud.'
    });
  }

  editar() {
    if (!this.equipo.id || !this.esDelegado) return;
    this.router.navigateByUrl('/auth/equipo-configurar/' + this.equipo.id);
  }

  abrirWhatsapp(numero?: string, mensaje = '') {
    if (!numero) {
      return;
    }
    const telefono = numero.replace(/\D/g, '');
    window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
  }

  solicitarUnirse() {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!this.equipo.id || !usuarioId) return;
    this.solicitandoUnirse = true;
    this.crud.solicitarUnirseEquipo(this.equipo.id, usuarioId).subscribe({
      next: () => {
        this.mensajeJugadores = 'Solicitud enviada al delegado del equipo.';
        this.solicitandoUnirse = false;
      },
      error: err => {
        this.mensajeJugadores = err?.error?.message || 'No se pudo enviar la solicitud.';
        this.solicitandoUnirse = false;
      }
    });
  }

  buscarYAgregarJugador() {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!this.equipo.id || !usuarioId || !this.identificacionJugador.trim()) {
      this.mensajeJugadores = 'Ingresa la identificación del jugador.';
      return;
    }
    this.crud.buscarJugadorEquipo(this.equipo.id, this.identificacionJugador.trim(), usuarioId).subscribe({
      next: async (jugador: any) => {
        const alerta = await this.alertController.create({
          header: 'Confirmar jugador',
          message: `Nombre: ${jugador.nombre || '-'}<br>Identificación: ${jugador.identificacion || this.identificacionJugador}<br>Equipo actual: ${jugador.equipo?.nombre || '-'}`,
          buttons: [
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Enviar invitación', role: 'confirm', handler: () => this.invitarJugador(jugador) }
          ]
        });
        await alerta.present();
      },
      error: err => this.mensajeJugadores = err?.error?.message || 'No se pudo buscar el jugador.'
    });
  }

  invitarJugador(jugador: any) {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!this.equipo.id || !usuarioId || !jugador?.identificacion) return;
    this.crud.invitarJugadorAEquipo(this.equipo.id, jugador.identificacion, usuarioId).subscribe({
      next: () => {
        this.identificacionJugador = '';
        this.mensajeJugadores = 'Invitación enviada al jugador.';
      },
      error: err => this.mensajeJugadores = err?.error?.message || 'No se pudo invitar al jugador.'
    });
  }

  eliminarJugador(jugador: any) {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!this.equipo.id || !usuarioId || !jugador.id) return;
    this.crud.eliminarJugadorEquipo(this.equipo.id, jugador.id, usuarioId).subscribe({
      next: () => {
        this.equipo.listaJugadoresActivos = (this.equipo.listaJugadoresActivos || []).filter(item => item.id !== jugador.id);
        this.mensajeJugadores = 'Jugador eliminado del equipo.';
      },
      error: err => this.mensajeJugadores = err?.error?.message || 'No se pudo eliminar el jugador.'
    });
  }
}

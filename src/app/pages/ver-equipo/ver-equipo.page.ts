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
  cedulaJugador = '';
  esJugador = false;
  solicitandoUnirse = false;
  solicitudesJugadores: any[] = [];
  participacionesTorneos: any[] = [];
  torneoSeleccionadoId?: number;
  perfilJugadorData: any;
  perfilJugadorModalOpen = false;

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
        this.crud.obtenerTorneosEquipo(equipo.id).subscribe(resp => {
          this.participacionesTorneos = resp || [];
          const participacionAceptada = this.participacionesTorneos.find(item =>
            item.estado === 'ACEPTADO' && item.torneo?.id === Number(this.idTorneo)) ||
            this.participacionesTorneos.find(item => item.estado === 'ACEPTADO');
          this.torneoSeleccionadoId = participacionAceptada?.torneo?.id;
        });
      }
    };
    if (idEquipo && Number(this.idTorneo) > 0) {
      this.crud.obtenerEquipoEnTorneo(Number(idEquipo), Number(this.idTorneo)).subscribe(cargarEquipo);
    } else {
      this.crud.obtenerParametro(idEquipo, 'equipo').subscribe(cargarEquipo);
    }
  }

  torneosConParticipacion(): any[] {
    return this.participacionesTorneos.filter(participacion => participacion.estado === 'ACEPTADO');
  }

  torneoSeleccionado(): any {
    return this.torneosConParticipacion().find(participacion => participacion.torneo?.id === this.torneoSeleccionadoId)?.torneo;
  }

  participacionSeleccionada(): any {
    return this.torneosConParticipacion().find(participacion => participacion.torneo?.id === this.torneoSeleccionadoId);
  }

  abrirDetalleTorneo(participacion: any) {
    const equipoId = this.equipo.id;
    const torneoId = participacion?.torneo?.id;
    if (!equipoId || !torneoId || participacion.estado !== 'ACEPTADO') return;
    this.router.navigateByUrl(`/auth/torneos/torneo/${torneoId}/equipo/${equipoId}/participacion/${equipoId}/${torneoId}`);
  }

  abrirPerfilJugador(jugador: any, idTorneo = this.torneoSeleccionadoId) {
    if (!jugador?.id) return;
    this.perfilJugadorModalOpen = true;
    this.crud.obtenerPerfilJugador(jugador.id, idTorneo).subscribe({
      next: perfil => this.perfilJugadorData = perfil,
      error: err => {
        this.perfilJugadorModalOpen = false;
        this.mensajeJugadores = err?.error?.message || 'No se pudo cargar el perfil del jugador.';
      }
    });
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
    if (!this.torneoSeleccionadoId || !this.equipo.id) return;
    this.router.navigateByUrl('/auth/torneos/torneo/' + this.torneoSeleccionadoId + '/tabla-equipos/crear-equipo/' + this.equipo.id);
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
    if (!this.equipo.id || !usuarioId || !this.cedulaJugador.trim()) {
      this.mensajeJugadores = 'Ingresa la cédula del jugador.';
      return;
    }
    this.crud.buscarJugadorEquipo(this.equipo.id, this.cedulaJugador.trim(), usuarioId).subscribe({
      next: async (jugador: any) => {
        const alerta = await this.alertController.create({
          header: 'Confirmar jugador',
          message: `Nombre: ${jugador.nombre || '-'}<br>Cédula: ${jugador.cedula || this.cedulaJugador}<br>Equipo actual: ${jugador.equipo?.nombre || '-'}`,
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
    if (!this.equipo.id || !usuarioId || !jugador?.cedula) return;
    this.crud.invitarJugadorAEquipo(this.equipo.id, jugador.cedula, usuarioId).subscribe({
      next: () => {
        this.cedulaJugador = '';
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

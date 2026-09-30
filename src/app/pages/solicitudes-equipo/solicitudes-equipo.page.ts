import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { CrudService } from 'src/app/services/crud.service';
import { Equipo } from 'src/models/Equipo';

@Component({
  selector: 'app-solicitudes-equipo',
  templateUrl: './solicitudes-equipo.page.html',
  styleUrls: ['./solicitudes-equipo.page.scss'],
  standalone: false
})
export class SolicitudesEquipoPage {
  solicitudes: Equipo[] = [];
  aceptadas: Equipo[] = [];
  idTorneo = '';
  mensajeError = '';
  alertOpen = false;
  readonly alertButtons = ['Aceptar'];

  constructor(private crud: CrudService, private route: ActivatedRoute,
    private router: Router, private alertController: AlertController) {
    this.idTorneo = this.route.snapshot.paramMap.get('idTorneo') || '';
    this.cargarSolicitudes();
  }

  private extraerMensajeError(error: any, defecto: string): string {
    const payload = error?.error;
    if (typeof payload === 'string') {
      return payload || defecto;
    }
    if (payload?.message) {
      return payload.message;
    }
    if (payload?.error) {
      return payload.error;
    }
    return defecto;
  }

  cargarSolicitudes() {
    this.crud.obtener('equipo/solicitudes/torneo/' + this.idTorneo).subscribe({
      next: (solicitudes: Equipo[]) => this.solicitudes = solicitudes || [],
      error: err => {
        this.mensajeError = this.extraerMensajeError(err, 'No se pudieron cargar las solicitudes.');
        this.alertOpen = true;
      }
    });
    this.crud.obtenerSolicitudesTodas(this.idTorneo).subscribe({
      next: (equipos: Equipo[]) => this.aceptadas = (equipos || []).filter(equipo => equipo.participacionTorneo?.estado === 'ACEPTADO'),
      error: () => this.aceptadas = []
    });
  }

  async aceptar(solicitud: Equipo) {
    const alert = await this.alertController.create({
      header: 'Aceptar solicitud',
      message: '¿Deseas agregar este equipo al torneo?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Aceptar', role: 'confirm', handler: () => this.confirmar(solicitud) }
      ]
    });
    await alert.present();
  }

  confirmar(solicitud: Equipo) {
    const idParticipacion = solicitud.participacionTorneo?.id;
    if (!idParticipacion) {
      return;
    }
    this.crud.aceptarSolicitudEquipo(idParticipacion).subscribe({
      next: (equipoAceptado: Equipo) => {
        this.solicitudes = this.solicitudes.filter(equipo => equipo.id !== solicitud.id);
        this.aceptadas = [equipoAceptado, ...this.aceptadas.filter(equipo => equipo.id !== equipoAceptado.id)];
        this.mensajeError = 'Solicitud aceptada correctamente.';
        this.alertOpen = true;
      },
      error: err => {
        this.mensajeError = this.extraerMensajeError(err, 'No se pudo aceptar la solicitud.');
        this.alertOpen = true;
      }
    });
  }

  async rechazar(solicitud: Equipo) {
    const alert = await this.alertController.create({
      header: 'Rechazar solicitud',
      message: `¿Deseas rechazar la solicitud de ${solicitud.nombre}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Rechazar', role: 'destructive', handler: () => this.confirmarRechazo(solicitud) }
      ]
    });
    await alert.present();
  }

  confirmarRechazo(solicitud: Equipo) {
    const idParticipacion = solicitud.participacionTorneo?.id;
    if (!idParticipacion) {
      return;
    }
    this.crud.rechazarSolicitudEquipo(idParticipacion).subscribe({
      next: () => {
        this.mensajeError = 'Solicitud rechazada correctamente.';
        this.alertOpen = true;
        this.cargarSolicitudes();
      },
      error: err => {
        this.mensajeError = this.extraerMensajeError(err, 'No se pudo rechazar la solicitud.');
        this.alertOpen = true;
      }
    });
  }

  verEquipo(id?: number) {
    if (id) this.router.navigateByUrl('/auth/torneos/torneo/' + this.idTorneo + '/equipo/' + id);
  }
}

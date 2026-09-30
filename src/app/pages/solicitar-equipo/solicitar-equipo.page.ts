import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { CrudService } from 'src/app/services/crud.service';
import { Equipo } from 'src/models/Equipo';
import { Torneo } from 'src/models/Torneo';

@Component({
  selector: 'app-solicitar-equipo',
  templateUrl: './solicitar-equipo.page.html',
  styleUrls: ['./solicitar-equipo.page.scss'],
  standalone: false
})
export class SolicitarEquipoPage {
  equipo: Equipo = new Equipo();
  torneo: Torneo = new Torneo();
  equiposDisponibles: Equipo[] = [];
  equipoSeleccionadoId: number | null = null;
  mensajeError = '';
  alertOpen = false;
  readonly alertButtons = ['Aceptar'];

  constructor(private crud: CrudService, private route: ActivatedRoute,
    private router: Router, private alertController: AlertController) {
    const idTorneo = this.route.snapshot.paramMap.get('idTorneo');
    const equipoSeleccionado = this.route.snapshot.queryParamMap.get('equipo');
    const equipoSeleccionadoId = equipoSeleccionado ? Number(equipoSeleccionado) : null;
    const usuarioLogueado = this.crud.obtenerUsuario();
    if (usuarioLogueado) {
      this.equipo.delegado = usuarioLogueado;
      if (usuarioLogueado.id) {
        this.crud.obtenerEquiposDelegado(usuarioLogueado.id).subscribe({
          next: equipos => {
            this.equiposDisponibles = equipos || [];
            if (equipoSeleccionadoId !== null) {
              this.seleccionarEquipo(equipoSeleccionadoId);
            }
          }
        });
      }
      if (!usuarioLogueado.nombre || !usuarioLogueado.numeroCelular) {
        this.crud.obtenerParametro(usuarioLogueado.id, 'usuario').subscribe((usuarioCompleto: any) => {
          this.equipo.delegado = usuarioCompleto;
        });
      }
    }
    this.crud.obtenerParametro(idTorneo, 'torneo').subscribe((torneo: Torneo) => this.torneo = torneo);
  }

  seleccionarEquipo(id: number | null) {
    this.equipoSeleccionadoId = id;
    if (id === null) {
      const usuario = this.crud.obtenerUsuario();
      this.equipo = new Equipo();
      this.equipo.delegado = usuario;
      return;
    }
    const equipoExistente = this.equiposDisponibles.find(equipo => equipo.id === id);
    if (equipoExistente) {
      this.equipo = { ...equipoExistente, torneo: this.torneo };
    }
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

  enviar(form: NgForm) {
    if (form.invalid || this.equipoSeleccionadoId === null) {
      this.mensajeError = 'Selecciona un equipo válido.';
      this.alertOpen = true;
      return;
    }
    if (!this.torneo || !this.torneo.id) {
      this.mensajeError = 'No se pudo identificar el torneo.';
      this.alertOpen = true;
      return;
    }
    const estadoActual = this.torneo.estadoTorneo as string;
    const esEstadoInscripcion = estadoActual === 'INSCRIPCIONES' || estadoActual === 'INSCRIPCIONES_ACTIVO' || estadoActual === 'INSCRIPCIONES_ACRIVO';
    if (!esEstadoInscripcion) {
      this.mensajeError = 'Las solicitudes solo se pueden enviar mientras el torneo está en inscripción.';
      this.alertOpen = true;
      return;
    }
    if (!this.equipo.delegado) {
      this.mensajeError = 'No se pudo cargar la información del delegado logueado.';
      this.alertOpen = true;
      return;
    }
    this.equipo.torneo = this.torneo;
    this.crud.enviarSolicitudEquipo(this.equipo, undefined).subscribe({
      next: async () => {
        this.mensajeError = 'Solicitud enviada correctamente. El organizador revisará tu equipo.';
        this.alertOpen = true;
        const alert = await this.alertController.create({ header: 'Solicitud enviada', message: this.mensajeError, buttons: ['Aceptar'] });
        await alert.present();
        this.router.navigateByUrl('/auth/torneos/torneo/' + this.torneo.id);
      },
      error: err => {
        this.mensajeError = this.extraerMensajeError(err, 'No se pudo enviar la solicitud.');
        this.alertOpen = true;
      }
    });
  }
}

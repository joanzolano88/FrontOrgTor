import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { CrudService } from 'src/app/services/crud.service';
import { EstadoTorneo } from 'src/enums/EstadoTorneo';
import { FaseActual } from 'src/enums/FaseActual';
import { ModalidadTorneo } from 'src/enums/ModalidadTorneo';
import { Cancha } from 'src/models/Cancha';
import { Torneo } from 'src/models/Torneo';
import { Equipo } from 'src/models/Equipo';
import { TipoUsuario } from 'src/enums/TipoUsuario';

@Component({
  selector: 'app-torneo',
  templateUrl: './torneo.component.html',
  styleUrls: ['./torneo.component.scss'],
  standalone: false
})
export class TorneoComponent {
  @Input() validarOrganizador: Boolean = false;
  esPropietario = false;
  torneo: Torneo = new Torneo();
  listCancha: Cancha[] = [];
  documento: string = "";
  isAlertOpen = false;
  alertButtons = ['Aceptar'];
  mensajeError: string = "";
  equipos: Equipo[] = [];
  esJugador = false;
  registroJugadorOpen = false;
  equipoSeleccionado?: Equipo;

  constructor(private crud: CrudService, private route: ActivatedRoute,
    private router: Router, private alertController: AlertController) {
  }
  ngOnInit(): void {
    this.crud.obtenerParametro(this.route.snapshot.paramMap.get('idTorneo'), "torneo").subscribe((respT: Torneo) =>{
      this.torneo = respT;
      const usuario = this.crud.obtenerUsuario();
      this.esPropietario = this.validarOrganizador && this.torneo.encargadoTorneo?.id === usuario?.id;
      this.esJugador = usuario?.tipoUsuario === TipoUsuario.JUGADOR;
      this.crud.obtener('equipo/torneo/' + this.torneo.id).subscribe((equipos: Equipo[]) => this.equipos = equipos || []);
      this.crud.obtener('cancha/torneo/' + this.torneo.id).subscribe((respC: Cancha[]) =>{
        this.listCancha = respC;
      });
      /*this.crud.obtenerParametro(this.torneo.id,'torneo/reglamento').subscribe((resp: Reglamento) =>{
        this.documento = resp.reglamento!;
      });*/
    });
  }
  configurarTorneo() {
    this.router.navigateByUrl('/auth/torneos/torneo/' + this.torneo.id + '/configuracion-torneo');
  }
  agregarCancha() {
    this.router.navigateByUrl('/auth/torneos/torneo/' + this.torneo.id + '/crear-cancha');
  }
  configurarCancha(id?: number) {
    this.router.navigateByUrl('/auth/torneos/torneo/' + this.torneo.id + '/configuracion-cancha/' + id);
  }
  tablaEquipos() {
    this.router.navigateByUrl('/auth/torneos/torneo/' + this.torneo.id + '/tabla-equipos');
  }
  listaPartidos() {
    this.router.navigateByUrl('/auth/torneos/torneo/' + this.torneo.id + '/lista-partidos');
  }
  verUbicacion(cancha: Cancha){
    window.open('https://maps.google.com/?q=' + cancha.latitud + ',' + cancha.longitud, '_blank');
  }
  agregarEquipo() {
    this.router.navigateByUrl('/auth/torneos/torneo/' + this.torneo.id + '/crear-equipo');
  }
  agregarPartido() {
    this.router.navigateByUrl('/auth/torneos/torneo/' + this.torneo.id + '/agregar-partido');
  }
  solicitarEquipo() {
    if (!this.crud.verSesion()) {
      this.mensajeError = 'Debes registrarte o iniciar sesión para postular un equipo.';
      this.setOpen(true);
      return;
    }
    this.router.navigateByUrl('/auth/torneos/torneo/' + this.torneo.id + '/solicitar-equipo');
  }
  abrirRegistroJugador() {
    this.equipoSeleccionado = undefined;
    this.registroJugadorOpen = true;
  }
  cerrarRegistroJugador() {
    this.registroJugadorOpen = false;
  }
  registrarJugador() {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !this.torneo.id || !this.equipoSeleccionado?.id) {
      this.mensajeError = 'Selecciona un equipo para continuar.';
      this.setOpen(true);
      return;
    }
    this.crud.crear({}, `equipo/torneo/${this.torneo.id}/jugador/${this.equipoSeleccionado.id}?usuarioId=${usuarioId}`).subscribe({
      next: () => {
        this.cerrarRegistroJugador();
        this.mensajeError = 'Te registraste correctamente en el equipo.';
        this.setOpen(true);
      },
      error: err => {
        this.mensajeError = err?.error?.message || 'No se pudo registrar el jugador.';
        this.setOpen(true);
      }
    });
  }
  verSolicitudes() {
    this.router.navigateByUrl('/auth/torneos/torneo/' + this.torneo.id + '/solicitudes');
  }
  organizarEquipos() {
    if (this.torneo.id) {
      this.router.navigateByUrl('/auth/torneos/torneo/' + this.torneo.id + '/asignar-grupos');
    }
  }
  etiquetaEstadoTorneo(): string {
    const etiquetas: Record<string, string> = {
      INSCRIPCIONES: 'Inscripciones',
      INSCRIPCIONES_ACTIVO: 'Inscripciones activas',
      ACTIVO: 'En juego',
      FINALIZADO: 'Finalizado'
    };
    return etiquetas[this.torneo.estadoTorneo as string] || 'Sin estado';
  }
  colorEstadoTorneo(): string {
    const colores: Record<string, string> = {
      INSCRIPCIONES: 'warning',
      INSCRIPCIONES_ACTIVO: 'primary',
      ACTIVO: 'success',
      FINALIZADO: 'medium'
    };
    return colores[this.torneo.estadoTorneo as string] || 'dark';
  }
  cantidadEquipos() {
    return (this.torneo.modalidadTorneo == ModalidadTorneo.GRUPOS || this.torneo.modalidadTorneo == ModalidadTorneo.ELIMINATORIAS_GRUPOS)? this.torneo.cantidadEquipos!*this.torneo.cantidadGrupos!: this.torneo.cantidadEquipos;
  }
  cambiarFase() {
    if (!this.esPropietario || this.torneo.faseTorneo == FaseActual.FINAL) {
      return;
    }
    this.crud.actualizar(null,'torneo/cambiar_fase/' + this.torneo.id).subscribe((resp: Torneo) =>{
      this.router.navigateByUrl('/auth/torneos/torneo/' + this.torneo.id + '/cambio-fase');
    }, (err: HttpErrorResponse) =>{
      this.mensajeError = err.error.message;
      this.setOpen(true);
    });
  }
  async cambiarEstadoTorneo(event: any) {
    if (!this.esPropietario) {
      return;
    }
    const nuevoEstado = event?.detail?.value as string;
    const estadoAnterior = this.torneo.estadoTorneo;
    if (this.torneo.estadoTorneo === EstadoTorneo.FINALIZADO) {
      this.mensajeError = 'El torneo ya está finalizado y no admite modificaciones.';
      this.setOpen(true);
      this.torneo.estadoTorneo = EstadoTorneo.FINALIZADO;
      return;
    }
    const estadoActual = this.torneo.estadoTorneo as string;
    const esEstadoInscripcionActivo = estadoActual === EstadoTorneo.INSCRIPCIONES_ACTIVO || estadoActual === 'INSCRIPCIONES_ACRIVO';
    if (nuevoEstado === EstadoTorneo.INSCRIPCIONES && !esEstadoInscripcionActivo && this.torneo.estadoTorneo !== EstadoTorneo.INSCRIPCIONES) {
      this.mensajeError = 'No se puede devolver el torneo a INSCRIPCIONES desde otro estado.';
      this.setOpen(true);
      this.torneo.estadoTorneo = this.torneo.estadoTorneo;
      return;
    }
    this.torneo.estadoTorneo = estadoActual as any;
    const alerta = await this.alertController.create({
      header: 'Cambiar estado del torneo',
      message: this.mensajeCambioEstado(nuevoEstado),
      buttons: [
        { text: 'Cancelar', role: 'cancel', handler: () => this.torneo.estadoTorneo = estadoActual as any },
        { text: 'Confirmar', role: 'confirm', handler: () => this.confirmarCambioEstado(nuevoEstado, estadoActual) }
      ]
    });
    await alerta.present();
  }

  private mensajeCambioEstado(nuevoEstado: string): string {
    if (nuevoEstado === EstadoTorneo.INSCRIPCIONES || nuevoEstado === EstadoTorneo.INSCRIPCIONES_ACTIVO) {
      return 'Se abrirá la gestión de solicitudes. Al confirmar podrás organizar los grupos o las llaves del torneo.';
    }
    if (nuevoEstado === EstadoTorneo.ACTIVO) {
      return 'El torneo quedará activo y ya no se podrán gestionar solicitudes de participación.';
    }
    if (nuevoEstado === EstadoTorneo.FINALIZADO) {
      return 'Solo se podrá finalizar si se completaron todas las fases y partidos de la modalidad.';
    }
    return '¿Deseas confirmar este cambio de estado?';
  }

  private confirmarCambioEstado(nuevoEstado: string, estadoAnterior: string) {
    this.crud.actualizar({ ...this.torneo, estadoTorneo: nuevoEstado }, 'torneo').subscribe({
      next: (torneoActualizado: Torneo) => {
        this.torneo = torneoActualizado;
        const debeArmar = (nuevoEstado === EstadoTorneo.INSCRIPCIONES || nuevoEstado === EstadoTorneo.INSCRIPCIONES_ACTIVO) &&
          estadoAnterior !== nuevoEstado;
        if (debeArmar && this.torneo.id) {
          this.router.navigateByUrl('/auth/torneos/torneo/' + this.torneo.id + '/cambio-fase');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.mensajeError = err.error?.message || 'No se pudo cambiar el estado del torneo.';
        this.setOpen(true);
        this.torneo.estadoTorneo = estadoAnterior as any;
      }
    });
  }
  setOpen(isOpen: boolean) {
    this.isAlertOpen = isOpen;
  }
  handleRefresh(event: any) {
    setTimeout(() => {
      this.ngOnInit();
      (event.target as HTMLIonRefresherElement).complete();
    }, 2000);
  }
}

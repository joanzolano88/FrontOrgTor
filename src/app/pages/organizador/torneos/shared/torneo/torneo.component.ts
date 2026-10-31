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
  puedeRegistrarEquipos = false;
  torneo: Torneo = new Torneo();
  estadoSeleccionado: EstadoTorneo = EstadoTorneo.INSCRIPCIONES;
  listCancha: Cancha[] = [];
  documento: string = "";
  isAlertOpen = false;
  alertButtons = ['Aceptar'];
  mensajeError: string = "";
  identificacionAyudante = '';
  ayudantes: any[] = [];
  cargandoAyudantes = false;
  generandoPartidos = false;
  constructor(private crud: CrudService, private route: ActivatedRoute,
    private router: Router, private alertController: AlertController) {
  }
  ngOnInit(): void {
    this.crud.obtenerParametro(this.route.snapshot.paramMap.get('idTorneo'), "torneo").subscribe((respT: Torneo) =>{
      this.torneo = respT;
      this.estadoSeleccionado = respT.estadoTorneo || EstadoTorneo.INSCRIPCIONES;
      const usuario = this.crud.obtenerUsuario();
      this.esPropietario = this.validarOrganizador && this.torneo.encargadoTorneo?.id === usuario?.id;
      if (this.esPropietario) {
        this.puedeRegistrarEquipos = true;
      } else if (this.torneo.id && usuario?.id) {
        this.crud.obtener(`torneo/${this.torneo.id}/puede-registrar-equipos`).subscribe({
          next: (puede: unknown) => this.puedeRegistrarEquipos = puede === true,
          error: () => this.puedeRegistrarEquipos = false
        });
      }
      if (this.esPropietario && this.torneo.id && usuario?.id) this.cargarAyudantes(this.torneo.id, usuario.id);
      this.crud.obtener('cancha/torneo/' + this.torneo.id).subscribe((respC: Cancha[]) =>{
        this.listCancha = respC;
      });
      /*this.crud.obtenerParametro(this.torneo.id,'torneo/reglamento').subscribe((resp: Reglamento) =>{
        this.documento = resp.reglamento!;
      });*/
    });
  }
  abrirEstadisticas() {
    this.router.navigateByUrl('/auth/torneos/torneo/' + this.torneo.id + '/estadisticas');
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
  registrarEquipoPlanilla() {
    this.router.navigateByUrl('/auth/torneos/torneo/' + this.torneo.id + '/registro-planilla');
  }
  cargarAyudantes(torneoId: number, usuarioId: number) {
    this.cargandoAyudantes = true;
    this.crud.obtenerAyudantesTorneo(torneoId, usuarioId).subscribe({
      next: ayudantes => {
        this.ayudantes = ayudantes || [];
        this.cargandoAyudantes = false;
      },
      error: error => {
        this.ayudantes = [];
        this.cargandoAyudantes = false;
        this.mensajeError = error?.error?.message || 'No se pudieron cargar los ayudantes.';
        this.setOpen(true);
      }
    });
  }
  agregarAyudante() {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !this.torneo.id || !this.identificacionAyudante.trim()) return;
    this.crud.agregarAyudanteTorneo(this.torneo.id, usuarioId, this.identificacionAyudante.trim()).subscribe({
      next: () => {
        this.identificacionAyudante = '';
        this.cargarAyudantes(this.torneo.id!, usuarioId);
      },
      error: error => {
        this.mensajeError = error?.error?.message || 'No se pudo agregar el ayudante.';
        this.setOpen(true);
      }
    });
  }
  eliminarAyudante(ayudanteUsuarioId: number) {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !this.torneo.id) return;
    this.crud.eliminarAyudanteTorneo(this.torneo.id, ayudanteUsuarioId, usuarioId).subscribe({
      next: () => this.cargarAyudantes(this.torneo.id!, usuarioId),
      error: error => {
        this.mensajeError = error?.error?.message || 'No se pudo quitar el ayudante.';
        this.setOpen(true);
      }
    });
  }
  async generarPartidos(): Promise<void> {
    if (!this.esPropietario || !this.torneo.id || this.generandoPartidos) return;

    const confirmacion = await this.alertController.create({
      header: 'Generar partidos',
      message: '¿Deseas generar los partidos pendientes de la fase actual?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Generar', role: 'confirm' }
      ]
    });
    await confirmacion.present();
    const { role } = await confirmacion.onDidDismiss();
    if (role !== 'confirm') return;

    this.generandoPartidos = true;
    this.crud.obtener(`partido/generar_partidos/${this.torneo.id}`).subscribe({
      next: (partidos: unknown) => {
        this.generandoPartidos = false;
        const cantidadGenerada = Array.isArray(partidos) ? partidos.length : 0;
        void this.mostrarResultadoPartidos(
          cantidadGenerada > 0 ? 'Partidos generados' : 'Sin partidos pendientes',
          cantidadGenerada > 0
            ? `Se generaron ${cantidadGenerada} partido${cantidadGenerada === 1 ? '' : 's'}.`
            : 'Ya no hay partidos por generar.'
        );
      },
      error: (error: HttpErrorResponse) => {
        this.generandoPartidos = false;
        void this.mostrarResultadoPartidos(
          'No se pudieron generar los partidos',
          error.error?.message || 'Ocurrió un error al generar los partidos.'
        );
      }
    });
  }

  private async mostrarResultadoPartidos(header: string, message: string): Promise<void> {
    const resultado = await this.alertController.create({
      header,
      message,
      buttons: ['Aceptar']
    });
    await resultado.present();
  }
  solicitarEquipo() {
    if (!this.crud.verSesion()) {
      this.mensajeError = 'Debes registrarte o iniciar sesión para postular un equipo.';
      this.setOpen(true);
      return;
    }
    this.router.navigateByUrl('/auth/torneos/torneo/' + this.torneo.id + '/solicitar-equipo');
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
  async cambiarEstadoTorneo() {
    if (!this.esPropietario) return;
    const nuevoEstado = this.estadoSeleccionado;
    const estadoAnterior = this.torneo.estadoTorneo;
    if (!nuevoEstado || nuevoEstado === estadoAnterior) return;
    if (this.torneo.estadoTorneo === EstadoTorneo.FINALIZADO) {
      this.mensajeError = 'El torneo ya está finalizado y no admite modificaciones.';
      this.setOpen(true);
      this.estadoSeleccionado = EstadoTorneo.FINALIZADO;
      return;
    }
    const estadoActual = estadoAnterior as string;
    const esEstadoInscripcionActivo = estadoActual === EstadoTorneo.INSCRIPCIONES_ACTIVO || estadoActual === 'INSCRIPCIONES_ACRIVO';
    if (nuevoEstado === EstadoTorneo.INSCRIPCIONES && !esEstadoInscripcionActivo && this.torneo.estadoTorneo !== EstadoTorneo.INSCRIPCIONES) {
      this.mensajeError = 'No se puede devolver el torneo a INSCRIPCIONES desde otro estado.';
      this.setOpen(true);
      this.estadoSeleccionado = this.torneo.estadoTorneo || EstadoTorneo.INSCRIPCIONES;
      return;
    }
    const alerta = await this.alertController.create({
      header: 'Cambiar estado del torneo',
      message: this.mensajeCambioEstado(nuevoEstado),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.estadoSeleccionado = this.torneo.estadoTorneo || EstadoTorneo.INSCRIPCIONES;
          }
        },
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
        this.estadoSeleccionado = torneoActualizado.estadoTorneo || nuevoEstado as EstadoTorneo;
        const debeArmar = (nuevoEstado === EstadoTorneo.INSCRIPCIONES || nuevoEstado === EstadoTorneo.INSCRIPCIONES_ACTIVO) &&
          estadoAnterior !== nuevoEstado;
        if (debeArmar && this.torneo.id) {
          this.router.navigateByUrl('/auth/torneos/torneo/' + this.torneo.id + '/cambio-fase');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.mensajeError = err.error?.message || 'No se pudo cambiar el estado del torneo.';
        this.setOpen(true);
        this.estadoSeleccionado = estadoAnterior as EstadoTorneo;
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

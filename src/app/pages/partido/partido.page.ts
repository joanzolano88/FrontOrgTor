import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';
import { EstadoPartido } from 'src/enums/EstadoPartido';
import { Partido } from 'src/models/Partido';
import { AlertController, IonButton } from '@ionic/angular';
import { ModalidadFase } from 'src/enums/ModalidadFase';
import { FaseActual } from 'src/enums/FaseActual';
import { SesionService } from 'src/app/services/restriccion/sesion.service';
import { ConvocatoriaPartido } from 'src/models/ConvocatoriaPartido';
import { Equipo } from 'src/models/Equipo';
import { Jugador } from 'src/models/Jugador';
import { TipoUsuario } from 'src/enums/TipoUsuario';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { EventoPartido, TipoEventoPartido } from 'src/models/EventoPartido';

@Component({
  selector: 'app-partido',
  templateUrl: './partido.page.html',
  styleUrls: ['./partido.page.scss'],
  standalone: false
})
export class PartidoPage implements OnInit {
  partido: Partido = new Partido();
  equipoAnotacion: string = "";
  ubucacionCancha: string = "";
  estadoTiempoPArtido: string = "";
  nombreEquipoAnotacion?: string;
  validarOrganizador: boolean = false;
  public alertButtons = [
    {
      text: 'No',
      role: 'cancel',
    },
    {
      text: 'Si',
      role: 'confirm',
    },
  ];
  public alertButtonsPenalties = [
    {
      text: 'Local',
      role: 'local',
    },
    {
      text: 'Visitante',
      role: 'visitante',
    },
    {
      text: 'Cancel',
      role: 'cancel',
    },
  ];
  public alertInputs: any = [
    {
      type: 'number',
      placeholder: 'Equipo Local',
      min: 1,
      max: 100,
    },
    {
      type: 'number',
      placeholder: 'Equipo Visitante',
      min: 1,
      max: 100,
    },
  ];
  url: string = "";
  urlBack: string = "";
  isAlertOpen = false;
  mensajeError = '';
  convocatorias: ConvocatoriaPartido[] = [];
  jugadoresDisponibles: Jugador[] = [];
  equipoConvocatoria?: Equipo;
  cedulaJugador = '';
  enlaceInvitacion = '';
  convocatoriaModalOpen = false;
  eventos: EventoPartido[] = [];
  sancionesTorneo: any[] = [];
  jugadorEvento?: Jugador;
  minutoEvento = 0;
  eventoModalOpen = false;
  perfilJugadorModalOpen = false;
  perfilJugador?: Jugador;
  perfilJugadorData: any;
  titularCambio?: ConvocatoriaPartido;
  suplenteCambio?: ConvocatoriaPartido;

  constructor(private crud: CrudService, private route: ActivatedRoute,
    private router: Router, private sesionService: SesionService, private alertController: AlertController) {
    this.validarOrganizador = sesionService.validacionOrganizador();
    this.url =  router.url;
    if (!this.url.includes("auth/partidos")) {
      this.urlBack = "/auth/partidos"
    } else {
      this.urlBack = "/auth/partidos"
    }
  }
  ngOnInit() {
    let idPartido = this.route.snapshot.paramMap.get('idPartido');
    this.crud.obtenerParametro(idPartido,"partido").subscribe((resp: Partido) =>{
      this.partido = resp;
      this.validarOrganizador = this.esOrganizadorDelTorneo();
      this.cargarConvocatorias();
      this.cambiarEquipoConvocatoria();
      this.cargarEventos();
      if (this.partido.torneo?.id) this.cargarSanciones(this.partido.torneo.id);
      console.log(this.partido);
      
      this.alertButtonsPenalties[0].text = this.partido.equipoLocal?.nombre!;
      this.alertButtonsPenalties[1].text = this.partido.equipoVisitante?.nombre!;
      this.alertInputs[0].placeholder = 'Goles ' + this.partido.equipoLocal?.nombre!;
      this.alertInputs[1].placeholder = 'Goles ' + this.partido.equipoVisitante?.nombre!;
      this.alertInputs[0].value = this.partido.anotacionesEquipoLocal!;
      this.alertInputs[1].value = this.partido.anotacionesEquipoVisitante!;
    }, error => this.mostrarError(error));
  }
  cargarConvocatorias() {
    if (!this.partido.id) return;
    this.crud.obtener(`partido/${this.partido.id}/convocados`).subscribe((resp: ConvocatoriaPartido[]) => this.convocatorias = resp || [], error => this.mostrarError(error));
  }
  cargarSanciones(idTorneo: number) {
    this.crud.obtenerSancionesTorneo(idTorneo).subscribe(resp => this.sancionesTorneo = resp || [], error => this.mostrarError(error));
  }
  sancionActiva(jugador?: Jugador): any {
    return this.sancionesTorneo.find(sancion => sancion.activa && sancion.jugador?.id === jugador?.id);
  }
  modificarSancionJugador(levantar: boolean, jugador = this.jugadorEvento) {
    const usuarioId = this.crud.obtenerUsuario().id;
    const jugadorId = jugador?.id;
    if (!usuarioId || !this.partido.id || !jugadorId) return;
    this.crud.modificarSancionPartido(this.partido.id, jugadorId, usuarioId, levantar).subscribe({
      next: () => this.cargarSanciones(this.partido.torneo!.id!),
      error: error => this.mostrarError(error)
    });
  }
  abrirConvocatoria() {
    this.convocatoriaModalOpen = true;
    this.cambiarEquipoConvocatoria();
  }
  cerrarConvocatoria() {
    this.convocatoriaModalOpen = false;
  }
  seleccionarTitularCambio(convocatoria: ConvocatoriaPartido) {
    this.titularCambio = convocatoria;
  }
  seleccionarSuplenteCambio(convocatoria: ConvocatoriaPartido) {
    this.suplenteCambio = convocatoria;
  }
  realizarCambio() {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !this.partido.id || !this.titularCambio?.id || !this.suplenteCambio?.id) {
      this.mostrarError({ error: { message: 'Selecciona un titular y un suplente del mismo equipo.' } });
      return;
    }
    this.crud.sustituirJugador(this.partido.id, this.titularCambio.id, this.suplenteCambio.id, usuarioId).subscribe({
      next: () => { this.titularCambio = undefined; this.suplenteCambio = undefined; this.cargarConvocatorias(); this.cargarEventos(); },
      error: error => this.mostrarError(error)
    });
  }
  titulares(): ConvocatoriaPartido[] {
    return this.convocatorias.filter(convocatoria => convocatoria.titular);
  }
  jugadoresPartido(): ConvocatoriaPartido[] {
    return this.convocatorias.filter(convocatoria => !convocatoria.titular);
  }
  convocatoriasEquipo(equipo?: Equipo): ConvocatoriaPartido[] {
    return this.convocatorias.filter(convocatoria => convocatoria.jugador?.equipo?.id === equipo?.id);
  }
  jugadoresEquipo(equipo?: Equipo): ConvocatoriaPartido[] {
    return this.convocatoriasEquipo(equipo).filter(convocatoria => !convocatoria.titular);
  }
  titularesEquipo(equipo?: Equipo): ConvocatoriaPartido[] {
    return this.convocatoriasEquipo(equipo).filter(convocatoria => convocatoria.titular);
  }
  moverJugador(evento: CdkDragDrop<ConvocatoriaPartido[]>, titular: boolean) {
    const convocatoria = evento.item.data as ConvocatoriaPartido;
    if (convocatoria.titular !== titular) this.cambiarTitular(convocatoria, titular);
  }
  abrirEventos(convocatoria: ConvocatoriaPartido) {
    if (!this.validarOrganizador || !convocatoria.jugador) return;
    this.jugadorEvento = convocatoria.jugador;
    this.eventoModalOpen = true;
  }
  cerrarEventos() {
    this.eventoModalOpen = false;
  }
  abrirPerfilJugador(jugador?: Jugador) {
    if (!jugador?.id) return;
    this.perfilJugador = jugador;
    this.perfilJugadorModalOpen = true;
    this.crud.obtenerPerfilJugador(jugador.id, this.partido.torneo?.id).subscribe(resp => this.perfilJugadorData = resp, error => this.mostrarError(error));
  }
  cerrarPerfilJugador() { this.perfilJugadorModalOpen = false; }
  estadisticaJugador(tipo: string): number {
    return this.eventos.filter(evento => evento.jugador?.id === this.perfilJugador?.id && evento.tipo === tipo).length;
  }
  abrirEquipo(equipo?: Equipo) {
    if (equipo?.id && this.partido.torneo?.id) this.router.navigateByUrl(`/auth/torneos/torneo/${this.partido.torneo.id}/equipo/${equipo.id}`);
  }
  cambiarNumeroUniforme(convocatoria: ConvocatoriaPartido) {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !convocatoria.id || convocatoria.numeroUniforme === undefined) return;
    this.crud.actualizar(null, `partido/convocados/${convocatoria.id}/numero?numero=${convocatoria.numeroUniforme}&usuarioId=${usuarioId}`).subscribe(resp => convocatoria.numeroUniforme = (resp as ConvocatoriaPartido).numeroUniforme, error => this.mostrarError(error));
  }
  equiposDelPartido(): Equipo[] {
    return [this.partido.equipoLocal, this.partido.equipoVisitante].filter((equipo): equipo is Equipo => !!equipo);
  }
  puedeGestionarConvocatoria(): boolean {
    const usuario = this.crud.obtenerUsuario();
    if (this.validarOrganizador) return true;
    if (usuario.tipoUsuario !== TipoUsuario.DELEGADO || !this.equipoConvocatoria?.delegado) return false;
    return usuario.numeroCelular === this.equipoConvocatoria.delegado.numeroCelular;
  }
  cambiarEquipoConvocatoria() {
    const usuario = this.crud.obtenerUsuario();
    if (usuario.tipoUsuario === TipoUsuario.DELEGADO) {
      this.equipoConvocatoria = this.equiposDelPartido().find(equipo => equipo.delegado?.numeroCelular === usuario.numeroCelular);
    }
    if (!this.equipoConvocatoria && this.equiposDelPartido().length) this.equipoConvocatoria = this.equiposDelPartido()[0];
    if (this.equipoConvocatoria?.id) {
      this.crud.obtener(`partido/${this.partido.id}/jugadores-disponibles/${this.equipoConvocatoria.id}`).subscribe((resp: Jugador[]) => this.jugadoresDisponibles = resp || [], error => this.mostrarError(error));
    }
  }
  agregarJugador(jugador: Jugador, titular = false) {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !this.partido.id || !jugador.id) return;
    this.crud.crear({}, `partido/${this.partido.id}/convocados?jugadorId=${jugador.id}&titular=${titular}&usuarioId=${usuarioId}`).subscribe(() => this.cargarConvocatorias(), error => this.mostrarError(error));
  }
  estaConvocado(jugador?: Jugador): boolean {
    return !!jugador?.id && this.convocatorias.some(convocatoria => convocatoria.jugador?.id === jugador.id);
  }
  async agregarPorCedula() {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !this.partido.id || !this.cedulaJugador.trim()) {
      this.mostrarError({ error: { message: 'Ingresa la cédula del jugador.' } });
      return;
    }
    this.crud.obtener(`partido/${this.partido.id}/jugador/cedula/${encodeURIComponent(this.cedulaJugador.trim())}?usuarioId=${usuarioId}`).subscribe(async (jugador: any) => {
      const alerta = await this.alertController.create({
        header: 'Confirmar jugador',
        message: `Nombre: ${jugador.nombre || '-'}<br>Cédula: ${jugador.cedula || this.cedulaJugador}<br>Equipo: ${jugador.equipo?.nombre || '-'}`,
        buttons: [{ text: 'Cancelar', role: 'cancel' }, { text: 'Agregar', role: 'confirm', handler: () => this.agregarJugador(jugador) }]
      });
      await alerta.present();
    }, error => this.mostrarError(error));
  }
  cambiarTitular(convocatoria: ConvocatoriaPartido, titular = !convocatoria.titular) {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !convocatoria.id) return;
    this.crud.actualizar(null, `partido/convocados/${convocatoria.id}/titular?titular=${titular}&usuarioId=${usuarioId}`).subscribe(() => { this.cargarConvocatorias(); this.cargarEventos(); }, error => this.mostrarError(error));
  }
  eliminarConvocatoria(convocatoria: ConvocatoriaPartido) {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !convocatoria.id) return;
    this.crud.borrarConUsuario(convocatoria.id, 'partido/convocados', usuarioId).subscribe(() => this.cargarConvocatorias(), error => this.mostrarError(error));
  }
  validarTitulares() {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !this.partido.id) return;
    this.crud.crear({}, `partido/${this.partido.id}/convocados/validar?usuarioId=${usuarioId}`).subscribe(() => this.mostrarError({ error: { message: 'Lista de titulares válida.' } }), error => this.mostrarError(error));
  }
  generarInvitacion() {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !this.partido.id || !this.equipoConvocatoria?.id) return;
    this.crud.crear({}, `partido/${this.partido.id}/invitacion?equipoId=${this.equipoConvocatoria.id}&usuarioId=${usuarioId}`).subscribe((invitacion: any) => {
      this.enlaceInvitacion = `${window.location.origin}/auth/invitacion/${invitacion.token}`;
      navigator.clipboard?.writeText(this.enlaceInvitacion);
    }, error => this.mostrarError(error));
  }
  cargarEventos() {
    if (!this.partido.id) return;
    this.crud.obtener(`partido/${this.partido.id}/eventos`).subscribe((resp: EventoPartido[]) => this.eventos = resp || [], error => this.mostrarError(error));
  }
  eventosJugadorSeleccionado(): EventoPartido[] {
    return this.eventos.filter(evento => evento.jugador?.id === this.jugadorEvento?.id);
  }
  registrarEvento(tipo: TipoEventoPartido) {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !this.partido.id || !this.jugadorEvento?.id) return;
    this.crud.crear({}, `partido/${this.partido.id}/eventos?jugadorId=${this.jugadorEvento.id}&tipo=${tipo}&minuto=${this.minutoEvento}&usuarioId=${usuarioId}`).subscribe(() => {
      if (tipo === 'GOL') {
        const esLocal = this.jugadorEvento?.equipo?.id === this.partido.equipoLocal?.id;
        if (esLocal) this.partido.anotacionesEquipoLocal = (this.partido.anotacionesEquipoLocal || 0) + 1;
        else this.partido.anotacionesEquipoVisitante = (this.partido.anotacionesEquipoVisitante || 0) + 1;
        this.actualizarPartido();
      }
      this.cargarEventos();
    }, error => this.mostrarError(error));
  }
  mostrarEscudo(imagen: any) {
    return imagen ? 'data:image/png;base64,' + imagen : '';
  }
  eventosPartido(btn: IonButton) {
    if (!this.validarOrganizador) {
      this.mostrarError({ error: { message: 'Solo el organizador de este torneo puede iniciar o terminar el partido.' } });
      return;
    }
    if (this.partido?.estadoPartido == EstadoPartido.PROGRAMADO) {
      this.crud.actualizar(this.partido, 'partido/iniciar/' + this.partido.id).subscribe((resp: Partido) =>{
        this.partido = resp;
      }, error => this.mostrarError(error));
    } else if (this.partido?.estadoPartido == EstadoPartido.EN_PROCESO) {
      if (this.partido.torneo?.modalidadEliminatorias == ModalidadFase.PARTIDO_UNICO && this.partido.anotacionesEquipoLocal == this.partido.anotacionesEquipoVisitante && 
        this.partido.penaltisEquipoLocal == this.partido.penaltisEquipoVisitante && this.partido.torneo.faseTorneo != FaseActual.FASE_GRUPOS && this.partido.torneo.faseTorneo != FaseActual.ELIMINATORIAS_GRUPOS) {
        btn['el'].click();
      } else if (this.partido.torneo?.modalidadEliminatorias == ModalidadFase.IDA_VUELTA && this.partido.anotacionesEquipoLocal == this.partido.anotacionesEquipoVisitante) {
        this.mostrarError({ error: { message: 'No se puede terminar una eliminatoria ida y vuelta empatada desde este partido.' } });
      } else if (this.partido.torneo?.modalidadEliminatorias == ModalidadFase.PARTIDO_UNICO && (this.partido.anotacionesEquipoLocal != this.partido.anotacionesEquipoVisitante || 
        this.partido.penaltisEquipoLocal != this.partido.penaltisEquipoVisitante)) {
          this.terminarPartido();
      }
    }
  }
  textoBtnoPartido() {
    if (this.partido?.estadoPartido == EstadoPartido.PROGRAMADO) {
      return 'Iniciar Partido'
    }
    return 'Terminar Partido'
  }
  
  colorEstadoPartido(partido: Partido){
    let color = "";    
    switch (partido.estadoPartido) {
      case EstadoPartido.PENDIENTE:
        color = "danger"
        break;
      case EstadoPartido.PROGRAMADO:
        color = "primary"
        break;
      case EstadoPartido.EN_PROCESO:
        color = "success"
        break;
      case EstadoPartido.TERMINADO:
        color = "medium"
        break;
      default:
        color = "warning"
        break;
    }
    return color;
  }
  sumarGol(equipo: string, btn: IonButton, nombreEquipo: string | undefined) {
    if (this.partido?.estadoPartido == EstadoPartido.EN_PROCESO && this.validarOrganizador) {
      this.nombreEquipoAnotacion = nombreEquipo;
      this.equipoAnotacion = equipo;
      btn['el'].click();
    }
  }
  anotarGol(ev: any) {
    if (ev.detail.role == 'confirm' && this.equipoAnotacion == "anotacionesEquipoLocal") {
      this.partido!.anotacionesEquipoLocal! += 1;
      this.actualizarPartido();
    } else if (ev.detail.role == 'confirm' && this.equipoAnotacion == "anotacionesEquipoVisitante") {
      this.partido!.anotacionesEquipoVisitante! += 1;
      this.actualizarPartido();
    }
  }
  gandorPenaltis(ev: any) {
    if (ev.detail.role == 'local') {
      this.terminarPartidoPenaltis('L');
    } else if (ev.detail.role == 'visitante') {
      this.terminarPartidoPenaltis('V');
    }
  }
  actualizarPartido() {
    this.crud.actualizar(this.partido, 'partido/sumar_gol').subscribe((resp: Partido) =>{
      this.partido = resp;
    }, error => this.mostrarError(error));
  }
  modalModificarMarcador(btn: IonButton) {
    btn['el'].click();
  }
  terminarPartido() {
    this.crud.actualizar(this.partido, 'partido/terminar/' + this.partido!.id).subscribe((resp: Partido) =>{
      this.partido = resp;
    }, error => this.mostrarError(error));
  }
  terminarPartidoPenaltis(ganador: string) {
    this.crud.actualizar(this.partido, 'partido/terminar-penaltis/' + this.partido!.id + '/' + ganador).subscribe((resp: Partido) =>{
      this.partido = resp;
    }, error => this.mostrarError(error));
  }
  verUbicacion(btn: IonButton) {
    this.ubucacionCancha = this.partido?.cancha?.nombre + " Direccion: " + this.partido?.cancha?.direccion;
    btn['el'].click();
  }
  modalUbicacion(ev: any) {
    if (ev.detail.role == 'confirm') {
      window.open('https://maps.google.com/?q=' + this.partido!.cancha!.latitud + ',' + this.partido!.cancha!.longitud, '_blank');
    }
  }
  modificarPartido(ev: any) {
    
    if (ev.detail.role == 'confirm') {
      this.partido!.anotacionesEquipoLocal = ev.detail.data.values[0];
      this.partido!.anotacionesEquipoVisitante = ev.detail.data.values[1];
      this.crud.actualizar(this.partido, 'partido/modificar-marcador').subscribe((resp: Partido) =>{
        this.partido = resp;
      }, error => this.mostrarError(error));
    }
  }
  esOrganizadorDelTorneo(): boolean {
    const usuario = this.crud.obtenerUsuario();
    return this.sesionService.validacionOrganizador() && usuario.id === this.partido.torneo?.encargadoTorneo?.id;
  }
  mostrarError(error: any) {
    this.mensajeError = error?.error?.message || 'No se pudo actualizar el partido.';
    this.isAlertOpen = true;
  }
  cerrarError() {
    this.isAlertOpen = false;
  }
}
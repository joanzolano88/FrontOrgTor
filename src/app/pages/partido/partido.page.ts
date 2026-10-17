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
  ubucacionCancha: string = "";
  estadoTiempoPArtido: string = "";
  equipoObjetivoGol?: Equipo;
  tipoGol: 'GOL' | 'AUTOGOL' = 'GOL';
  jugadorGolId?: number;
  asistenciaGolId?: number;
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
  identificacionJugador = '';
  busquedaAlineacion = '';
  enlaceInvitacion = '';
  convocatoriaModalOpen = false;
  listasTitularesModalOpen = false;
  cambioModalOpen = false;
  eventos: EventoPartido[] = [];
  sancionesTorneo: any[] = [];
  jugadorEvento?: Jugador;
  minutoEvento = 0;
  eventoModalOpen = false;
  registroGolModalOpen = false;
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
      const usuarioId = this.crud.obtenerUsuario().id;
      this.validarOrganizador = false;
      if (usuarioId && resp.id) {
        this.crud.puedeGestionarPartido(resp.id, usuarioId).subscribe(permitido => this.validarOrganizador = permitido);
      }
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
    this.listasTitularesModalOpen = false;
  }
  abrirListasTitulares() {
    this.listasTitularesModalOpen = true;
    this.cambiarEquipoConvocatoria();
  }
  cerrarListasTitulares() {
    this.listasTitularesModalOpen = false;
  }
  abrirCambio(convocatoria: ConvocatoriaPartido) {
    if (this.partido.estadoPartido !== 'EN_PROCESO' || !this.validarOrganizador || !convocatoria.titular) return;
    this.titularCambio = convocatoria;
    this.suplenteCambio = undefined;
    this.cambioModalOpen = true;
  }
  cerrarCambio() {
    this.cambioModalOpen = false;
    this.titularCambio = undefined;
    this.suplenteCambio = undefined;
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
      next: () => { this.cerrarCambio(); this.cargarConvocatorias(); this.cargarEventos(); },
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
    const equipoId = this.idRelacion(equipo);
    if (!equipoId) return [];
    return this.convocatorias.filter(convocatoria =>
      this.idRelacion(convocatoria.jugador?.equipo) === equipoId);
  }
  jugadoresEquipo(equipo?: Equipo): ConvocatoriaPartido[] {
    return this.convocatoriasEquipo(equipo).filter(convocatoria => !convocatoria.titular);
  }
  titularesEquipo(equipo?: Equipo): ConvocatoriaPartido[] {
    return this.convocatoriasEquipo(equipo).filter(convocatoria => convocatoria.titular);
  }
  suplentesEquipo(equipo?: Equipo): ConvocatoriaPartido[] {
    return this.convocatoriasEquipo(equipo).filter(convocatoria => !convocatoria.titular);
  }
  convocadosEquipoActual(): number {
    return this.convocatoriasEquipo(this.equipoConvocatoria).length;
  }
  titularesEquipoActual(): number {
    return this.titularesEquipo(this.equipoConvocatoria).length;
  }
  suplentesEquipoActual(): number {
    return this.suplentesEquipo(this.equipoConvocatoria).length;
  }
  maximoTitulares(): number {
    return this.partido.torneo?.deporte?.maximoTitulares || 11;
  }
  maximoConvocados(): number {
    return this.partido.torneo?.deporte?.maximoConvocados || 22;
  }
  porcentajeTitulares(): number {
    return Math.min(this.titularesEquipoActual() / this.maximoTitulares() * 100, 100);
  }
  jugadoresDisponiblesAlineacion(): Jugador[] {
    const query = this.busquedaAlineacion.trim().toLocaleLowerCase();
    return this.jugadoresDisponibles.filter(jugador => {
      const coincideBusqueda = !query ||
        jugador.nombre?.toLocaleLowerCase().includes(query) ||
        jugador.identificacion?.toLocaleLowerCase().includes(query);
      return coincideBusqueda && !this.estaConvocado(jugador);
    });
  }
  private idRelacion(relacion: unknown): number | undefined {
    const id = typeof relacion === 'object' && relacion !== null && 'id' in relacion
      ? relacion.id
      : relacion;
    const idNumerico = Number(id);
    return Number.isFinite(idNumerico) && idNumerico > 0 ? idNumerico : undefined;
  }
  pasarATitular(jugador?: Jugador) {
    if (!jugador?.id || !this.validarOrganizador || this.partido.estadoPartido !== 'PROGRAMADO') return;
    const convocatoria = this.convocatorias.find(item => this.idRelacion(item.jugador) === Number(jugador.id));
    if (convocatoria) {
      this.cambiarTitular(convocatoria, true);
      return;
    }
    this.agregarJugador(jugador, true);
  }
  pasarASuplente(convocatoria: ConvocatoriaPartido) {
    if (!this.validarOrganizador || this.partido.estadoPartido !== 'PROGRAMADO') return;
    this.cambiarTitular(convocatoria, false);
  }
  filasAlineacion(equipo?: Equipo): ConvocatoriaPartido[][] {
    const titulares = this.titularesEquipo(equipo);
    if (!titulares.length) return [];
    const filas: ConvocatoriaPartido[][] = [[], [], []];
    titulares.forEach((convocatoria, index) => filas[index % filas.length].push(convocatoria));
    return filas.filter(fila => fila.length > 0);
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
  abrirEventosJugador(jugador?: Jugador) {
    const convocatoria = this.convocatorias.find(item =>
      item.jugador?.id === jugador?.id &&
      item.jugador?.equipo?.id === this.equipoConvocatoria?.id);
    if (convocatoria) this.abrirEventos(convocatoria);
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
      this.jugadoresDisponibles = [];
      this.crud.obtener(`partido/${this.partido.id}/jugadores-disponibles/${this.equipoConvocatoria.id}`).subscribe((resp: Jugador[]) => this.jugadoresDisponibles = resp || [], error => this.mostrarError(error));
    }
  }
  agregarJugador(jugador: Jugador, titular = false) {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !this.partido.id || !jugador.id) return;
    this.crud.crear({}, `partido/${this.partido.id}/convocados?jugadorId=${jugador.id}&titular=${titular}&usuarioId=${usuarioId}`).subscribe(() => this.cargarConvocatorias(), error => this.mostrarError(error));
  }
  estaConvocado(jugador?: Jugador): boolean {
    return !!jugador?.id && this.convocatorias.some(convocatoria =>
      this.idRelacion(convocatoria.jugador) === Number(jugador.id));
  }
  async agregarPorIdentificacion() {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !this.partido.id || !this.identificacionJugador.trim()) {
      this.mostrarError({ error: { message: 'Ingresa la identificación del jugador.' } });
      return;
    }
    this.crud.obtener(`partido/${this.partido.id}/jugador/identificacion/${encodeURIComponent(this.identificacionJugador.trim())}?usuarioId=${usuarioId}`).subscribe(async (jugador: any) => {
      const alerta = await this.alertController.create({
        header: 'Confirmar jugador',
        message: `Nombre: ${jugador.nombre || '-'}<br>Identificación: ${jugador.identificacion || this.identificacionJugador}<br>Equipo: ${jugador.equipo?.nombre || '-'}`,
        buttons: [{ text: 'Cancelar', role: 'cancel' }, { text: 'Agregar', role: 'confirm', handler: () => this.agregarJugador(jugador) }]
      });
      await alerta.present();
    }, error => this.mostrarError(error));
  }
  buscarPorIdentificacionDesdeBusqueda() {
    this.identificacionJugador = this.busquedaAlineacion.trim();
    this.agregarPorIdentificacion();
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
  registrarEvento(tipo: 'TARJETA_AMARILLA' | 'TARJETA_ROJA') {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !this.partido.id || !this.jugadorEvento?.id) return;
    this.crud.crear({}, `partido/${this.partido.id}/eventos?jugadorId=${this.jugadorEvento.id}&tipo=${tipo}&minuto=${this.minutoEvento}&usuarioId=${usuarioId}`).subscribe(() => {
      this.cargarEventos();
    }, error => this.mostrarError(error));
  }
  nombreEvento(tipo?: TipoEventoPartido): string {
    switch (tipo) {
      case 'GOL': return 'Gol';
      case 'AUTOGOL': return 'Autogol';
      case 'ASISTENCIA': return 'Asistencia';
      case 'TARJETA_AMARILLA': return 'Tarjeta amarilla';
      case 'TARJETA_ROJA': return 'Tarjeta roja';
      case 'ENTRA_TITULAR': return 'Entra al partido';
      case 'SALE_TITULAR': return 'Sale del partido';
      default: return tipo || 'Evento';
    }
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
      const usuarioId = this.crud.obtenerUsuario().id;
      this.crud.actualizar(this.partido, `partido/iniciar/${this.partido.id}?usuarioId=${usuarioId}`).subscribe((resp: Partido) =>{
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
  sumarGol(equipo?: Equipo) {
    if (this.partido.estadoPartido !== EstadoPartido.EN_PROCESO || !this.validarOrganizador || !equipo?.id) return;
    this.equipoObjetivoGol = equipo;
    this.tipoGol = 'GOL';
    this.jugadorGolId = undefined;
    this.asistenciaGolId = undefined;
    this.minutoEvento = 0;
    this.registroGolModalOpen = true;
  }
  cerrarRegistroGol() {
    this.registroGolModalOpen = false;
  }
  cambiarTipoGol(tipo: 'GOL' | 'AUTOGOL') {
    this.tipoGol = tipo;
    this.jugadorGolId = undefined;
    this.asistenciaGolId = undefined;
  }
  jugadoresParaGol(): ConvocatoriaPartido[] {
    const equipoId = this.tipoGol === 'AUTOGOL'
      ? this.equiposDelPartido().find(equipo => equipo.id !== this.equipoObjetivoGol?.id)?.id
      : this.equipoObjetivoGol?.id;
    return this.convocatoriasEquipo(this.equiposDelPartido().find(equipo => equipo.id === equipoId));
  }
  jugadoresParaAsistencia(): ConvocatoriaPartido[] {
    return this.convocatoriasEquipo(this.equipoObjetivoGol)
      .filter(convocatoria => convocatoria.jugador?.id !== this.jugadorGolId);
  }
  registrarGol() {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !this.partido.id || !this.equipoObjetivoGol?.id || !this.jugadorGolId) {
      this.mostrarError({ error: { message: 'Selecciona el jugador que realizó el gol.' } });
      return;
    }
    if (this.tipoGol === 'AUTOGOL' && this.asistenciaGolId) {
      this.mostrarError({ error: { message: 'Un autogol no puede tener asistencia.' } });
      return;
    }
    const solicitud = {
      equipoAnotadorId: this.equipoObjetivoGol.id,
      jugadorId: this.jugadorGolId,
      asistenciaId: this.tipoGol === 'GOL' ? this.asistenciaGolId || null : null,
      autogol: this.tipoGol === 'AUTOGOL',
      minuto: this.minutoEvento
    };
    this.crud.crear(solicitud, `partido/${this.partido.id}/goles`).subscribe((resp: Partido) => {
      this.partido = resp;
      this.registroGolModalOpen = false;
      this.jugadorEvento = undefined;
      this.cargarEventos();
    }, error => this.mostrarError(error));
  }
  gandorPenaltis(ev: any) {
    if (ev.detail.role == 'local') {
      this.terminarPartidoPenaltis('L');
    } else if (ev.detail.role == 'visitante') {
      this.terminarPartidoPenaltis('V');
    }
  }
  modalModificarMarcador(btn: IonButton) {
    btn['el'].click();
  }
  terminarPartido() {
    const usuarioId = this.crud.obtenerUsuario().id;
    this.crud.actualizar(this.partido, `partido/terminar/${this.partido!.id}?usuarioId=${usuarioId}`).subscribe((resp: Partido) =>{
      this.partido = resp;
    }, error => this.mostrarError(error));
  }
  terminarPartidoPenaltis(ganador: string) {
    const usuarioId = this.crud.obtenerUsuario().id;
    this.crud.actualizar(this.partido, `partido/terminar-penaltis/${this.partido!.id}/${ganador}?usuarioId=${usuarioId}`).subscribe((resp: Partido) =>{
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
      const usuarioId = this.crud.obtenerUsuario().id;
      this.crud.actualizar(this.partido, `partido/modificar-marcador?usuarioId=${usuarioId}`).subscribe((resp: Partido) =>{
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
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
import { JugadorDisponiblePartido } from 'src/models/JugadorDisponiblePartido';
import { TipoUsuario } from 'src/enums/TipoUsuario';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { EventoPartido, TipoEventoPartido } from 'src/models/EventoPartido';

interface FormacionPartido {
  equipoId: number;
  formacion: string;
}

interface SolicitudCambioPartido {
  id: number;
  equipoId: number;
  nombreEquipo: string;
  titularId: number;
  suplenteId?: number | null;
  jugadorId?: number | null;
  numeroUniforme: number;
  minuto: number;
  estado: string;
}

interface PosicionAlineacion {
  convocatoria?: ConvocatoriaPartido;
  portero: boolean;
  indice: number;
}

type VistaPartido = 'alineacion' | 'eventos';

interface SancionPartido {
  jugador?: { id?: number; nombre?: string };
  activa: boolean;
  partidosPendientes: number;
  permanente: boolean;
  exencionPartidoId?: number | null;
}

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
  jugadoresDisponibles: JugadorDisponiblePartido[] = [];
  jugadoresPorEquipo: Record<number, JugadorDisponiblePartido[]> = {};
  solicitudesCambio: SolicitudCambioPartido[] = [];
  solicitudesPropias: SolicitudCambioPartido[] = [];
  equipoConvocatoria?: Equipo;
  identificacionJugador = '';
  busquedaAlineacion = '';
  enlaceInvitacion = '';
  convocatoriaModalOpen = false;
  listasTitularesModalOpen = false;
  cambioModalOpen = false;
  accionesJugadorModalOpen = false;
  abrirCambioDespuesDeAcciones = false;
  posicionVaciaModalOpen = false;
  posicionVaciaEquipo?: Equipo;
  posicionVaciaIndice?: number;
  cargandoJugadoresPosicionVacia = false;
  jugadoresPosicionVacia: JugadorDisponiblePartido[] = [];
  jugadorPosicionVaciaSeleccionado?: JugadorDisponiblePartido;
  numeroUniformePosicionVacia: number | null = null;
  cargandoSuplentesCambio = false;
  jugadoresInscritosEquipoCambio: JugadorDisponiblePartido[] = [];
  eventos: EventoPartido[] = [];
  sancionesTorneo: SancionPartido[] = [];
  jugadorEvento?: Jugador;
  minutoEvento = 0;
  registroGolModalOpen = false;
  perfilJugadorModalOpen = false;
  perfilJugador?: Jugador;
  perfilJugadorData: any;
  titularCambio?: ConvocatoriaPartido;
  suplenteCambio?: JugadorDisponiblePartido;
  numeroUniformeCambio: number | null = null;
  minutoCambio = 0;
  numerosUniformeDisponibles: Record<number, number | null> = {};
  convocatoriaAcciones?: ConvocatoriaPartido;
  formacionesPorEquipo: Record<number, string> = {};
  readonly formacionesDisponibles = ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '4-1-4-1', '4-5-1'];
  convocatoriaPosicionSeleccionada?: ConvocatoriaPartido;
  intercambiandoPosiciones = false;
  vistaPartido: VistaPartido = 'alineacion';
  modoCambiarPosiciones = false;
  golPenalti = false;
  tarjetaRojaDobleAmarilla = false;

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
        this.crud.puedeGestionarPartido(resp.id, usuarioId).subscribe({
          next: permitido => {
            this.validarOrganizador = permitido;
            if (permitido || this.esDelegado()) this.cargarSolicitudesCambio();
          },
          error: error => this.mostrarError(error)
        });
      }
      this.cargarConvocatorias();
      this.cargarFormaciones();
      this.cambiarEquipoConvocatoria();
      this.cargarJugadoresDeAmbosEquipos();
      this.cargarEventos();
      this.cargarSanciones();
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
  cargarSolicitudesCambio() {
    if (!this.partido.id || (!this.validarOrganizador && !this.esDelegado())) return;
    this.crud.obtener(`partido/${this.partido.id}/solicitudes-sustitucion`).subscribe({
      next: (resp: SolicitudCambioPartido[]) => {
        this.solicitudesCambio = resp || [];
        this.solicitudesPropias = this.solicitudesCambio.filter(item => item.estado === 'PENDIENTE');
      },
      error: error => this.mostrarError(error)
    });
  }
  solicitudesPendientes(): SolicitudCambioPartido[] {
    return this.solicitudesCambio.filter(item => item.estado === 'PENDIENTE');
  }
  puedeRevisarCambios(): boolean {
    return this.validarOrganizador;
  }
  nombreJugadorSolicitudSalida(solicitud: SolicitudCambioPartido): string {
    return this.convocatorias.find(item => Number(item.id) === Number(solicitud.titularId))?.jugador?.nombre || 'Titular';
  }
  nombreJugadorSolicitudEntrada(solicitud: SolicitudCambioPartido): string {
    const incomingId = solicitud.jugadorId ?? solicitud.suplenteId;
    const byPlayer = Object.keys(this.jugadoresPorEquipo).reduce<JugadorDisponiblePartido[]>(
      (all, key) => all.concat(this.jugadoresPorEquipo[Number(key)] || []), [])
      .find(item => Number(item.id) === Number(incomingId));
    if (byPlayer?.nombre) return byPlayer.nombre;
    return this.convocatorias.find(item => Number(item.id) === Number(incomingId))?.jugador?.nombre || 'Suplente';
  }
  decidirSolicitud(solicitudId: number, aprobar: boolean) {
    if (!solicitudId) return;
    const accion = aprobar ? 'aprobar' : 'rechazar';
    this.crud.actualizar(null, `partido/solicitudes-sustitucion/${solicitudId}/${accion}`).subscribe({
      next: () => {
        this.cargarSolicitudesCambio();
        if (aprobar) {
          this.cargarConvocatorias();
          this.cargarEventos();
        }
      },
      error: error => this.mostrarError(error)
    });
  }
  cargarFormaciones() {
    if (!this.partido.id) return;
    this.crud.obtener(`partido/${this.partido.id}/formaciones`).subscribe((resp: FormacionPartido[]) => {
      this.formacionesPorEquipo = {};
      (resp || []).forEach(item => this.formacionesPorEquipo[item.equipoId] = item.formacion);
    }, error => this.mostrarError(error));
  }
  cargarJugadoresDeAmbosEquipos() {
    if (!this.partido.id) return;
    this.jugadoresPorEquipo = {};
    this.equiposDelPartido().forEach(equipo => {
      if (!equipo.id) return;
      this.crud.obtener(`partido/${this.partido.id}/jugadores-disponibles/${equipo.id}`).subscribe({
        next: (jugadores: JugadorDisponiblePartido[]) => {
          this.jugadoresPorEquipo[equipo.id!] = jugadores || [];
        },
        error: error => this.mostrarError(error)
      });
    });
  }
  formacionEquipo(equipo?: Equipo): string {
    const equipoId = this.idRelacion(equipo);
    return equipoId ? this.formacionesPorEquipo[equipoId] || '4-4-2' : '4-4-2';
  }
  esDelegado(): boolean {
    return this.crud.obtenerUsuario().tipoUsuario === TipoUsuario.DELEGADO;
  }
  seleccionarFormacion(equipo: Equipo | undefined, formacion: string) {
    const usuarioId = this.crud.obtenerUsuario().id;
    const equipoId = this.idRelacion(equipo);
    if (!usuarioId || !this.partido.id || !equipoId || !this.puedeModificarTactica(equipo) ||
        this.partido.estadoPartido === 'TERMINADO' || !this.formacionesDisponibles.includes(formacion)) return;
    this.crud.actualizar(null, `partido/${this.partido.id}/equipos/${equipoId}/formacion?formacion=${encodeURIComponent(formacion)}&usuarioId=${usuarioId}`).subscribe({
      next: () => {
        this.formacionesPorEquipo[equipoId] = formacion;
        this.convocatoriaPosicionSeleccionada = undefined;
        this.titularesEquipo(equipo)
          .sort((a, b) => (a.posicionAlineacion ?? Number.MAX_SAFE_INTEGER) - (b.posicionAlineacion ?? Number.MAX_SAFE_INTEGER) || (a.id ?? 0) - (b.id ?? 0))
          .forEach((convocatoria, index) => convocatoria.posicionAlineacion = index);
      },
      error: error => this.mostrarError(error)
    });
  }
  cargarSanciones() {
    if (!this.partido.id) return;
    this.crud.obtenerSancionesPartido(this.partido.id).subscribe((resp: SancionPartido[]) => this.sancionesTorneo = resp || [], error => this.mostrarError(error));
  }
  sancionActiva(jugador?: Jugador): SancionPartido | undefined {
    return this.sancionesTorneo.find(sancion => sancion.activa && sancion.jugador?.id === jugador?.id);
  }
  puedeTitularizar(jugador: Jugador): boolean {
    const sancion = this.sancionActiva(jugador);
    return (!sancion || sancion.exencionPartidoId === this.partido.id) &&
      this.titularesEquipoActual() < this.maximoTitulares() &&
      this.convocadosEquipoActual() < this.maximoConvocados();
  }
  modificarSancionJugador(levantar: boolean, jugador = this.jugadorEvento) {
    const usuarioId = this.crud.obtenerUsuario().id;
    const jugadorId = jugador?.id;
    if (!usuarioId || !this.partido.id || !jugadorId) return;
    this.crud.modificarSancionPartido(this.partido.id, jugadorId, usuarioId, levantar).subscribe({
      next: () => this.cargarSanciones(),
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
    const gestorDelegado = this.esDelegado() && this.puedeGestionarEquipo(this.equipoDeConvocatoria(convocatoria));
    if (this.partido.estadoPartido !== 'EN_PROCESO' ||
        (!this.validarOrganizador && !gestorDelegado) || !convocatoria.titular) return;
    this.equipoConvocatoria = this.equipoDeConvocatoria(convocatoria);
    if (!this.equipoConvocatoria?.id || !this.partido.id) return;
    this.titularCambio = convocatoria;
    this.suplenteCambio = undefined;
    this.numeroUniformeCambio = null;
    this.minutoCambio = 0;
    this.cargandoSuplentesCambio = true;
    this.jugadoresInscritosEquipoCambio = [];
    this.crud.obtener(`partido/${this.partido.id}/jugadores-disponibles/${this.equipoConvocatoria.id}`)
      .subscribe({
        next: (jugadores: JugadorDisponiblePartido[]) => {
          this.jugadoresInscritosEquipoCambio = jugadores || [];
          this.cargandoSuplentesCambio = false;
        },
        error: error => {
          this.cargandoSuplentesCambio = false;
          this.mostrarError(error);
        }
      });
    if (this.accionesJugadorModalOpen) {
      this.abrirCambioDespuesDeAcciones = true;
      this.accionesJugadorModalOpen = false;
    } else {
      this.cambioModalOpen = true;
    }
  }
  abrirAccionesAlineacion(convocatoria: ConvocatoriaPartido) {
    const delegadoPropio = this.esDelegado() && this.puedeGestionarEquipo(this.equipoDeConvocatoria(convocatoria));
    if (this.partido.estadoPartido !== 'EN_PROCESO' ||
        (!this.validarOrganizador && !delegadoPropio) || !convocatoria.jugador) return;
    this.convocatoriaAcciones = convocatoria;
    this.jugadorEvento = {
      id: convocatoria.jugador.id,
      nombre: convocatoria.jugador.nombre,
      identificacion: convocatoria.jugador.identificacion
    };
    this.minutoEvento = 0;
    this.tarjetaRojaDobleAmarilla = false;
    this.accionesJugadorModalOpen = true;
  }
  seleccionarJugadorParaCambiarPosicion(convocatoria: ConvocatoriaPartido) {
    if (!this.puedeCambiarPosicionesEnJuego() ||
        !this.puedeModificarTactica(this.equipoDeConvocatoria(convocatoria)) ||
        !convocatoria.id) return;
    this.modoCambiarPosiciones = true;
    this.convocatoriaPosicionSeleccionada = convocatoria;
    this.accionesJugadorModalOpen = false;
    this.convocatoriaAcciones = undefined;
  }
  puedeAbrirAccionesDesdePerfil(): boolean {
    if (this.partido.estadoPartido !== 'EN_PROCESO' || !this.perfilJugador?.id) return false;
    const convocatoria = this.convocatorias.find(item =>
      Number(item.jugador?.id) === Number(this.perfilJugador?.id));
    return !!convocatoria && (this.validarOrganizador ||
      (this.esDelegado() && this.puedeGestionarEquipo(this.equipoDeConvocatoria(convocatoria))));
  }
  abrirAccionesDesdePerfil() {
    if (!this.perfilJugador?.id || !this.puedeAbrirAccionesDesdePerfil()) return;
    const convocatoria = this.convocatorias.find(item =>
      Number(item.jugador?.id) === Number(this.perfilJugador?.id));
    if (!convocatoria) return;
    this.perfilJugadorModalOpen = false;
    this.abrirAccionesAlineacion(convocatoria);
  }
  cerrarAccionesAlineacion() {
    this.accionesJugadorModalOpen = false;
    this.convocatoriaAcciones = undefined;
    if (this.abrirCambioDespuesDeAcciones) {
      this.abrirCambioDespuesDeAcciones = false;
      this.cambioModalOpen = true;
    }
  }
  clickJugadorAlineacion(convocatoria: ConvocatoriaPartido) {
    if (this.partido.estadoPartido === 'PROGRAMADO' ||
        (this.partido.estadoPartido === 'EN_PROCESO' && this.modoCambiarPosiciones)) {
      this.seleccionarPosicion(convocatoria);
    } else {
      this.abrirPerfilJugador(convocatoria.jugador);
    }
  }
  alternarModoPosiciones() {
    this.modoCambiarPosiciones = !this.modoCambiarPosiciones;
    this.convocatoriaPosicionSeleccionada = undefined;
  }
  anotarGolDeJugador(autogol: boolean) {
    if (!this.validarOrganizador || this.partido.estadoPartido !== 'EN_PROCESO') return;
    const convocatoria = this.convocatoriaAcciones;
    const equipoJugador = this.equipoDeConvocatoria(convocatoria);
    const equipoAnotador = autogol
      ? this.equiposDelPartido().find(equipo => this.idRelacion(equipo) !== this.idRelacion(equipoJugador))
      : equipoJugador;
    if (!convocatoria?.jugador?.id || !equipoAnotador?.id) return;
    this.equipoObjetivoGol = equipoAnotador;
    this.tipoGol = autogol ? 'AUTOGOL' : 'GOL';
    this.jugadorGolId = convocatoria.jugador.id;
    this.asistenciaGolId = undefined;
    this.golPenalti = false;
    this.registroGolModalOpen = true;
    this.cerrarAccionesAlineacion();
  }
  cerrarCambio() {
    this.cambioModalOpen = false;
    this.titularCambio = undefined;
    this.suplenteCambio = undefined;
    this.numeroUniformeCambio = null;
    this.jugadoresInscritosEquipoCambio = [];
  }
  suplentesDisponiblesCambio(): JugadorDisponiblePartido[] {
    const titularesIds = new Set(this.titularesEquipo(this.equipoConvocatoria)
      .map(convocatoria => Number(convocatoria.jugador?.id)));
    const sancionadosIds = new Set(this.sancionesTorneo
      .filter(sancion => sancion.activa &&
        sancion.exencionPartidoId !== this.partido.id &&
        (sancion.permanente || sancion.partidosPendientes > 0))
      .map(sancion => Number(sancion.jugador?.id)));
    const expulsadosIds = new Set(this.eventos
      .filter(evento => evento.tipo === 'TARJETA_ROJA')
      .map(evento => Number(evento.jugadorId)));
    return this.jugadoresInscritosEquipoCambio.filter(jugador =>
      !!jugador.id &&
      !titularesIds.has(Number(jugador.id)) &&
      !sancionadosIds.has(Number(jugador.id)) &&
      !expulsadosIds.has(Number(jugador.id)));
  }
  seleccionarSuplenteCambio(jugador: JugadorDisponiblePartido) {
    this.suplenteCambio = jugador;
    const convocatoria = this.convocatorias.find(item => Number(item.jugador?.id) === Number(jugador.id));
    this.numeroUniformeCambio = convocatoria?.numeroUniforme ?? jugador.numeroCamiseta ?? null;
  }
  numeroUniformeCambioValido(): boolean {
    const numero = this.numeroUniformeCambio;
    return numero !== null && Number.isInteger(Number(numero)) && Number(numero) >= 0 && Number(numero) <= 99 &&
      !this.numeroUniformeEnUso(this.equipoConvocatoria, Number(numero), this.suplenteCambio?.id);
  }
  minutoCambioValido(): boolean {
    return Number.isInteger(Number(this.minutoCambio)) && Number(this.minutoCambio) >= 0;
  }
  realizarCambio() {
    const usuarioId = this.crud.obtenerUsuario().id;
    const numeroUniforme = this.numeroUniformeCambio === null ? null : Number(this.numeroUniformeCambio);
    const minuto = Number(this.minutoCambio);
    if (!usuarioId || !this.partido.id || !this.titularCambio?.id || !this.suplenteCambio?.id ||
        !this.numeroUniformeCambioValido() || numeroUniforme === null || !this.minutoCambioValido()) {
      this.mostrarError({ error: { message: 'Selecciona un suplente, asigna un número único entre 0 y 99 e indica un minuto válido.' } });
      return;
    }
    if (this.esDelegado()) {
      this.crud.crear({
        titularId: this.titularCambio.id,
        jugadorId: this.suplenteCambio.id,
        numeroUniforme,
        minuto
      }, `partido/${this.partido.id}/solicitudes-sustitucion`).subscribe({
        next: () => {
          this.cerrarCambio();
          this.cargarSolicitudesCambio();
        },
        error: error => this.mostrarError(error)
      });
      return;
    }
    this.crud.sustituirJugadorInscrito(this.partido.id, this.titularCambio.id, this.suplenteCambio.id, numeroUniforme, minuto, usuarioId).subscribe({
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
      this.idRelacion(convocatoria.equipo) === equipoId ||
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
  jugadoresDisponiblesAlineacion(): JugadorDisponiblePartido[] {
    const query = this.busquedaAlineacion.trim().toLocaleLowerCase();
    return this.jugadoresDisponibles.filter(jugador => {
      const coincideBusqueda = !query ||
        jugador.nombre?.toLocaleLowerCase().includes(query) ||
        jugador.identificacion?.toLocaleLowerCase().includes(query);
      return coincideBusqueda && !this.estaConvocado(jugador);
    });
  }
  jugadoresSuplentesEquipo(equipo?: Equipo): JugadorDisponiblePartido[] {
    const equipoId = this.idRelacion(equipo);
    if (!equipoId) return [];
    const titulares = new Set(this.titularesEquipo(equipo).map(item => Number(item.jugador?.id)));
    const disponibles = this.jugadoresPorEquipo[equipoId] || [];
    const suplentesConvocados = this.convocatoriasEquipo(equipo)
      .filter(item => !item.titular && item.jugador?.id)
      .map(item => ({
        id: item.jugador!.id,
        nombre: item.jugador!.nombre,
        identificacion: item.jugador!.identificacion,
        numeroCamiseta: item.numeroUniforme ?? item.jugador!.numeroCamiseta
      }));
    const jugadores = new Map<number, JugadorDisponiblePartido>();
    [...suplentesConvocados, ...disponibles].forEach(jugador => {
      if (jugador.id && !titulares.has(Number(jugador.id))) {
        jugadores.set(Number(jugador.id), jugador);
      }
    });
    return [...jugadores.values()].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
  }
  numeroUniformeEnUso(equipo: Equipo | undefined, numero: number, jugadorId?: number): boolean {
    return this.convocatoriasEquipo(equipo).some(item =>
      Number(item.jugador?.id) !== Number(jugadorId) &&
      Number(item.numeroUniforme ?? item.jugador?.numeroCamiseta) === numero);
  }
  eventosEquipo(equipo?: Equipo): EventoPartido[] {
    return this.eventos
      .filter(evento => evento.tipo !== 'ASISTENCIA' && evento.tipo !== 'SALE_TITULAR' &&
        (evento.equipoId ?? this.idRelacion(this.equipoDeJugadorId(evento.jugadorId))) === this.idRelacion(equipo))
      .map(evento => {
        if (evento.tipo !== 'ENTRA_TITULAR') return evento;
        const salida = this.eventos.find(item => item.tipo === 'SALE_TITULAR' &&
          item.minuto === evento.minuto &&
          (item.equipoId ?? this.idRelacion(this.equipoDeJugadorId(item.jugadorId))) === this.idRelacion(equipo));
        return salida ? Object.assign(new EventoPartido(), evento, { jugadorSaleId: salida.jugadorId }) : evento;
      })
      .sort((a, b) => (a.minuto ?? 0) - (b.minuto ?? 0) || (a.id ?? 0) - (b.id ?? 0));
  }
  private equipoDeJugadorId(jugadorId?: number): Equipo | undefined {
    return this.convocatorias.find(item => Number(item.jugador?.id) === Number(jugadorId))
      ? this.equipoDeConvocatoria(this.convocatorias.find(item => Number(item.jugador?.id) === Number(jugadorId)))
      : undefined;
  }
  eventosIconosJugador(jugadorId?: number): EventoPartido[] {
    return this.eventos
      .filter(evento => Number(evento.jugadorId) === Number(jugadorId))
      .sort((a, b) => (a.minuto ?? 0) - (b.minuto ?? 0));
  }
  nombreJugadorEvento(jugadorId?: number): string {
    return this.convocatorias.find(item => Number(item.jugador?.id) === Number(jugadorId))?.jugador?.nombre || 'Jugador';
  }
  nombreEventoConGol(evento: EventoPartido): string {
    const asistidorId = evento.asistidorId ??
      this.eventos.find(item => item.tipo === 'ASISTENCIA' && item.minuto === evento.minuto &&
        this.idRelacion(this.equipoDeJugadorId(item.jugadorId)) === this.idRelacion(this.equipoDeJugadorId(evento.jugadorId)))?.jugadorId;
    const asistidor = asistidorId ? ` (${this.nombreJugadorEvento(asistidorId)})` : '';
    const autogol = evento.tipo === 'AUTOGOL' ? ' (A)' : '';
    const penalti = evento.penalti ? ' (P)' : '';
    return `${this.nombreJugadorEvento(evento.jugadorId)}${asistidor}${autogol}${penalti}`;
  }
  abrirPerfilPorId(jugadorId?: number) {
    if (!jugadorId) return;
    const convocatoria = this.convocatorias.find(item => Number(item.jugador?.id) === Number(jugadorId));
    const disponible = Object.keys(this.jugadoresPorEquipo).reduce<JugadorDisponiblePartido[]>(
      (all, key) => all.concat(this.jugadoresPorEquipo[Number(key)] || []), [])
      .find(item => Number(item.id) === Number(jugadorId));
    const jugador = convocatoria?.jugador || Object.assign(new Jugador(), {
      id: jugadorId,
      nombre: disponible?.nombre,
      identificacion: disponible?.identificacion,
      numeroCamiseta: disponible?.numeroCamiseta
    });
    this.abrirPerfilJugador(jugador);
  }
  private idRelacion(relacion: unknown): number | undefined {
    const id = typeof relacion === 'object' && relacion !== null && 'id' in relacion
      ? relacion.id
      : relacion;
    const idNumerico = Number(id);
    return Number.isFinite(idNumerico) && idNumerico > 0 ? idNumerico : undefined;
  }
  numeroUniformeDisponible(jugador: { id?: number; numeroCamiseta?: number }): number | null {
    if (jugador.id === undefined) return null;
    return Object.prototype.hasOwnProperty.call(this.numerosUniformeDisponibles, jugador.id)
      ? this.numerosUniformeDisponibles[jugador.id]
      : jugador.numeroCamiseta ?? null;
  }
  actualizarNumeroUniformeDisponible(jugador: JugadorDisponiblePartido, numero: number | null) {
    if (jugador.id !== undefined) this.numerosUniformeDisponibles[jugador.id] = numero === null ? null : Number(numero);
  }
  numeroUniformeValido(numero: number | null | undefined): boolean {
    return numero !== null && numero !== undefined &&
      Number.isInteger(Number(numero)) && Number(numero) >= 0 && Number(numero) <= 99;
  }
  numeroUniformeConvocatoria(convocatoria: ConvocatoriaPartido): number | undefined {
    const numero = convocatoria.numeroUniforme ?? convocatoria.jugador?.numeroCamiseta;
    return this.numeroUniformeValido(numero) ? Number(numero) : undefined;
  }
  pasarATitular(jugador?: Jugador) {
    if (!jugador?.id || !this.validarOrganizador || this.partido.estadoPartido !== 'PROGRAMADO') return;
    const numeroUniforme = this.numeroUniformeDisponible(jugador);
    if (!this.numeroUniformeValido(numeroUniforme) || numeroUniforme === null) {
      this.mostrarError({ error: { message: 'Asigna un número de uniforme entero entre 0 y 99 antes de titularizar al jugador.' } });
      return;
    }
    const convocatoria = this.convocatorias.find(item => this.idRelacion(item.jugador) === Number(jugador.id));
    if (convocatoria) {
      this.cambiarTitular(convocatoria, true, numeroUniforme);
      return;
    }
    this.agregarJugador(jugador, true, numeroUniforme);
  }
  pasarASuplente(convocatoria: ConvocatoriaPartido) {
    if (!this.validarOrganizador || this.partido.estadoPartido !== 'PROGRAMADO') return;
    this.cambiarTitular(convocatoria, false);
  }
  filasAlineacion(equipo?: Equipo): PosicionAlineacion[][] {
    const lineas = [1, ...this.formacionEquipo(equipo).split('-').map(Number)];
    const totalPosiciones = lineas.reduce((total, cantidad) => total + cantidad, 0);
    const posiciones = this.posicionesEfectivasEquipo(equipo, totalPosiciones);
    const titularesPorId = new Map(
      this.titularesEquipo(equipo)
        .filter(convocatoria => convocatoria.id !== undefined)
        .map(convocatoria => [convocatoria.id!, convocatoria])
    );
    const convocatoriaPorPosicion = new Map<number, ConvocatoriaPartido>();
    posiciones.forEach((posicion, convocatoriaId) => {
      const convocatoria = titularesPorId.get(convocatoriaId);
      if (convocatoria) convocatoriaPorPosicion.set(posicion, convocatoria);
    });
    const filas: PosicionAlineacion[][] = [];
    let inicio = 0;
    for (const cantidad of lineas) {
      const fila: PosicionAlineacion[] = [];
      for (let indice = inicio; indice < inicio + cantidad; indice++) {
        fila.push({
          convocatoria: convocatoriaPorPosicion.get(indice),
          portero: indice === 0,
          indice
        });
      }
      filas.push(fila);
      inicio += cantidad;
    }
    return filas;
  }
  trackByPosicion(_index: number, posicion: PosicionAlineacion): number | string {
    return posicion.convocatoria?.id ?? `empty-${posicion.indice}`;
  }
  private posicionesEfectivasEquipo(equipo: Equipo | undefined, totalPosiciones: number): Map<number, number> {
    const titulares = [...this.titularesEquipo(equipo)]
      .sort((a, b) => (a.posicionAlineacion ?? Number.MAX_SAFE_INTEGER) - (b.posicionAlineacion ?? Number.MAX_SAFE_INTEGER) || (a.id ?? 0) - (b.id ?? 0));
    const posiciones = new Map<number, number>();
    const posicionesOcupadas = new Set<number>();
    titulares.forEach(convocatoria => {
      if (!convocatoria.id) return;
      const posicion = convocatoria.posicionAlineacion;
      if (posicion !== undefined && posicion >= 0 && posicion < totalPosiciones && !posicionesOcupadas.has(posicion)) {
        posiciones.set(convocatoria.id, posicion);
        posicionesOcupadas.add(posicion);
        return;
      }
      let posicionLibre = 0;
      while (posicionLibre < totalPosiciones && posicionesOcupadas.has(posicionLibre)) posicionLibre++;
      if (posicionLibre < totalPosiciones) {
        posiciones.set(convocatoria.id, posicionLibre);
        posicionesOcupadas.add(posicionLibre);
      }
    });
    return posiciones;
  }
  moverAlineacionAVacia(equipo: Equipo | undefined, posicion: number) {
    const convocatoria = this.convocatoriaPosicionSeleccionada;
    const equipoId = this.idRelacion(equipo);
    if (!convocatoria?.id || !equipoId || this.intercambiandoPosiciones ||
        this.partido.estadoPartido === 'TERMINADO' || !this.puedeModificarTactica(equipo)) return;
    const convocatoriaEquipoId = this.idRelacion(convocatoria.equipo || convocatoria.jugador?.equipo);
    if (equipoId !== convocatoriaEquipoId) {
      this.convocatoriaPosicionSeleccionada = undefined;
      this.mostrarError({ error: { message: 'El jugador y la posición vacía deben pertenecer al mismo equipo.' } });
      return;
    }
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !this.partido.id) return;
    const totalPosiciones = [1, ...this.formacionEquipo(equipo).split('-').map(Number)]
      .reduce((total, cantidad) => total + cantidad, 0);
    const posicionActual = this.posicionesEfectivasEquipo(equipo, totalPosiciones).get(convocatoria.id);
    if (posicionActual === undefined || posicionActual === posicion) {
      this.convocatoriaPosicionSeleccionada = undefined;
      return;
    }
    const posicionAnterior = convocatoria.posicionAlineacion;
    convocatoria.posicionAlineacion = posicion;
    this.convocatoriaPosicionSeleccionada = undefined;
    this.intercambiandoPosiciones = true;
    this.crud.actualizar(null, `partido/${this.partido.id}/alineacion/mover-a-vacia?convocatoriaId=${convocatoria.id}&posicion=${posicion}&usuarioId=${usuarioId}`).subscribe({
      next: () => this.intercambiandoPosiciones = false,
      error: error => {
        convocatoria.posicionAlineacion = posicionAnterior;
        this.intercambiandoPosiciones = false;
        this.mostrarError(error);
      }
    });
  }
  clickPosicionVacia(equipo: Equipo | undefined, posicion: number) {
    if ((this.partido.estadoPartido === 'PROGRAMADO' || this.partido.estadoPartido === 'EN_PROCESO') &&
        this.modoCambiarPosiciones && this.convocatoriaPosicionSeleccionada) {
      this.moverAlineacionAVacia(equipo, posicion);
      return;
    }
    if (this.partido.estadoPartido !== 'PROGRAMADO' || !this.puedeGestionarEquipo(equipo) ||
        !this.partido.id || !equipo?.id) return;
    this.posicionVaciaEquipo = equipo;
    this.posicionVaciaIndice = posicion;
    this.posicionVaciaModalOpen = true;
    this.cargandoJugadoresPosicionVacia = !this.jugadoresPorEquipo[equipo.id];
    this.jugadoresPosicionVacia = this.jugadoresPorEquipo[equipo.id] || [];
    this.jugadorPosicionVaciaSeleccionado = undefined;
    this.numeroUniformePosicionVacia = null;
    if (this.cargandoJugadoresPosicionVacia) {
      this.crud.obtener(`partido/${this.partido.id}/jugadores-disponibles/${equipo.id}`).subscribe({
        next: (jugadores: JugadorDisponiblePartido[]) => {
          this.jugadoresPorEquipo[equipo.id!] = jugadores || [];
          this.jugadoresPosicionVacia = jugadores || [];
          this.cargandoJugadoresPosicionVacia = false;
        },
        error: error => {
          this.cargandoJugadoresPosicionVacia = false;
          this.mostrarError(error);
        }
      });
    }
  }
  jugadoresParaPosicionVacia(): JugadorDisponiblePartido[] {
    const titularesIds = new Set(this.titularesEquipo(this.posicionVaciaEquipo)
      .map(convocatoria => Number(convocatoria.jugador?.id)));
    const sancionadosIds = new Set(this.sancionesTorneo
      .filter(sancion => sancion.activa &&
        sancion.exencionPartidoId !== this.partido.id &&
        (sancion.permanente || sancion.partidosPendientes > 0))
      .map(sancion => Number(sancion.jugador?.id)));
    const expulsadosIds = new Set(this.eventos
      .filter(evento => evento.tipo === 'TARJETA_ROJA')
      .map(evento => Number(evento.jugadorId)));
    return this.jugadoresPosicionVacia.filter(jugador =>
      !!jugador.id &&
      !titularesIds.has(Number(jugador.id)) &&
      !sancionadosIds.has(Number(jugador.id)) &&
      !expulsadosIds.has(Number(jugador.id)));
  }
  seleccionarJugadorPosicionVacia(jugador: JugadorDisponiblePartido) {
    this.jugadorPosicionVaciaSeleccionado = jugador;
    const convocatoria = this.convocatorias.find(item => Number(item.jugador?.id) === Number(jugador.id));
    this.numeroUniformePosicionVacia = convocatoria?.numeroUniforme ?? jugador.numeroCamiseta ?? null;
  }
  numeroUniformePosicionVaciaValido(): boolean {
    const numero = this.numeroUniformePosicionVacia;
    return numero !== null && Number.isInteger(Number(numero)) && Number(numero) >= 0 && Number(numero) <= 99 &&
      !this.numeroUniformeEnUso(this.posicionVaciaEquipo, Number(numero), this.jugadorPosicionVaciaSeleccionado?.id);
  }
  agregarJugadorEnPosicionVacia() {
    const usuarioId = this.crud.obtenerUsuario().id;
    const jugador = this.jugadorPosicionVaciaSeleccionado;
    const numero = this.numeroUniformePosicionVacia === null ? null : Number(this.numeroUniformePosicionVacia);
    if (!usuarioId || !this.partido.id || !jugador?.id || this.posicionVaciaIndice === undefined ||
        !this.numeroUniformePosicionVaciaValido() || numero === null) {
      this.mostrarError({ error: { message: 'Selecciona un jugador y asigna un número de uniforme entre 0 y 99.' } });
      return;
    }
    this.crud.crear({}, `partido/${this.partido.id}/alineacion/ocupar-vacia?jugadorId=${jugador.id}&posicion=${this.posicionVaciaIndice}&numeroUniforme=${numero}&usuarioId=${usuarioId}`)
      .subscribe({
        next: () => {
          this.cerrarPosicionVacia();
          this.cargarConvocatorias();
          this.cargarEventos();
        },
        error: error => this.mostrarError(error)
      });
  }
  cerrarPosicionVacia() {
    this.posicionVaciaModalOpen = false;
    this.posicionVaciaEquipo = undefined;
    this.posicionVaciaIndice = undefined;
    this.jugadoresPosicionVacia = [];
    this.jugadorPosicionVaciaSeleccionado = undefined;
    this.numeroUniformePosicionVacia = null;
  }
  puedeGestionarEquipo(equipo?: Equipo): boolean {
    const usuario = this.crud.obtenerUsuario();
    if (usuario.tipoUsuario === TipoUsuario.DELEGADO) {
      return !!equipo?.delegado?.numeroCelular &&
        equipo.delegado.numeroCelular === usuario.numeroCelular;
    }
    return this.validarOrganizador;
  }
  puedeModificarTactica(equipo?: Equipo): boolean {
    if (this.partido.estadoPartido === 'EN_PROCESO') {
      return this.esDelegado() && this.puedeGestionarEquipo(equipo);
    }
    return this.puedeGestionarEquipo(equipo);
  }
  puedeCambiarPosicionesEnJuego(): boolean {
    return this.partido.estadoPartido === 'EN_PROCESO' &&
      this.esDelegado() &&
      this.equiposDelPartido().some(equipo => this.puedeGestionarEquipo(equipo));
  }
  seleccionarPosicion(convocatoria: ConvocatoriaPartido) {
    if (this.intercambiandoPosiciones || this.partido.estadoPartido === 'TERMINADO' || !convocatoria.id) return;
    const equipo = this.equiposDelPartido().find(item =>
      this.idRelacion(item) === this.idRelacion(convocatoria.equipo || convocatoria.jugador?.equipo));
    if (!this.puedeModificarTactica(equipo)) return;
    if (!this.convocatoriaPosicionSeleccionada) {
      this.convocatoriaPosicionSeleccionada = convocatoria;
      return;
    }
    if (this.convocatoriaPosicionSeleccionada.id === convocatoria.id) {
      this.convocatoriaPosicionSeleccionada = undefined;
      return;
    }
    const primera = this.convocatoriaPosicionSeleccionada;
    const equipoPrimero = this.equiposDelPartido().find(item =>
      this.idRelacion(item) === this.idRelacion(primera.equipo || primera.jugador?.equipo));
    const equipoSegundo = this.equiposDelPartido().find(item =>
      this.idRelacion(item) === this.idRelacion(convocatoria.equipo || convocatoria.jugador?.equipo));
    if (this.idRelacion(equipoPrimero) !== this.idRelacion(equipoSegundo)) {
      this.convocatoriaPosicionSeleccionada = undefined;
      this.mostrarError({ error: { message: 'Selecciona dos jugadores del mismo equipo para intercambiar sus posiciones.' } });
      return;
    }
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !this.partido.id || !primera.id) return;
    const totalPosiciones = [1, ...this.formacionEquipo(equipoPrimero).split('-').map(Number)]
      .reduce((total, cantidad) => total + cantidad, 0);
    const posiciones = this.posicionesEfectivasEquipo(equipoPrimero, totalPosiciones);
    const posicionPrimeraAnterior = primera.posicionAlineacion;
    const posicionSegundaAnterior = convocatoria.posicionAlineacion;
    const posicionPrimera = posiciones.get(primera.id);
    const posicionSegunda = posiciones.get(convocatoria.id);
    if (posicionPrimera === undefined || posicionSegunda === undefined) {
      this.convocatoriaPosicionSeleccionada = undefined;
      this.mostrarError({ error: { message: 'No se pudieron determinar las posiciones actuales. Recarga la alineación e inténtalo de nuevo.' } });
      return;
    }
    primera.posicionAlineacion = posicionSegunda;
    convocatoria.posicionAlineacion = posicionPrimera;
    this.convocatoriaPosicionSeleccionada = undefined;
    this.intercambiandoPosiciones = true;
    this.crud.crear({}, `partido/${this.partido.id}/alineacion/intercambiar?convocatoriaId1=${primera.id}&convocatoriaId2=${convocatoria.id}&usuarioId=${usuarioId}`).subscribe({
      next: () => {
        this.intercambiandoPosiciones = false;
        this.cargarConvocatorias();
      },
      error: error => {
        primera.posicionAlineacion = posicionPrimeraAnterior;
        convocatoria.posicionAlineacion = posicionSegundaAnterior;
        this.intercambiandoPosiciones = false;
        this.mostrarError(error);
      }
    });
  }
  moverJugador(evento: CdkDragDrop<ConvocatoriaPartido[]>, titular: boolean) {
    const convocatoria = evento.item.data as ConvocatoriaPartido;
    if (convocatoria.titular !== titular) this.cambiarTitular(convocatoria, titular);
  }
  abrirPerfilJugador(jugador?: Jugador) {
    if (!jugador?.id) return;
    this.perfilJugador = jugador;
    this.perfilJugadorModalOpen = true;
    this.crud.obtenerPerfilJugador(jugador.id, this.partido.torneo?.id).subscribe(resp => this.perfilJugadorData = resp, error => this.mostrarError(error));
  }
  cerrarPerfilJugador() { this.perfilJugadorModalOpen = false; }
  estadisticaJugador(tipo: string): number {
    return this.eventos.filter(evento => evento.jugadorId === this.perfilJugador?.id && evento.tipo === tipo).length;
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
  equipoDeConvocatoria(convocatoria?: ConvocatoriaPartido): Equipo | undefined {
    const equipoId = this.idRelacion(convocatoria?.equipo || convocatoria?.jugador?.equipo);
    return this.equiposDelPartido().find(equipo => this.idRelacion(equipo) === equipoId);
  }
  cambiarEquipoConvocatoria() {
    const usuario = this.crud.obtenerUsuario();
    if (usuario.tipoUsuario === TipoUsuario.DELEGADO) {
      this.equipoConvocatoria = this.equiposDelPartido().find(equipo => equipo.delegado?.numeroCelular === usuario.numeroCelular);
    }
    if (!this.equipoConvocatoria && this.equiposDelPartido().length) this.equipoConvocatoria = this.equiposDelPartido()[0];
    if (this.equipoConvocatoria?.id) {
      this.jugadoresDisponibles = [];
      this.crud.obtener(`partido/${this.partido.id}/jugadores-disponibles/${this.equipoConvocatoria.id}`).subscribe((resp: JugadorDisponiblePartido[]) => this.jugadoresDisponibles = resp || [], error => this.mostrarError(error));
    }
  }
  agregarJugador(jugador: Jugador, titular = false, numeroUniforme?: number) {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !this.partido.id || !jugador.id) return;
    if (titular && !this.numeroUniformeValido(numeroUniforme)) {
      this.mostrarError({ error: { message: 'El número de uniforme es obligatorio y debe estar entre 0 y 99.' } });
      return;
    }
    const numero = titular ? `&numeroUniforme=${numeroUniforme}` : '';
    this.crud.crear({}, `partido/${this.partido.id}/convocados?jugadorId=${jugador.id}&titular=${titular}${numero}&usuarioId=${usuarioId}`).subscribe(() => this.cargarConvocatorias(), error => this.mostrarError(error));
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
  cambiarTitular(convocatoria: ConvocatoriaPartido, titular = !convocatoria.titular, numeroUniforme?: number) {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !convocatoria.id) return;
    if (titular && !this.numeroUniformeValido(numeroUniforme)) {
      this.mostrarError({ error: { message: 'El número de uniforme es obligatorio y debe estar entre 0 y 99.' } });
      return;
    }
    const numero = titular ? `&numeroUniforme=${numeroUniforme}` : '';
    this.crud.actualizar(null, `partido/convocados/${convocatoria.id}/titular?titular=${titular}${numero}&usuarioId=${usuarioId}`).subscribe(() => { this.cargarConvocatorias(); this.cargarEventos(); }, error => this.mostrarError(error));
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
    return this.eventos.filter(evento => evento.jugadorId === this.jugadorEvento?.id);
  }
  registrarEvento(tipo: 'TARJETA_AMARILLA' | 'TARJETA_ROJA') {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!this.validarOrganizador || this.partido.estadoPartido !== 'EN_PROCESO' ||
        !usuarioId || !this.partido.id || !this.jugadorEvento?.id) return;
    const dobleAmarilla = tipo === 'TARJETA_ROJA' && this.tarjetaRojaDobleAmarilla;
    this.crud.crear({}, `partido/${this.partido.id}/eventos?jugadorId=${this.jugadorEvento.id}&tipo=${tipo}&minuto=${this.minutoEvento}&dobleAmarilla=${dobleAmarilla}&usuarioId=${usuarioId}`).subscribe({
      next: () => {
        this.cargarEventos();
        this.cargarSanciones();
        this.cerrarAccionesAlineacion();
      },
      error: error => this.mostrarError(error)
    });
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
  cerrarRegistroGol() {
    this.registroGolModalOpen = false;
  }
  cambiarTipoGol(tipo: 'GOL' | 'AUTOGOL') {
    this.tipoGol = tipo;
    this.jugadorGolId = undefined;
    this.asistenciaGolId = undefined;
    this.golPenalti = false;
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
    if (!this.validarOrganizador || this.partido.estadoPartido !== 'EN_PROCESO' ||
        !usuarioId || !this.partido.id || !this.equipoObjetivoGol?.id || !this.jugadorGolId) {
      this.mostrarError({ error: { message: 'No se puede registrar el gol. Selecciona un jugador en la alineación durante el partido.' } });
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
      penalti: this.tipoGol === 'GOL' && this.golPenalti,
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
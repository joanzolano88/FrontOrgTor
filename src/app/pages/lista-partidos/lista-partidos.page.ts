import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonModal } from '@ionic/angular';
import { CrudService } from 'src/app/services/crud.service';
import { EstadoPartido } from 'src/enums/EstadoPartido';
import { Cancha } from 'src/models/Cancha';
import { Equipo } from 'src/models/Equipo';
import { Partido } from 'src/models/Partido';
import { OverlayEventDetail } from '@ionic/core/components';
import { FaseActual } from 'src/enums/FaseActual';
import { Torneo } from 'src/models/Torneo';
import { ModalidadTorneo } from 'src/enums/ModalidadTorneo';
import { SesionService } from 'src/app/services/restriccion/sesion.service';


@Component({
  selector: 'app-lista-partidos',
  templateUrl: './lista-partidos.page.html',
  styleUrls: ['./lista-partidos.page.scss'],
  standalone: false
})
export class ListaPartidosPage implements OnInit{
  listaGruposPartidos: Partido[][] =[];
  listaCanchas: Cancha[] = [];
  partidoSeleccionado: Partido = new Partido();
  textoPartido: string = "";
  estadoPartido = EstadoPartido.PENDIENTE;
  filtroPartidos = 'PENDIENTES';
  sinProgramar = false;
  fasePartido = '';
  torneo: Torneo = new Torneo();
  idTorneo?: string;
  palabraBuscador?: string;
  faseActual: string[] = []
  estadosPartido: string[] = [
    EstadoPartido.PENDIENTE,EstadoPartido.PROGRAMADO,EstadoPartido.EN_PROCESO,
    EstadoPartido.TERMINADO,EstadoPartido.APLASADO,EstadoPartido.SUSPENDIDO
  ];
  @ViewChild(IonModal) modal!: IonModal;
  fecha?: Date;
  isAlertOpen = false;
  alertButtons = ['Aceptar'];
  mensajeError: string = "";

  constructor(private crud: CrudService, private route: ActivatedRoute, private router: Router,
    private sesionService: SesionService) { }
  ngOnInit(): void {
    this.idTorneo = this.route.snapshot.paramMap.get('idTorneo')!;
    this.crud.obtenerParametro(this.idTorneo, "torneo").subscribe((resp: Torneo) => {
      this.torneo = resp;
      this.fasePartido = this.torneo.faseTorneo!.toString();
      this.llenarListaFases();
      this.listaPartidos();
    });
    this.crud.obtener("cancha/torneo/" + this.idTorneo).subscribe((resp: Cancha[]) => {
      this.listaCanchas = resp;
    });
  }
  listaPartidos() {
    const estado = this.filtroPartidos === 'TODOS' || this.filtroPartidos === 'SIN_PROGRAMAR'
      ? 'TODOS'
      : EstadoPartido.PENDIENTE;
    const sinProgramar = this.filtroPartidos === 'SIN_PROGRAMAR';
    const equipo = encodeURIComponent(this.palabraBuscador || '');
    const url = `partido/torneo/fase/${this.idTorneo}/${this.fasePartido}?estado=${estado}&sinProgramar=${sinProgramar}&equipo=${equipo}`;
    this.crud.obtener(url).subscribe((resp: Partido[][]) => {
      this.listaGruposPartidos = resp;
    });
  }
  validacionEstadoPartido(listaPartidos: Partido[]) {
    return listaPartidos.length > 0;
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
        color = "dark"
        break;
      default:
        color = "warning"
        break;
    }
    return color;
  }
  ganadorPartido(partido: Partido): 'LOCAL' | 'VISITANTE' | '' {
    const golesLocal = partido.anotacionesEquipoLocal || 0;
    const golesVisitante = partido.anotacionesEquipoVisitante || 0;
    if (golesLocal > golesVisitante) return 'LOCAL';
    if (golesVisitante > golesLocal) return 'VISITANTE';
    const penaltisLocal = partido.penaltisEquipoLocal || 0;
    const penaltisVisitante = partido.penaltisEquipoVisitante || 0;
    if (penaltisLocal > 0 && penaltisLocal > penaltisVisitante) return 'LOCAL';
    if (penaltisVisitante > 0 && penaltisVisitante > penaltisLocal) return 'VISITANTE';
    return '';
  }
  selecionarFecha(btnModal: IonButton, partido: Partido) {    
    this.partidoSeleccionado = partido;
    if (this.partidoSeleccionado.cancha == undefined) {
      this.partidoSeleccionado.cancha = new Cancha();
    }
    if (this.partidoSeleccionado.estadoPartido == EstadoPartido.EN_PROCESO || this.partidoSeleccionado.estadoPartido == EstadoPartido.TERMINADO) {
      this.router.navigateByUrl('/auth/partidos/partido/' + this.partidoSeleccionado.id);
      return;
    }
    btnModal['el'].click()
    this.textoPartido = partido.equipoLocal?.nombre + " vs " + partido.equipoVisitante?.nombre;
  }
  asignarFecha() {
    this.crud.actualizar(this.partidoSeleccionado, "partido/asignar_fecha").subscribe((resp: Partido) => {
      this.partidoSeleccionado = resp;
      this.listaPartidos();
    }, error =>{
      this.mensajeError = error.error.message;
      this.setOpen(true);
    });
  }
  cancel() {
    this.modal.dismiss(null, 'cancel');
  }
  confirm() {
    this.modal.dismiss(this.partidoSeleccionado, 'confirm');
  }
  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm' && this.partidoSeleccionado.cancha && this.partidoSeleccionado.fechaPartido) {
      this.asignarFecha();
    }
  }

  mostrarFechaPartido(fecha?: Date): string {
    if (!fecha) {
      return 'Sin programar';
    }
    const fechaPartido = new Date(fecha);
    return `${fechaPartido.toLocaleDateString('es-CO')} ${fechaPartido.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
  }
  escudoEquipo(equipo?: Equipo): string {
    return equipo?.escudo ? 'data:image/png;base64,' + equipo.escudo : '';
  }
  iniciarPartido() {
    if (!this.esOrganizadorDelTorneo()) {
      this.mensajeError = 'Solo el organizador de este torneo puede iniciar el partido.';
      this.setOpen(true);
      return;
    }
    this.modal.dismiss(null, 'cancel');
    this.router.navigateByUrl('/auth/partidos/partido/' + this.partidoSeleccionado.id);
    this.crud.actualizar(null, "partido/iniciar/"+ this.partidoSeleccionado.id).subscribe((resp: Partido) => {
      this.partidoSeleccionado = resp;
      this.listaPartidos();
    }, error => {
      this.mensajeError = error?.error?.message || 'No se pudo iniciar el partido.';
      this.setOpen(true);
    });
  }
  cancelarPartido() {
    this.crud.actualizar(null, "partido/cancelar/"+ this.partidoSeleccionado.id).subscribe((resp: Partido) => {
      this.partidoSeleccionado = resp;
      this.listaPartidos();
    });
    this.modal.dismiss(null, 'cancel');
  }
  buscador(event: Event) {
    this.palabraBuscador = (event.target as HTMLIonSearchbarElement).value?.toLocaleLowerCase() || '';
    this.listaPartidos();
  }
  compararBuscador(partido: Partido) {    
    return true;
  }
  setOpen(isOpen: boolean) {
    this.isAlertOpen = isOpen;
  }
  esOrganizadorDelTorneo(partido = this.partidoSeleccionado): boolean {
    const usuario = this.crud.obtenerUsuario();
    return this.sesionService.validacionOrganizador() && usuario.id === (partido.torneo || this.torneo).encargadoTorneo?.id;
  }
  abrirWhatsappProgramacion(partido: Partido, equipo?: Equipo) {
    const numero = equipo?.delegado?.numeroCelular;
    if (!numero || !partido.fechaPartido) return;
    const telefono = numero.replace(/\D/g, '');
    const fecha = this.mostrarFechaPartido(partido.fechaPartido);
    const mensaje = `Partido programado: ${partido.equipoLocal?.nombre} vs ${partido.equipoVisitante?.nombre}. Fecha y hora: ${fecha}. Cancha: ${partido.cancha?.nombre || 'pendiente'} (${partido.cancha?.direccion || ''}). Torneo: ${partido.torneo?.nombre || this.torneo.nombre}.`;
    window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
  }
  llenarListaFases() {
    if (this.torneo.modalidadTorneo == ModalidadTorneo.ELIMINATORIAS_GRUPOS) {
      this.faseActual.push(FaseActual.ELIMINATORIAS_GRUPOS);
    }
    if ((this.torneo.modalidadTorneo == ModalidadTorneo.ELIMINATORIAS_GRUPOS && this.torneo.faseTorneo != FaseActual.ELIMINATORIAS_GRUPOS && 
      this.torneo.faseTorneo != FaseActual.FASE_GRUPOS) || this.torneo.modalidadTorneo == ModalidadTorneo.GRUPOS ||
      this.torneo.faseTorneo == FaseActual.FASE_GRUPOS || this.torneo.modalidadTorneo == ModalidadTorneo.LIGA) {
      this.faseActual.push(FaseActual.FASE_GRUPOS);
    }
    if (((this.torneo.modalidadTorneo == ModalidadTorneo.ELIMINATORIAS_GRUPOS || this.torneo.modalidadTorneo == ModalidadTorneo.GRUPOS) && 
        this.torneo.faseTorneo != FaseActual.FASE_GRUPOS && this.torneo.faseTorneo != FaseActual.ELIMINATORIAS_GRUPOS)
        || this.torneo.modalidadTorneo == ModalidadTorneo.ELIMINATORIAS) {
      if (this.torneo.faseInicioEliminatorias == FaseActual.TREINTAIDOSAVOS) {
        this.faseActual.push(FaseActual.TREINTAIDOSAVOS);
      }
      if (this.torneo.faseInicioEliminatorias == FaseActual.DIECISEISAVOS || this.torneo.faseTorneo == FaseActual.DIECISEISAVOS ||
        this.torneo.faseInicioEliminatorias == FaseActual.TREINTAIDOSAVOS) {
        this.faseActual.push(FaseActual.DIECISEISAVOS);
      }
      if (this.torneo.faseInicioEliminatorias == FaseActual.OCTAVOS || this.torneo.faseTorneo == FaseActual.OCTAVOS ||
        this.torneo.faseInicioEliminatorias == FaseActual.TREINTAIDOSAVOS || this.torneo.faseInicioEliminatorias == FaseActual.DIECISEISAVOS) {
          this.faseActual.push(FaseActual.OCTAVOS);
      }
      if (this.torneo.faseInicioEliminatorias == FaseActual.CUARTOS || this.torneo.faseTorneo == FaseActual.CUARTOS ||
        this.torneo.faseInicioEliminatorias == FaseActual.TREINTAIDOSAVOS || this.torneo.faseInicioEliminatorias == FaseActual.DIECISEISAVOS ||
        this.torneo.faseInicioEliminatorias == FaseActual.OCTAVOS) {
          this.faseActual.push(FaseActual.CUARTOS);
      }
      if (this.torneo.faseInicioEliminatorias == FaseActual.SEMIFINAL || this.torneo.faseTorneo == FaseActual.SEMIFINAL ||
        this.torneo.faseInicioEliminatorias == FaseActual.TREINTAIDOSAVOS || this.torneo.faseInicioEliminatorias == FaseActual.DIECISEISAVOS ||
        this.torneo.faseInicioEliminatorias == FaseActual.OCTAVOS || this.torneo.faseInicioEliminatorias == FaseActual.CUARTOS) {
          this.faseActual.push(FaseActual.SEMIFINAL);
      }
      if (this.torneo.faseInicioEliminatorias == FaseActual.FINAL || this.torneo.faseTorneo == FaseActual.FINAL ||
        this.torneo.faseInicioEliminatorias == FaseActual.TREINTAIDOSAVOS || this.torneo.faseInicioEliminatorias == FaseActual.DIECISEISAVOS ||
        this.torneo.faseInicioEliminatorias == FaseActual.OCTAVOS || this.torneo.faseInicioEliminatorias == FaseActual.CUARTOS ||
        this.torneo.faseInicioEliminatorias == FaseActual.SEMIFINAL) {
          this.faseActual.push(FaseActual.FINAL);
      }
    }
  }
}

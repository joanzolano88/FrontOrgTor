import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonModal } from '@ionic/angular';
import { CrudService } from 'src/app/services/crud.service';
import { EstadoPartido } from 'src/enums/EstadoPartido';
import { Cancha } from 'src/models/Cancha';
import { Partido } from 'src/models/Partido';
import { OverlayEventDetail } from '@ionic/core/components';
import { FaseActual } from 'src/enums/FaseActual';
import { Torneo } from 'src/models/Torneo';
import { ModalidadTorneo } from 'src/enums/ModalidadTorneo';


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

  constructor(private crud: CrudService, private route: ActivatedRoute, private router: Router) { }
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
    this.crud.obtener("partido/torneo/fase-actual/" + this.idTorneo + '/' + this.fasePartido).subscribe((resp: Partido[][]) => {
      this.listaGruposPartidos = resp;
    });
  }
  validacionEstadoPartido(listaPartidos: Partido[]) {
    return listaPartidos.filter(p => p.estadoPartido == this.estadoPartido).length > 0;
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
  selecionarFecha(btnModal: IonButton, partido: Partido) {    
    this.partidoSeleccionado = partido;
    if (this.partidoSeleccionado.cancha == undefined) {
      this.partidoSeleccionado.cancha = new Cancha();
    }
    if (this.partidoSeleccionado.estadoPartido == EstadoPartido.EN_PROCESO || this.partidoSeleccionado.estadoPartido == EstadoPartido.TERMINADO) {
      this.router.navigateByUrl('/tabs/tab1/partido/' + this.partidoSeleccionado.id);
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
  iniciarPartido() {
    this.modal.dismiss(null, 'cancel');
    this.router.navigateByUrl('/tabs/tab1/partido/' + this.partidoSeleccionado.id);
    this.crud.actualizar(null, "partido/iniciar/"+ this.partidoSeleccionado.id).subscribe((resp: Partido) => {
      this.partidoSeleccionado = resp;
      this.listaPartidos();
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
  }
  compararBuscador(partido: Partido) {    
    return partido.equipoLocal?.nombre?.toLocaleLowerCase().includes(this.palabraBuscador!) || this.palabraBuscador == undefined ||
            partido.equipoVisitante?.nombre?.toLocaleLowerCase().includes(this.palabraBuscador!) || this.palabraBuscador == '';
  }
  setOpen(isOpen: boolean) {
    this.isAlertOpen = isOpen;
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

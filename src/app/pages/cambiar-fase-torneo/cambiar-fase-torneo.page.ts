import { CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem, CdkDropList } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';
import { FaseActual } from 'src/enums/FaseActual';
import { ModalidadTorneo } from 'src/enums/ModalidadTorneo';
import { Equipo } from 'src/models/Equipo';
import { Partido } from 'src/models/Partido';
import { Torneo } from 'src/models/Torneo';
import { DtoGrupoEquipo } from '../../../models/DTO/DtoGrupoEquipo';
import { DtoResulatoLlave } from 'src/models/DTO/DtoResulatoLlave';
import { Location } from '@angular/common';

@Component({
  selector: 'app-cambiar-fase-torneo',
  templateUrl: './cambiar-fase-torneo.page.html',
  styleUrls: ['./cambiar-fase-torneo.page.scss'],
  standalone: false
})
export class CambiarFaseTorneoPage implements OnInit {
  listaEuiposGrupos: Equipo[][] = [];
  listaResultadoLlaves: DtoResulatoLlave[] = []
  torneo: Torneo = new Torneo();
  listaLlaves: Equipo[][] = [];
  siguienteFase?: FaseActual;
  cantidadLlaves: number = 0;
  isAlertOpen = false;
  alertButtons = ['Aceptar'];

  constructor(private crud: CrudService,  private route: ActivatedRoute, private _location: Location, private router: Router) {}

  ngOnInit() {
    this.crud.obtenerParametro(this.route.snapshot.paramMap.get('idTorneo'), 'torneo').subscribe((respT: Torneo) => {
        this.torneo = respT;
        if (this.torneo.faseTorneo == FaseActual.ELIMINATORIAS_GRUPOS) {
          this.cantidadLlaves = this.torneo.cantidadGrupos!;
          this.siguienteFase = FaseActual.FASE_GRUPOS;
        } else {
          if (this.torneo.faseTorneo == FaseActual.FASE_GRUPOS) {
            this.siguienteFase = this.torneo.faseInicioEliminatorias!;
          } else {
            this.siguienteFase = Object.keys(FaseActual)[Object.keys(FaseActual).indexOf(this.torneo.faseTorneo!.toString()) - 1] as FaseActual;
          }
          switch (this.siguienteFase) {
            case FaseActual.FINAL:
              this.cantidadLlaves = 1;
              break;
            case FaseActual.SEMIFINAL:
              this.cantidadLlaves = 2;
              break;
            case FaseActual.CUARTOS:
              this.cantidadLlaves = 4;
              break;
            case FaseActual.OCTAVOS:
              this.cantidadLlaves = 8;
              break;
            case FaseActual.DIECISEISAVOS:
              this.cantidadLlaves = 16;
              break;
            case FaseActual.TREINTAIDOSAVOS:
              this.cantidadLlaves = 32;
              break;
            default:
              break;
          }
        }
        for (let index = 1; index <= this.cantidadLlaves; index++) {
          this.listaLlaves.push([]);
        }
        this.crud.obtener('equipo/torneo/fase/' + this.torneo.id + '/' + this.torneo.faseTorneo).subscribe((resp: Equipo[]) => {
          this.ordenarGrupos(resp);
          this.crud.obtener('partido/eliminatorias_torneo/' + this.torneo.id ).subscribe((resp: DtoResulatoLlave[]) => {
            for (let index = 0; index < resp.length; index++) {
              this.listaResultadoLlaves = resp;
            }
          });
        });
      });
  }
  drop(event: CdkDragDrop<Equipo[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data,
        event.previousIndex,
        event.currentIndex);
    } else {      
      if (event.container.id.includes('grupoG') && !this.buscarEquipoLlaves(event.previousContainer.data[event.previousIndex])) {
        event.container.data.push(event.previousContainer.data[event.previousIndex]);
      } else if (event.container.id.includes('grupoE')) {
        event.previousContainer.data.splice(event.previousIndex,1);
      }
    }
  }
  buscarEquipoLlaves(equipo: Equipo) {
    for (const listaEquipos of this.listaLlaves) {
      if (listaEquipos.includes(equipo)) {
        return true;
      }
    }
    return false;
  }
  evenPredicate(item: CdkDrag<Equipo>, drop: CdkDropList<Equipo[]>) {
    if (item.data.torneo?.faseTorneo == FaseActual.ELIMINATORIAS_GRUPOS) {
      return drop.data.length < item.data.torneo?.cantidadEquipos! && item.dropContainer.data.length > 1;
    } else if (drop.data.length < 2) {
      return true;
    }
    return false;
  }
  evenPredicateGrupo(item: CdkDrag<Equipo>, drop: CdkDropList) {
    return "grupoE"+item.data.grupo == drop.id;
  }
  ordenarGrupos(resp: Equipo[]) {
    if (this.torneo.modalidadTorneo == ModalidadTorneo.ELIMINATORIAS_GRUPOS && this.torneo.cantidadGrupos) {
      for (let index = 0; index < this.torneo.cantidadGrupos; index++) {
        this.listaEuiposGrupos[index] = resp.filter(e => e.grupo == (index+1));
        for (let j = 0; j < this.listaEuiposGrupos[index].length - 1; j++) {
          for (let i = j+1; i < this.listaEuiposGrupos[index].length; i++) {
            if (this.listaEuiposGrupos[index][j].puntosEliminatoria! < this.listaEuiposGrupos[index][i].puntosEliminatoria!) {
              let equipo = this.listaEuiposGrupos[index][j];
              this.listaEuiposGrupos[index][j] = this.listaEuiposGrupos[index][i];
              this.listaEuiposGrupos[index][i] = equipo;
            } else if (this.listaEuiposGrupos[index][j].puntosEliminatoria! == this.listaEuiposGrupos[index][i].puntosEliminatoria!) {
              if (this.calcularDG(this.listaEuiposGrupos[index][j]) < this.calcularDG(this.listaEuiposGrupos[index][i]) ||
                this.listaEuiposGrupos[index][j].anotacionesAFavor! < this.listaEuiposGrupos[index][i].anotacionesAFavor!) {
                let equipo = this.listaEuiposGrupos[index][j];
                this.listaEuiposGrupos[index][j] = this.listaEuiposGrupos[index][i];
                this.listaEuiposGrupos[index][i] = equipo;
              }
            }
          }
        }
      }
    } else if (this.torneo.modalidadTorneo == ModalidadTorneo.GRUPOS && this.torneo.cantidadGrupos) {
      for (let index = 0; index < this.torneo.cantidadGrupos; index++) {
        this.listaEuiposGrupos[index] = resp.filter(e => e.grupo == (index+1));
        for (let j = 0; j < this.listaEuiposGrupos[index].length - 1; j++) {
          for (let i = j+1; i < this.listaEuiposGrupos[index].length; i++) {
            if (this.listaEuiposGrupos[index][j].puntos! < this.listaEuiposGrupos[index][i].puntos!) {
              let equipo = this.listaEuiposGrupos[index][j];
              this.listaEuiposGrupos[index][j] = this.listaEuiposGrupos[index][i];
              this.listaEuiposGrupos[index][i] = equipo;
            } else if (this.listaEuiposGrupos[index][j].puntos! == this.listaEuiposGrupos[index][i].puntos!) {
              if (this.calcularDG(this.listaEuiposGrupos[index][j]) < this.calcularDG(this.listaEuiposGrupos[index][i]) ||
                this.listaEuiposGrupos[index][j].anotacionesAFavor! < this.listaEuiposGrupos[index][i].anotacionesAFavor!) {
                let equipo = this.listaEuiposGrupos[index][j];
                this.listaEuiposGrupos[index][j] = this.listaEuiposGrupos[index][i];
                this.listaEuiposGrupos[index][i] = equipo;
              }
            }
          }
        }
      }
    } else {
      this.listaEuiposGrupos[0] = resp;
    }
  }
  noReturnPredicate() {
    return false;
  }
  calcularDG(equipo: Equipo){
    if (equipo.faseActual == FaseActual.ELIMINATORIAS_GRUPOS) {
      return equipo.anotacionesAFavorEliminatoria! - equipo.anotacionesEnContraEliminatoria!;
    }
    return equipo.anotacionesAFavor! - equipo.anotacionesEnContra!;
  }
  puntosEquipo(equipo: Equipo) {
    if (equipo.faseActual == FaseActual.ELIMINATORIAS_GRUPOS) {
      return equipo.puntosEliminatoria;
    } else if (equipo.faseActual == FaseActual.FASE_GRUPOS) {
      return equipo.puntos;
    }
    return '';
  }
  cambiarFase() {
    let validacion: boolean = false;
    for (let i = 0; i < this.listaLlaves.length; i++) {
      if ( this.torneo.faseTorneo == FaseActual.ELIMINATORIAS_GRUPOS && this.listaLlaves[i].length < this.torneo.cantidadEquipos!) {
        validacion = true;
        break;
      } else if ( this.torneo.faseTorneo == FaseActual.FASE_GRUPOS && this.listaLlaves[i].length < 2 ) {
        validacion = true;
        break;
      }
    }
    if (validacion) {
      return;
    }
    let listDtoGrupoEquipo: DtoGrupoEquipo[] = [];
    for (let i = 0; i < this.listaLlaves.length; i++) {
      for (let j = 0; j < this.listaLlaves[i].length; j++) {
        let dtoGrupoEquipo: DtoGrupoEquipo = new DtoGrupoEquipo();
        dtoGrupoEquipo.idEquipo = this.listaLlaves[i][j].id;
        dtoGrupoEquipo.faseActual = this.siguienteFase;
        dtoGrupoEquipo.grupo = i + 1;
        listDtoGrupoEquipo.push(dtoGrupoEquipo);
      }
    }
    this.crud.actualizarLista(listDtoGrupoEquipo, 'torneo/cambiar_fase_torneo/' + this.torneo.id).subscribe(resp =>{
      this.setOpen(true);
      this._location.back();
    })
  }
  resulatdoLlaves(equipo: Equipo) {
    let resultadoGandor: DtoResulatoLlave[] = this.listaResultadoLlaves.filter( rll => rll.idGanador == equipo.id);
    let resultadoPerdedor: DtoResulatoLlave[] = this.listaResultadoLlaves.filter( rll => rll.idPerdedor == equipo.id);
    if (resultadoGandor.length > 0) {
      return resultadoGandor[0].resultadoGanador;
    } else if (resultadoPerdedor.length > 0) {
      return resultadoPerdedor[0].resultadoPerdedor;
    }
    return ''
  }
  setOpen(isOpen: boolean) {
    this.isAlertOpen = isOpen;
  }
}

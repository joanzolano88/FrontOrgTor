import { CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem, CdkDropList } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';
import { FaseActual } from 'src/enums/FaseActual';
import { ModalidadTorneo } from 'src/enums/ModalidadTorneo';
import { Equipo } from 'src/models/Equipo';
import { DistribucionEquipo } from 'src/models/DistribucionEquipo';
import { Partido } from 'src/models/Partido';
import { Torneo } from 'src/models/Torneo';
import { DtoGrupoEquipo } from '../../../models/DTO/DtoGrupoEquipo';
import { DtoGrupoLlave } from '../../../models/DTO/DtoGrupoLlave';
import { GrupoLlave } from 'src/models/GrupoLlave';
import { DtoResulatoLlave } from 'src/models/DTO/DtoResulatoLlave';
import { Location } from '@angular/common';

@Component({
  selector: 'app-cambiar-fase-torneo',
  templateUrl: './cambiar-fase-torneo.page.html',
  styleUrls: ['./cambiar-fase-torneo.page.scss'],
  standalone: false
})
export class CambiarFaseTorneoPage implements OnInit {
  listaEuiposGrupos: DistribucionEquipo[][] = [];
  equiposSinAsignar: DistribucionEquipo[] = [];
  listaResultadoLlaves: DtoResulatoLlave[] = []
  torneo: Torneo = new Torneo();
  listaLlaves: DistribucionEquipo[][] = [];
  siguienteFase?: FaseActual;
  cantidadLlaves: number = 0;
  organizacionInicial = false;
  mensajeError = '';
  isAlertOpen = false;
  alertButtons = ['Aceptar'];

  constructor(private crud: CrudService,  private route: ActivatedRoute, private _location: Location, private router: Router) {}

  ngOnInit() {
    this.crud.obtenerParametro(this.route.snapshot.paramMap.get('idTorneo'), 'torneo').subscribe((respT: Torneo) => {
        this.torneo = respT;
        this.organizacionInicial = this.torneo.estadoTorneo === 'INSCRIPCIONES' || this.torneo.estadoTorneo === 'INSCRIPCIONES_ACTIVO';
        if (this.organizacionInicial && this.torneo.modalidadTorneo == ModalidadTorneo.ELIMINATORIAS) {
          this.siguienteFase = this.torneo.faseInicioEliminatorias;
        }
        if (this.torneo.faseTorneo == FaseActual.ELIMINATORIAS_GRUPOS) {
          this.cantidadLlaves = this.torneo.cantidadGrupos!;
          this.siguienteFase = FaseActual.FASE_GRUPOS;
        } else {
          if (!this.organizacionInicial && this.torneo.faseTorneo == FaseActual.FASE_GRUPOS) {
            this.siguienteFase = this.torneo.faseInicioEliminatorias!;
          } else if (!this.organizacionInicial) {
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
        const urlDistribucion = this.organizacionInicial
          ? 'torneo/' + this.torneo.id + '/grupo-llave/' + (this.siguienteFase || this.torneo.faseTorneo)
          : 'torneo/' + this.torneo.id + '/distribucion';
        this.crud.obtener(urlDistribucion).subscribe((resp: GrupoLlave[] | DistribucionEquipo[]) => {
          const equipos = this.organizacionInicial
            ? (resp as GrupoLlave[]).map(grupo => ({
                idEquipo: grupo.equipo?.id,
                nombreEquipo: grupo.equipo?.nombre,
                grupo: grupo.grupoLlave || 0
              }))
            : resp as DistribucionEquipo[];
          this.ordenarGrupos(equipos);
          this.crud.obtener('partido/eliminatorias_torneo/' + this.torneo.id ).subscribe((resp: DtoResulatoLlave[]) => {
            for (let index = 0; index < resp.length; index++) {
              this.listaResultadoLlaves = resp;
            }
          });
        }, () => {
          this.listaEuiposGrupos = [];
          this.mensajeError = 'Aún no hay equipos aceptados para organizar.';
        });
      });
  }
  drop(event: CdkDragDrop<DistribucionEquipo[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data,
        event.previousIndex,
        event.currentIndex);
    } else if (event.container.id.includes('grupoG')) {
      if (event.container.data.length < 2 && !this.buscarEquipoLlaves(event.previousContainer.data[event.previousIndex])) {
        transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.container.data.length);
      }
    } else if (event.container.id.includes('grupoE')) {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.container.data.length);
    }
  }
  buscarEquipoLlaves(equipo: DistribucionEquipo) {
    for (const listaEquipos of this.listaLlaves) {
      if (listaEquipos.includes(equipo)) {
        return true;
      }
    }
    return false;
  }
  evenPredicate(item: CdkDrag<DistribucionEquipo>, drop: CdkDropList<DistribucionEquipo[]>) {
    return drop.data.length < 2;
  }
  evenPredicateGrupo(item: CdkDrag<DistribucionEquipo>, drop: CdkDropList) {
    return true;
  }
  ordenarGrupos(resp: DistribucionEquipo[]) {
    this.listaEuiposGrupos = [];
    this.equiposSinAsignar = resp.filter(e => !e.grupo || e.grupo < 1);
    if (this.organizacionInicial && this.torneo.modalidadTorneo == ModalidadTorneo.ELIMINATORIAS) {
      this.listaEuiposGrupos[0] = [];
      return;
    }
    if (this.torneo.modalidadTorneo == ModalidadTorneo.ELIMINATORIAS_GRUPOS && this.torneo.cantidadGrupos) {
      for (let index = 0; index < this.torneo.cantidadGrupos; index++) {
        this.listaEuiposGrupos[index] = resp.filter(e => e.grupo == (index+1));
      }
    } else if (this.torneo.modalidadTorneo == ModalidadTorneo.GRUPOS && this.torneo.cantidadGrupos) {
      for (let index = 0; index < this.torneo.cantidadGrupos; index++) {
        this.listaEuiposGrupos[index] = resp.filter(e => e.grupo == (index+1));
      }
    } else {
      this.listaEuiposGrupos[0] = this.organizacionInicial ? [] : resp;
    }
  }
  noReturnPredicate() {
    return false;
  }
  puntosEquipo(equipo: DistribucionEquipo) {
    return equipo.grupo || '';
  }
  cambiarFase() {
    const guardadoParcial = this.equiposSinAsignar.length > 0;
    const listasAValidar = (this.torneo.faseTorneo == FaseActual.FASE_GRUPOS && !this.organizacionInicial) ||
      (this.organizacionInicial && this.torneo.modalidadTorneo != ModalidadTorneo.ELIMINATORIAS)
      ? this.listaEuiposGrupos
      : this.listaLlaves;
    let validacion: boolean = false;
    for (let i = 0; i < listasAValidar.length; i++) {
      if (listasAValidar === this.listaEuiposGrupos && listasAValidar[i].length < this.torneo.cantidadEquipos!) {
        validacion = true;
        break;
      } else if (this.torneo.faseTorneo == FaseActual.ELIMINATORIAS_GRUPOS && this.listaLlaves[i].length < this.torneo.cantidadEquipos!) {
        validacion = true;
        break;
      } else if (this.organizacionInicial && this.torneo.modalidadTorneo == ModalidadTorneo.ELIMINATORIAS && listasAValidar[i].length < 2) {
        validacion = true;
        break;
      }
    }
    if (validacion && !this.organizacionInicial && !guardadoParcial) {
      this.mensajeError = 'Completa la capacidad de todos los grupos o llaves antes de cambiar de fase.';
      return;
    }
    let listDtoGrupoEquipo: DtoGrupoEquipo[] = [];
    let listDtoGrupoLlave: DtoGrupoLlave[] = [];
    const listasAGuardar = (this.torneo.faseTorneo == FaseActual.FASE_GRUPOS && !this.organizacionInicial) ||
      (this.organizacionInicial && this.torneo.modalidadTorneo != ModalidadTorneo.ELIMINATORIAS)
      ? this.listaEuiposGrupos
      : this.listaLlaves;
    for (let i = 0; i < listasAGuardar.length; i++) {
      for (let j = 0; j < listasAGuardar[i].length; j++) {
        let dtoGrupoEquipo: DtoGrupoEquipo = new DtoGrupoEquipo();
        dtoGrupoEquipo.idEquipo = listasAGuardar[i][j].idEquipo;
        dtoGrupoEquipo.faseActual = this.siguienteFase;
        dtoGrupoEquipo.grupo = i + 1;
        listDtoGrupoEquipo.push(dtoGrupoEquipo);
        listDtoGrupoLlave.push({
          idEquipo: dtoGrupoEquipo.idEquipo,
          grupoLlave: dtoGrupoEquipo.grupo,
          faseTorneo: this.siguienteFase || this.torneo.faseTorneo
        });
      }
    }
    const endpoint = this.organizacionInicial
      ? 'torneo/' + this.torneo.id + '/grupo-llave'
      : 'torneo/cambiar_fase_torneo/' + this.torneo.id;
    const payload = this.organizacionInicial ? listDtoGrupoLlave : listDtoGrupoEquipo;
    if (payload.length === 0) {
      this.mensajeError = 'Asigna al menos un equipo a un grupo o una llave antes de guardar.';
      this.setOpen(true);
      return;
    }
    this.crud.actualizarLista(payload, endpoint).subscribe(resp =>{
      this.mensajeError = guardadoParcial
        ? 'Distribución parcial guardada. Puedes continuar asignando equipos.'
        : 'Distribución completa guardada. El torneo ya puede iniciar sus partidos.';
      this.setOpen(true);
      if (this.organizacionInicial) {
        this.recargarDistribucion();
      } else {
        this._location.back();
      }
    }, error => {
      this.mensajeError = error?.error?.message || 'No se pudo guardar la distribución.';
      this.setOpen(true);
    })
  }

  private recargarDistribucion() {
    const url = 'torneo/' + this.torneo.id + '/grupo-llave/' + (this.siguienteFase || this.torneo.faseTorneo);
    this.crud.obtener(url).subscribe((resp: GrupoLlave[]) => {
      const equipos = resp.map(grupo => ({
        idEquipo: grupo.equipo?.id,
        nombreEquipo: grupo.equipo?.nombre,
        grupo: grupo.grupoLlave || 0
      }));
      this.ordenarGrupos(equipos);
    });
  }
  resulatdoLlaves(equipo: DistribucionEquipo) {
    let resultadoGandor: DtoResulatoLlave[] = this.listaResultadoLlaves.filter( rll => rll.idGanador == equipo.idEquipo);
    let resultadoPerdedor: DtoResulatoLlave[] = this.listaResultadoLlaves.filter( rll => rll.idPerdedor == equipo.idEquipo);
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

  totalEquiposOrganizados(): number {
    return this.listaEuiposGrupos.reduce((total, grupo) => total + grupo.length, 0);
  }
}

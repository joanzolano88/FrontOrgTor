import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';
import { SesionService } from 'src/app/services/restriccion/sesion.service';
import { FaseActual } from 'src/enums/FaseActual';
import { ModalidadTorneo } from 'src/enums/ModalidadTorneo';
import { Equipo } from 'src/models/Equipo';
import { Partido } from 'src/models/Partido';
import { Torneo } from 'src/models/Torneo';

@Component({
  selector: 'app-tabla-equipos',
  templateUrl: './tabla-equipos.page.html',
  styleUrls: ['./tabla-equipos.page.scss'],
  standalone: false
})
export class TablaEquiposPage implements OnInit {

  listaEuiposGrupos: Equipo[][] = [];
  listaPartidosEliminatorias: Partido[][] = [];
  torneo: Torneo = new Torneo();
  equipoS: Equipo = new Equipo();
  isActionSheetOpen = false;
  tipoTabla?: ModalidadTorneo;
  listaFases: any[] = [];
  mensajeError?: string;
  validarOrganizador: boolean = false;
  public actionSheetButtons = [
    {
      text: 'Eliminar',
      role: 'destructive',
      data: {
        accion: 'eliminar',
      },
    },
    {
      text: 'Editar',
      data: {
        accion: 'editar',
      },
    },
    {
      text: 'Cancel',
      role: 'cancel',
      data: {
        accion: 'cancelar',
      },
    },
  ];

  constructor(private crud: CrudService, private router: Router,
    private route: ActivatedRoute, private sesionService: SesionService) {
    this.validarOrganizador = sesionService.validacionOrganizador();
    crud.obtenerParametro(route.snapshot.paramMap.get('idTorneo'), "torneo").subscribe((respT: Torneo) =>{
      this.torneo = respT;
      if (this.torneo.faseTorneo == FaseActual.FASE_GRUPOS) {
        this.tipoTabla = ModalidadTorneo.GRUPOS;
        if(this.torneo.modalidadTorneo == ModalidadTorneo.LIGA) {
          this.tipoTabla = ModalidadTorneo.LIGA;
        }
      } else if(this.torneo.faseTorneo == FaseActual.ELIMINATORIAS_GRUPOS) {
        this.tipoTabla = ModalidadTorneo.ELIMINATORIAS_GRUPOS;
      } else {
        this.tipoTabla = ModalidadTorneo.ELIMINATORIAS;
      }
      this.llenarListaFases();
      this.listarEquiposFase();
    });
  }
  ngOnInit() {
  }
  calcularDG(equipo: Equipo){
    if (this.tipoTabla == ModalidadTorneo.ELIMINATORIAS_GRUPOS) {
      return equipo.anotacionesAFavorEliminatoria! - equipo.anotacionesEnContraEliminatoria!;
    }
    return equipo.anotacionesAFavor! - equipo.anotacionesEnContra!;
  }
  setOpen(isOpen: boolean, equipo?: Equipo) {
    if (equipo != undefined) this.equipoS = equipo;
    this.isActionSheetOpen = isOpen;
  }
  accionesEquipo(ev: any) {
    let data = ev.detail.data;
    if (data != undefined && data.accion) {
      if (data.accion ==  'eliminar') {
        
      } else if (data.accion ==  'editar') {
        this.router.navigateByUrl('tabs/tab2/torneo/' + this.torneo.id + '/tabla-equipos/crear-equipo/' + this.equipoS.id);
      }
    }
  }
  llenarListaFases() {
    switch (this.torneo.modalidadTorneo) {
      case ModalidadTorneo.ELIMINATORIAS:
        this.listaFases.push(ModalidadTorneo.ELIMINATORIAS);
        break;
      case ModalidadTorneo.ELIMINATORIAS_GRUPOS:
        this.listaFases.push(ModalidadTorneo.ELIMINATORIAS_GRUPOS, 
                              ModalidadTorneo.GRUPOS, ModalidadTorneo.ELIMINATORIAS);
        break;
      case ModalidadTorneo.GRUPOS:
        this.listaFases.push(ModalidadTorneo.GRUPOS, ModalidadTorneo.ELIMINATORIAS);
        break;
      case ModalidadTorneo.LIGA:
        this.listaFases.push(ModalidadTorneo.LIGA);
        break;
      default:
        break;
    }
  }
  textoFases(texto: string) {
    return texto.replace('ATORIAS_', '. ');
  }
  listarEquiposFase() {
    if (this.tipoTabla != ModalidadTorneo.ELIMINATORIAS) {
      this.crud.obtener('equipo/torneo/modalidad/' + this.torneo.id + '/' + this.tipoTabla).subscribe((resp: Equipo[]) => {
        this.mensajeError = undefined;
        if (this.tipoTabla == ModalidadTorneo.ELIMINATORIAS_GRUPOS && this.torneo.cantidadGrupos) {
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
        } else if (this.tipoTabla == ModalidadTorneo.GRUPOS && this.torneo.cantidadGrupos) {
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
      }, (error: HttpErrorResponse) => {
        this.mensajeError = error.error.message;
      });
        
    }  else if (this.tipoTabla == ModalidadTorneo.ELIMINATORIAS) {
      this.crud.obtener('partido/torneo/modalidad/' + this.torneo.id + '/' + this.tipoTabla).subscribe((resp: Partido[]) => {
        let cantidadLlaves: number = Object.keys(FaseActual).indexOf(this.torneo.faseInicioEliminatorias!.toString());
        let listaFases = Object.values(FaseActual);
        for (let i = 1; i <= cantidadLlaves; i++) {
          this.listaPartidosEliminatorias.push(resp.filter(p => p.faseEncuentro == listaFases[i]));
          if (i > 1) {
            for (let j = (i-2)*2; j < this.listaPartidosEliminatorias[i-2].length; j++) {
              let llavesOrdenadas = this.listaPartidosEliminatorias[i-1].filter( p => p.equipoLocal?.id == this.listaPartidosEliminatorias[i-2][j].equipoVisitante?.id || p.equipoLocal?.id == this.listaPartidosEliminatorias[i-2][j].equipoLocal?.id ||
                p.equipoVisitante?.id == this.listaPartidosEliminatorias[i-2][j].equipoVisitante?.id || p.equipoLocal?.id == this.listaPartidosEliminatorias[i-2][j].equipoLocal?.id);
              this.listaPartidosEliminatorias[i-1][j] = llavesOrdenadas[0];
              this.listaPartidosEliminatorias[i-1][j + 1] = llavesOrdenadas[1];
            }
          }
        }
        this.listaPartidosEliminatorias = this.listaPartidosEliminatorias.reverse();
      });
    }
  }
  listarEquiposEliminatorias() {
    this.crud.obtener('partido/eliminatorias/' + this.torneo.id).subscribe((resp: Partido[]) => {
      //this.listaPartidosEliminatorias = resp;
    });
  }
  ganadorPenaltis(partido: Partido, tipoEquipo: string): string {
    if (partido.penaltisEquipoLocal! > partido.penaltisEquipoVisitante! && tipoEquipo == 'L') {
      return 'P';
    } else if (partido.penaltisEquipoVisitante! > partido.penaltisEquipoLocal! && tipoEquipo == 'V') {
      return 'P';
    }
    return '';
  }
  cambioTabla() {
    this.listaEuiposGrupos = [];
    this.listaPartidosEliminatorias = [];
    this.listarEquiposFase();
  }
  puntos(equipo: Equipo) {
    if (this.tipoTabla == ModalidadTorneo.ELIMINATORIAS_GRUPOS) {
      return equipo.puntosEliminatoria;
    }
    return equipo.puntos;
  }
  anotacionesAFavor(equipo: Equipo) {
    if (this.tipoTabla == ModalidadTorneo.ELIMINATORIAS_GRUPOS) {
      return equipo.anotacionesAFavorEliminatoria;
    }
    return equipo.anotacionesAFavor;
  }
  anotacionesEnContra(equipo: Equipo) {
    if (this.tipoTabla == ModalidadTorneo.ELIMINATORIAS_GRUPOS) {
      return equipo.anotacionesEnContraEliminatoria;
    }
    return equipo.anotacionesEnContra;
  }
  partidosJugados(equipo: Equipo) {
    if (this.tipoTabla == ModalidadTorneo.ELIMINATORIAS_GRUPOS) {
      return equipo.partidosJugadosEliminatoria;
    }
    return equipo.partidosJugados;
  }
  partidosGanados(equipo: Equipo) {
    if (this.tipoTabla == ModalidadTorneo.ELIMINATORIAS_GRUPOS) {
      return equipo.partidosGanadosEliminatoria;
    }
    return equipo.partidosGanados;
  }
  partidosEmpatados(equipo: Equipo) {
    if (this.tipoTabla == ModalidadTorneo.ELIMINATORIAS_GRUPOS) {
      return equipo.partidosEmpatadosEliminatoria;
    }
    return equipo.partidosEmpatados;
  }
  partidosPerdidos(equipo: Equipo) {
    if (this.tipoTabla == ModalidadTorneo.ELIMINATORIAS_GRUPOS) {
      return equipo.partidosPerdidosEliminatoria;
    }
    return equipo.partidosPerdidos;
  }
}

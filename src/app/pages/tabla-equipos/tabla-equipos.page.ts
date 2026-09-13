import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';
import { SesionService } from 'src/app/services/restriccion/sesion.service';
import { FaseActual } from 'src/enums/FaseActual';
import { ModalidadTorneo } from 'src/enums/ModalidadTorneo';
import { Equipo } from 'src/models/Equipo';
import { GrupoLlave } from 'src/models/GrupoLlave';
import { Partido } from 'src/models/Partido';
import { Torneo } from 'src/models/Torneo';

@Component({
  selector: 'app-tabla-equipos',
  templateUrl: './tabla-equipos.page.html',
  styleUrls: ['./tabla-equipos.page.scss'],
  standalone: false
})
export class TablaEquiposPage implements OnInit {

  listaEuiposGrupos: GrupoLlave[][] = [];
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
      text: 'Ver equipo',
      data: { accion: 'ver' },
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
  calcularDG(equipo: GrupoLlave){
    return (equipo.golesFavor || 0) - (equipo.golesContra || 0);
  }
  setOpen(isOpen: boolean, grupoLlave?: GrupoLlave) {
    if (grupoLlave?.equipo != undefined) this.equipoS = grupoLlave.equipo;
    this.isActionSheetOpen = isOpen;
  }
  accionesEquipo(ev: any) {
    let data = ev.detail.data;
    if (data != undefined && data.accion) {
      if (data.accion == 'ver') {
        this.router.navigateByUrl('/auth/torneos/torneo/' + this.torneo.id + '/equipo/' + this.equipoS.id);
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
      const fase = this.tipoTabla == ModalidadTorneo.ELIMINATORIAS_GRUPOS
        ? FaseActual.ELIMINATORIAS_GRUPOS
        : FaseActual.FASE_GRUPOS;
      this.crud.obtener('torneo/' + this.torneo.id + '/grupo-llave/' + fase).subscribe((resp: GrupoLlave[]) => {
        this.mensajeError = undefined;
        this.listaEuiposGrupos = [];
        if (this.tipoTabla == ModalidadTorneo.ELIMINATORIAS_GRUPOS && this.torneo.cantidadGrupos) {
          for (let index = 0; index < this.torneo.cantidadGrupos; index++) {
            this.listaEuiposGrupos[index] = resp.filter(e => e.grupoLlave == (index+1));
            for (let j = 0; j < this.listaEuiposGrupos[index].length - 1; j++) {
              for (let i = j+1; i < this.listaEuiposGrupos[index].length; i++) {
                if (this.compararGrupoLlave(this.listaEuiposGrupos[index][j], this.listaEuiposGrupos[index][i]) > 0) {
                  let equipo = this.listaEuiposGrupos[index][j];
                  this.listaEuiposGrupos[index][j] = this.listaEuiposGrupos[index][i];
                  this.listaEuiposGrupos[index][i] = equipo;
                }
              }
            }
          }
        } else if (this.tipoTabla == ModalidadTorneo.GRUPOS && this.torneo.cantidadGrupos) {
          for (let index = 0; index < this.torneo.cantidadGrupos; index++) {
            this.listaEuiposGrupos[index] = resp.filter(e => e.grupoLlave == (index+1));
            for (let j = 0; j < this.listaEuiposGrupos[index].length - 1; j++) {
              for (let i = j+1; i < this.listaEuiposGrupos[index].length; i++) {
                if (this.compararGrupoLlave(this.listaEuiposGrupos[index][j], this.listaEuiposGrupos[index][i]) > 0) {
                  let equipo = this.listaEuiposGrupos[index][j];
                  this.listaEuiposGrupos[index][j] = this.listaEuiposGrupos[index][i];
                  this.listaEuiposGrupos[index][i] = equipo;
                }
              }
            }
          }
        } else {
          this.listaEuiposGrupos[0] = resp.sort((a, b) => this.compararGrupoLlave(a, b));
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
  puntos(equipo: GrupoLlave) {
    return equipo.puntos || 0;
  }
  anotacionesAFavor(equipo: GrupoLlave) {
    return equipo.golesFavor || 0;
  }
  anotacionesEnContra(equipo: GrupoLlave) {
    return equipo.golesContra || 0;
  }
  partidosJugados(equipo: GrupoLlave) {
    return equipo.partidosJugados || 0;
  }
  partidosGanados(equipo: GrupoLlave) {
    return equipo.partidosGanados || 0;
  }
  partidosEmpatados(equipo: GrupoLlave) {
    return equipo.partidosEmpatados || 0;
  }
  partidosPerdidos(equipo: GrupoLlave) {
    return equipo.partidosPerdidos || 0;
  }
  compararGrupoLlave(primero: GrupoLlave, segundo: GrupoLlave) {
    return (segundo.puntos || 0) - (primero.puntos || 0) ||
      this.calcularDG(segundo) - this.calcularDG(primero) ||
      (segundo.golesFavor || 0) - (primero.golesFavor || 0);
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';
import { EstadoPartido } from 'src/enums/EstadoPartido';
import { Partido } from 'src/models/Partido';
import { IonButton } from '@ionic/angular';
import { ModalidadFase } from 'src/enums/ModalidadFase';
import { FaseActual } from 'src/enums/FaseActual';
import { SesionService } from 'src/app/services/restriccion/sesion.service';

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

  constructor(private crud: CrudService, private route: ActivatedRoute,
    private router: Router, private sesionService: SesionService) {
    this.validarOrganizador = sesionService.validacionOrganizador();
    this.url =  router.url;
    if (!this.url.includes("auth/partidos")) {
      this.urlBack = "tabs/tab1"
    } else {
      this.urlBack = "auth/partidos"
    }
  }
  ngOnInit() {
    let idPartido = this.route.snapshot.paramMap.get('idPartido');
    this.crud.obtenerParametro(idPartido,"partido").subscribe((resp: Partido) =>{
      this.partido = resp;
      console.log(this.partido);
      
      this.alertButtonsPenalties[0].text = this.partido.equipoLocal?.nombre!;
      this.alertButtonsPenalties[1].text = this.partido.equipoVisitante?.nombre!;
      this.alertInputs[0].placeholder = 'Goles ' + this.partido.equipoLocal?.nombre!;
      this.alertInputs[1].placeholder = 'Goles ' + this.partido.equipoVisitante?.nombre!;
      this.alertInputs[0].value = this.partido.anotacionesEquipoLocal!;
      this.alertInputs[1].value = this.partido.anotacionesEquipoVisitante!;
    });
  }
  mostrarEscudo(imagen: any) {
    return 'data:image/png;base64,' +imagen;
  }
  eventosPartido(btn: IonButton) {
    if (this.partido?.estadoPartido == EstadoPartido.PROGRAMADO) {
      this.crud.actualizar(this.partido, 'partido/iniciar/' + this.partido.id).subscribe((resp: Partido) =>{
        this.partido = resp;
      });
    } else if (this.partido?.estadoPartido == EstadoPartido.EN_PROCESO) {
      if (this.partido.torneo?.modalidadEliminatorias == ModalidadFase.PARTIDO_UNICO && this.partido.anotacionesEquipoLocal == this.partido.anotacionesEquipoVisitante && 
        this.partido.penaltisEquipoLocal == this.partido.penaltisEquipoVisitante && this.partido.torneo.faseTorneo != FaseActual.FASE_GRUPOS && this.partido.torneo.faseTorneo != FaseActual.ELIMINATORIAS_GRUPOS) {
        btn['el'].click();
      } else if (this.partido.torneo?.modalidadEliminatorias == ModalidadFase.IDA_VUELTA && this.partido.anotacionesEquipoLocal == this.partido.anotacionesEquipoVisitante) {
        
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
    }, (err) =>{
    });
  }
  modalModificarMarcador(btn: IonButton) {
    btn['el'].click();
  }
  terminarPartido() {
    this.crud.actualizar(this.partido, 'partido/terminar/' + this.partido!.id).subscribe((resp: Partido) =>{
      this.partido = resp;
    });
  }
  terminarPartidoPenaltis(ganador: string) {
    this.crud.actualizar(this.partido, 'partido/terminar-penaltis/' + this.partido!.id + '/' + ganador).subscribe((resp: Partido) =>{
      this.partido = resp;
    });
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
      })
    }
  }
}
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonModal } from '@ionic/angular';
import { CrudService } from 'src/app/services/crud.service';
import { EstadoPartido } from 'src/enums/EstadoPartido';
import { Equipo } from 'src/models/Equipo';
import { Partido } from 'src/models/Partido';
import { Torneo } from 'src/models/Torneo';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false
})
export class Tab1Page implements OnInit {
  listaPartidos: Partido[] = [];
  listaTorneo: Torneo[] = [];
  torneoId?: number;
  fecha?: Date;
  @ViewChild(IonModal) modal!: IonModal;

  constructor(private router: Router,private crud: CrudService) {}
  ngOnInit(): void {
    console.log(this.crud.obtenerUsuario().id);
    
    this.crud.obtener("torneo/usuario/" + this.crud.obtenerUsuario().id).subscribe((resp: Torneo[]) => {
      this.listaTorneo = resp;
      if (this.listaTorneo.length > 0) {
        this.torneoId = this.listaTorneo[0].id;
        this.listarPartidosFechaTorneo(null, this.listaTorneo[0].id!);
      }
    });
  }
  verPartido(id: number) {
    this.router.navigateByUrl('/auth/partidos/partido/' + id);
  }
  escudoEquipo(equipo?: Equipo): string {
    return equipo?.escudo ? 'data:image/png;base64,' + equipo.escudo : 'assets/icon/favicon.png';
  }
  mostrarFecha(fechaPartido: Date) {
    let fecha = new Date(fechaPartido);
    return fecha.getDay() + '/' + (fecha.getMonth() + 1)+ '/' + fecha.getFullYear() + ' - ' + fecha.getHours() + ':' + fecha.getMinutes();
  }
  cerraModal() {
    this.modal.dismiss(null, 'cancel');
  }
  listarPartidosFechaTorneo(fecha: Date | null, idTorneo: number) {
    if (fecha == null) {
      fecha = new Date();
    } else {
      fecha = new Date(fecha);
    }
    this.crud.obtener('partido/programado_proceso/' + fecha.getTime() + '/' + idTorneo).subscribe((resp: Partido[]) =>{
      this.listaPartidos = resp;
    });
  }
  colorEstadoPartido(partido: Partido){
    let color = "";
    switch (partido.estadoPartido) {
      case EstadoPartido.PENDIENTE:
        color = "danger"
        break;
      case EstadoPartido.PROGRAMADO:
        color = "dark"
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
  colorGanador(partido: Partido, equipo: Equipo){
    let color = "dark";
    let gandor = this.confirmarGanador(partido);
    if (gandor == equipo.nombre) {
      return color;
    }
    return "";
  }
  confirmarGanador(partido: Partido) {
    if (partido.anotacionesEquipoLocal! > partido.anotacionesEquipoVisitante! || partido.penaltisEquipoLocal! > partido.penaltisEquipoVisitante!) {
      return partido.equipoLocal?.nombre;
    } else if (partido.anotacionesEquipoLocal! < partido.anotacionesEquipoVisitante! || partido.penaltisEquipoLocal! < partido.penaltisEquipoVisitante!) {
      return partido.equipoVisitante?.nombre;
    }
    return '';
  }
  handleRefresh(event: CustomEvent | any) {
    setTimeout(() => {
      this.listarPartidosFechaTorneo(this.fecha!,this.torneoId!);
      (event.target as HTMLIonRefresherElement).complete();
    }, 2000);
  }
}

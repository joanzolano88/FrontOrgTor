import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Equipo } from 'src/models/Equipo';
import { Torneo } from 'src/models/Torneo';
import { TorneoService } from '../torneo.service';
import { IonImg, IonList, IonCardSubtitle } from "@ionic/angular/standalone";

@Component({
  selector: 'app-lista-torneo',
  templateUrl: './lista-torneo.component.html',
  styleUrls: ['./lista-torneo.component.scss'],
  standalone: false,
})
export class ListaTorneoComponent {
  listaToneos: Torneo[] = [];
  fecha: any;
  constructor(private router: Router, private torneoService: TorneoService) {
    torneoService.listaTorneosOrganizador().subscribe((resp: Torneo[]) => {
      this.listaToneos = resp;      
    });
  }
  informacionPartido(){
    console.log(this.fecha);
  }
  calcularPuntos(equipo: Equipo){
    return equipo.partidosGanados! * 3 + equipo.partidosEmpatados!;
  }
  calcularDG(equipo: Equipo){
    return equipo.anotacionesAFavor! - equipo.anotacionesEnContra!;
  }
  verTorneo(id?: number) {
    this.router.navigateByUrl('/tabs/torneos/torneo/' + id);
  }
}

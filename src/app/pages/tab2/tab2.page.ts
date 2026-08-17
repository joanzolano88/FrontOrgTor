import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';
import { Equipo } from 'src/models/Equipo';
import { Torneo } from 'src/models/Torneo';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false
})
export class Tab2Page {
  listaToneo: Torneo[] = [];
  fecha: any;
  constructor(private router: Router, private crud: CrudService) {
    crud.obtener("torneo/usuario/" + crud.obtenerUsuario().id).subscribe((resp: Torneo[]) => {
      this.listaToneo = resp;
    })
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
    this.router.navigateByUrl('/tabs/tab2/torneo/' + id);
  }
  pageCrearTorneo() {
    this.router.navigateByUrl('/tabs/tab2/crear-torneo');
  }
}

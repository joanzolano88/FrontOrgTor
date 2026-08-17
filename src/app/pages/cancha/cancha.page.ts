import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';
import { ExtraerInfService } from 'src/app/services/extraer-inf.service';
import { Cancha } from 'src/models/Cancha';
import { Torneo } from 'src/models/Torneo';

@Component({
  selector: 'app-cancha',
  templateUrl: './cancha.page.html',
  styleUrls: ['./cancha.page.scss'],
  standalone: false
})
export class CanchaPage {
  
  cancha: Cancha = new Cancha();
  ubicacion: string = '';

  constructor(private route: ActivatedRoute, private router: Router,
              private extraerInf: ExtraerInfService,private crud: CrudService) {
    if (route.snapshot.paramMap.get('idCancha') != undefined) {
      this.cancha.id = parseInt(route.snapshot.paramMap.get('idCancha')!);
      crud.obtenerParametro(this.cancha.id,'cancha').subscribe((resp: Cancha) =>{
        this.cancha = resp;
        this.ubicacion = this.cancha.latitud + ', ' + this.cancha.longitud;
      })
    } else {
      crud.obtenerParametro(route.snapshot.paramMap.get('idTorneo'),'torneo').subscribe((resp: Torneo) => {
        this.cancha.torneo = resp;
      });
    }
  }
  tituloTab() {
    return this.extraerInf.tituloTab(this.router.url.includes('crear-cancha'));
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.cancha.longitud = this.ubicacion.substring(this.ubicacion.indexOf(',') + 1, this.ubicacion.length).replace(' ','');
    this.cancha.latitud = this.ubicacion.substring(0,this.ubicacion.indexOf(',')).replace(' ','');
    if (this.cancha.id != undefined ) {
      this.crud.actualizar(this.cancha, 'cancha').subscribe((resp: Cancha) =>{
        this.cancha = resp;
      });
    } else {
      this.crud.crear(this.cancha, 'cancha').subscribe((resp: Cancha) =>{
        this.cancha = resp;
      });
    }
  }
}

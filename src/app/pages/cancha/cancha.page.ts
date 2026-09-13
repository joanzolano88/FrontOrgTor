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
  mensajeError = '';
  isAlertOpen = false;

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

  usarUbicacionActual() {
    if (!navigator.geolocation) {
      this.mostrarMensaje('Este dispositivo no permite obtener la ubicación.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      posicion => {
        this.ubicacion = `${posicion.coords.latitude}, ${posicion.coords.longitude}`;
      },
      () => this.mostrarMensaje('No se pudo obtener la ubicación. Autoriza el acceso al GPS e inténtalo nuevamente.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }

  private mostrarMensaje(mensaje: string) {
    this.mensajeError = mensaje;
    this.isAlertOpen = true;
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }
    const coordenadas = this.ubicacion.split(',').map(valor => valor.trim());
    if (coordenadas.length !== 2 || coordenadas.some(valor => Number.isNaN(Number(valor)))) {
      this.mostrarMensaje('Usa una ubicación válida o pulsa “Usar mi ubicación actual”.');
      return;
    }
    this.cancha.latitud = coordenadas[0];
    this.cancha.longitud = coordenadas[1];
    if (this.cancha.id != undefined ) {
      this.crud.actualizar(this.cancha, 'cancha').subscribe((resp: Cancha) =>{
        this.cancha = resp;
        this.router.navigateByUrl('/auth/torneos/torneo/' + this.cancha.torneo?.id);
      });
    } else {
      this.crud.crear(this.cancha, 'cancha').subscribe((resp: Cancha) =>{
        this.cancha = resp;
        this.router.navigateByUrl('/auth/torneos/torneo/' + this.cancha.torneo?.id);
      });
    }
  }
}

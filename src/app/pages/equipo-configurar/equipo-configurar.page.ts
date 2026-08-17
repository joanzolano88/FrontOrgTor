import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Equipo } from 'src/models/Equipo';
import { NgForm } from '@angular/forms';
import { Persona } from 'src/models/Persona';
import { IonInput } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';
import { Torneo } from 'src/models/Torneo';
import { Location } from '@angular/common';

@Component({
  selector: 'app-equipo-configurar',
  templateUrl: './equipo-configurar.page.html',
  styleUrls: ['./equipo-configurar.page.scss'],
  standalone: false
})
export class EquipoConfigurarPage{
  
  torneo: Torneo = new Torneo();
  equipo: Equipo = new Equipo();
  delegado: Persona = new Persona();
  idEquipo?: string;
  delegadoLista: Persona[] = [];
  escudoEquipo: any;
  identificacionDelegado: any;
  isAlertOpen = false;
  crearDelegado: string = 'ver';
  alertButtons = ['Aceptar'];
  mensajeError: string = "";
  
  constructor(private router: Router, private crud: CrudService, private route: ActivatedRoute,
                private location: Location, private cd: ChangeDetectorRef) {
    this.equipo.delegado = new Persona();
    this.idEquipo = route.snapshot.paramMap.get('idEquipo')!;
    crud.obtenerParametro(route.snapshot.paramMap.get('idTorneo'), "torneo").subscribe((respT: Torneo) =>{
      this.torneo = respT;
    }, err=>{
      this.mensajeError = err.error.message;
      this.setOpen(true);
      
    });
    if (this.idEquipo != undefined) {
      crud.obtenerParametro(this.idEquipo, "equipo").subscribe(async (respE: Equipo) =>{
        this.equipo = respE;
        if (this.equipo.delegado) {
          this.delegado = this.equipo.delegado;
        }
        this.escudoEquipo = this.equipo.escudo;
        this.identificacionDelegado = this.delegado?.identificacion;
        
        (document.getElementById('img-escudo') as HTMLImageElement).src =  'data:image/png;base64,' + this.escudoEquipo;
        (document.getElementById('img-identificacion') as HTMLImageElement).src =  'data:image/png;base64,' + this.identificacionDelegado;
      }, err=>{
        this.mensajeError = err.error.message;
        this.setOpen(true);
        
      });
    }
  }
  cargarImagen(imgElem: HTMLImageElement, tipo: string, input?: Event) {
    if (input) {
      let file: any = input.target;
      if (tipo == "escudo") {
        this.equipo.escudo = undefined;
        this.escudoEquipo = file.files[0];
        imgElem.src = URL.createObjectURL(this.escudoEquipo);
      } else if (tipo == "identificacion") {
        this.delegado.identificacion = undefined
        this.identificacionDelegado = file.files[0];
        imgElem.src = URL.createObjectURL(this.identificacionDelegado);
      }
    }
  }
  activarSubirArchivo(elemtIon: IonInput){
    let btnFile: any = elemtIon["el"].children[0];
    btnFile.click();
  }
  tarerPersonas() {
    this.crud.obtener('persona').subscribe((resp: Persona[]) =>{
      this.delegadoLista = resp;
    });
  }
  buscadorDelegado() {

  }
  guardarDelegado() {
    console.log(this.identificacionDelegado);
    if (this.identificacionDelegado == undefined || this.delegado.nombre == undefined || this.delegado.numeroCelular == undefined) {
      return;
    }
    this.crud.crearUsuario(this.delegado,'persona', null, this.identificacionDelegado).subscribe((resp: Persona) =>{
      this.delegado = new Persona();
      this.equipo.delegado = resp;
      this.crearDelegado = 'ver';
    },);
  }
  imgEscudo() {
    if (this.escudoEquipo != null && this.equipo.escudo == undefined) {
      return URL.createObjectURL(this.escudoEquipo);
    } else if (this.escudoEquipo != null && this.equipo.escudo != undefined) {
      return 'data:image/png;base64,' + this.escudoEquipo;
    } 
    return 'https://ionicframework.com/docs/img/demos/thumbnail.svg';
  }
  imgIdentificacion() {
    if (this.identificacionDelegado != null && this.delegado!.identificacion == undefined) {
      return URL.createObjectURL(this.identificacionDelegado);
    }else if (this.delegado!.identificacion != undefined) {
      return 'data:image/png;base64,' + this.identificacionDelegado;
    }
    return 'https://ionicframework.com/docs/img/demos/thumbnail.svg';
  }
  seleccionarDelegado(delegadoS: Persona,) {
    this.crearDelegado = 'ver';
    this.delegado = delegadoS;
    this.equipo.delegado = this.delegado;
    //this.identificacionDelegado = this.dataURLtoFile('data:image/png;base64,' + this.delegado?.identificacion, 'identificacion');
    this.cargarImagen((document.getElementById('img-identificacion') as HTMLImageElement), this.identificacionDelegado);
  }
  onSubmit(form: NgForm) {
    if (form.invalid || this.delegado!.id == undefined) {
      if (this.delegado!.id == undefined) {
        
        this.mensajeError = "Falta un delegado";
        this.setOpen(true);
      }
      return;
    }
    this.equipo.torneo = this.torneo;
    if (this.equipo.grupo == undefined) {
      this.equipo.grupo = 0;
    }
    if (this.equipo.id == undefined) {
      this.crud.crearUsuario(this.equipo,'equipo', this.escudoEquipo, null).subscribe((resp: Equipo) =>{
        this.equipo = resp;
        this.location.back();
      }, err=>{
        this.mensajeError = err.error.message;
        this.setOpen(true);
      });
    } else {
      this.crud.actualizarUsuario(this.equipo,'equipo', this.escudoEquipo, null).subscribe((resp: Equipo) =>{
        this.equipo = resp;
        this.location.back();
      }, err=>{
        this.mensajeError = err.error.message;
        this.setOpen(true);
      });
    }
  }
  setOpen(isOpen: boolean) {
    this.isAlertOpen = isOpen;
  }
}

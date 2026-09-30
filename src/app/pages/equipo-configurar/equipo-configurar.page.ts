import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Equipo } from 'src/models/Equipo';
import { NgForm } from '@angular/forms';
import { Persona } from 'src/models/Persona';
import { IonInput } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';
import { Torneo } from 'src/models/Torneo';
import { Ciudad } from 'src/models/Ciudad';
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
  idTorneo?: string;
  delegadLista: Persona[] = [];
  paises: any[] = [];
  departamentos: any[] = [];
  ciudades: any[] = [];
  paisSeleccionado?: number;
  departamentoSeleccionado?: number;
  ciudadSeleccionada?: number;
  delegadoLista: Persona[] = [];
  escudoEquipo: any;
  identificacionDelegado: any;
  isAlertOpen = false;
  crearDelegado: string = 'ver';
  alertButtons = ['Aceptar'];
  mensajeError: string = "";
  
  constructor(private router: Router, private crud: CrudService, private route: ActivatedRoute,
                private location: Location, private cd: ChangeDetectorRef) {
    const usuarioSesion = this.crud.obtenerUsuario();
    if (usuarioSesion) {
      this.equipo.delegado = usuarioSesion as any;
      this.delegado = usuarioSesion as any;
    } else {
      this.equipo.delegado = new Persona();
    }
    this.idEquipo = route.snapshot.paramMap.get('idEquipo')!;
    this.idTorneo = route.snapshot.paramMap.get('idTorneo') || undefined;
    this.cargarPaises();
    if (this.idTorneo) {
      crud.obtenerParametro(this.idTorneo, "torneo").subscribe((respT: Torneo) =>{
        this.torneo = respT;
      }, err=>{
        this.mensajeError = err.error.message;
        this.setOpen(true);
      });
    }
    if (this.idEquipo != undefined) {
      crud.obtenerParametro(this.idEquipo, "equipo").subscribe(async (respE: Equipo) =>{
        this.equipo = respE;
        if (this.equipo.delegado) {
          this.delegado = this.equipo.delegado;
        }
        this.escudoEquipo = this.equipo.escudo;
        this.identificacionDelegado = this.delegado?.identificacion;
        
        (document.getElementById('img-escudo') as HTMLImageElement).src = this.escudoEquipo
          ? 'data:image/png;base64,' + this.escudoEquipo
          : 'assets/images/shield-placeholder.svg';
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
  cargarPaises() {
    this.crud.obtenerPaises().subscribe((resp: any[]) => {
      this.paises = resp || [];
      const colombia = this.paises.find(p => p.nombre?.toLowerCase() === 'colombia');
      if (colombia) {
        this.paisSeleccionado = colombia.id;
        this.cargarDepartamentos(colombia.id);
      }
    });
  }

  cargarDepartamentos(paisId: number) {
    this.crud.obtenerDepartamentosPorPais(paisId).subscribe((resp: any[]) => {
      this.departamentos = resp || [];
      if (this.departamentos.length > 0) {
        this.departamentoSeleccionado = this.departamentos[0].id;
        this.cargarCiudades(this.departamentos[0].id);
      } else {
        this.departamentos = [];
        this.ciudades = [];
        this.departamentoSeleccionado = undefined;
        this.ciudadSeleccionada = undefined;
      }
    });
  }

  cargarCiudades(departamentoId: number) {
    this.crud.obtenerCiudadesPorDepartamento(departamentoId).subscribe((resp: any[]) => {
      this.ciudades = resp || [];
      if (this.ciudades.length > 0) {
        this.ciudadSeleccionada = this.ciudades[0].id;
        const ciudad = this.ciudades.find(c => c.id === this.ciudadSeleccionada);
        this.equipo.ciudad = ciudad || undefined;
      } else {
        this.ciudadSeleccionada = undefined;
        this.equipo.ciudad = undefined;
      }
    });
  }

  seleccionarPais(paisId: number) {
    this.paisSeleccionado = paisId;
    this.cargarDepartamentos(paisId);
  }

  seleccionarDepartamento(departamentoId: number) {
    this.departamentoSeleccionado = departamentoId;
    this.cargarCiudades(departamentoId);
  }

  seleccionarCiudad(ciudadId: number) {
    this.ciudadSeleccionada = ciudadId;
    const ciudad = this.ciudades.find(c => c.id === ciudadId);
    this.equipo.ciudad = ciudad || undefined;
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
    return 'assets/images/shield-placeholder.svg';
  }
  imgIdentificacion() {
    if (this.identificacionDelegado != null && this.delegado!.identificacion == undefined) {
      return URL.createObjectURL(this.identificacionDelegado);
    }else if (this.delegado!.identificacion != undefined) {
      return 'data:image/png;base64,' + this.identificacionDelegado;
    }
    return 'assets/images/avatar-placeholder.svg';
  }
  seleccionarDelegado(delegadoS: Persona,) {
    this.crearDelegado = 'ver';
    this.delegado = delegadoS;
    this.equipo.delegado = this.delegado;
    //this.identificacionDelegado = this.dataURLtoFile('data:image/png;base64,' + this.delegado?.identificacion, 'identificacion');
    this.cargarImagen((document.getElementById('img-identificacion') as HTMLImageElement), this.identificacionDelegado);
  }
  volverAtras() {
    if (this.idTorneo) {
      this.router.navigateByUrl(`/auth/torneos/torneo/${this.idTorneo}/solicitar-equipo`);
      return;
    }
    this.location.back();
  }

  onSubmit(form: NgForm) {
    if (form.invalid || !this.equipo.delegado?.id) {
      this.mensajeError = 'No se pudo identificar al delegado autenticado.';
      this.setOpen(true);
      return;
    }
    this.equipo.torneo = undefined;
    this.equipo.delegado = this.delegado;
    if (this.equipo.grupo == undefined) {
      this.equipo.grupo = 0;
    }
    if (this.equipo.id == undefined) {
      this.crud.crearUsuario(this.equipo,'equipo', this.escudoEquipo, null).subscribe((resp: Equipo) =>{
        this.equipo = resp;
        if (this.idTorneo) {
          this.router.navigateByUrl(`/auth/torneos/torneo/${this.idTorneo}/solicitar-equipo?equipo=${resp.id}`);
          return;
        }
        this.location.back();
      }, err=>{
        this.mensajeError = err.error.message;
        this.setOpen(true);
      });
    } else {
      this.crud.actualizarUsuario(this.equipo,'equipo', this.escudoEquipo, null).subscribe((resp: Equipo) =>{
        this.equipo = resp;
        if (this.idTorneo) {
          this.router.navigateByUrl(`/auth/torneos/torneo/${this.idTorneo}/solicitar-equipo`);
          return;
        }
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

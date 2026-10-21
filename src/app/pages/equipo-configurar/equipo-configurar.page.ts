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
  editando = false;
  perfilTorneo = false;
  cargandoEquipo = false;
  cargandoDelegados = false;
  delegadLista: Persona[] = [];
  paises: any[] = [];
  departamentos: any[] = [];
  ciudades: any[] = [];
  paisSeleccionado?: number;
  departamentoSeleccionado?: number;
  ciudadSeleccionada?: number;
  delegadoLista: Persona[] = [];
  nuevoDelegadoId?: number;
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
    this.editando = !!this.idEquipo;
    this.perfilTorneo = route.snapshot.url.some(segment => segment.path === 'perfil-torneo');
    if (this.idTorneo) {
      crud.obtenerParametro(this.idTorneo, "torneo").subscribe((respT: Torneo) =>{
        this.torneo = respT;
      }, err=>{
        this.mensajeError = err.error.message;
        this.setOpen(true);
      });
    }
    if (this.idEquipo != undefined) {
      this.cargandoEquipo = true;
      crud.obtenerParametro(this.idEquipo, "equipo").subscribe(async (respE: Equipo) =>{
        this.equipo = respE;
        if (this.equipo.delegado) {
          this.delegado = this.equipo.delegado;
          this.nuevoDelegadoId = this.equipo.delegado.id;
        }
        this.escudoEquipo = this.equipo.escudo;
        this.identificacionDelegado = this.delegado?.identificacion;
        if (this.perfilTorneo) {
          this.cargarDelegados();
        } else {
          this.cargarPaises();
        }
        this.cargandoEquipo = false;
      }, err=>{
        this.mensajeError = err.error.message;
        this.setOpen(true);
        this.cargandoEquipo = false;
      });
    } else {
      this.cargarPaises();
    }
  }

  private cargarDelegados(): void {
    this.cargandoDelegados = true;
    this.crud.obtener('persona').subscribe({
      next: (personas: Persona[]) => {
        this.delegadoLista = personas || [];
        this.cargandoDelegados = false;
      },
      error: err => {
        this.mensajeError = err?.error?.message || 'No se pudieron cargar los delegados disponibles.';
        this.setOpen(true);
        this.cargandoDelegados = false;
      }
    });
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
      const departamentoActual = this.equipo.ciudad?.departamento;
      const paisActualId = departamentoActual?.pais?.id;
      const pais = this.paises.find(item => item.id === paisActualId) ||
        this.paises.find(item => item.nombre?.toLowerCase() === 'colombia');
      if (pais) {
        this.paisSeleccionado = pais.id;
        this.cargarDepartamentos(pais.id, departamentoActual?.id, this.equipo.ciudad?.id);
      }
    });
  }

  cargarDepartamentos(paisId: number, departamentoId?: number, ciudadId?: number) {
    this.crud.obtenerDepartamentosPorPais(paisId).subscribe((resp: any[]) => {
      this.departamentos = resp || [];
      if (this.departamentos.length > 0) {
        const departamento = this.departamentos.find(item => item.id === departamentoId) || this.departamentos[0];
        this.departamentoSeleccionado = departamento.id;
        this.cargarCiudades(departamento.id, ciudadId);
      } else {
        this.departamentos = [];
        this.ciudades = [];
        this.departamentoSeleccionado = undefined;
        this.ciudadSeleccionada = undefined;
      }
    });
  }

  cargarCiudades(departamentoId: number, ciudadId?: number) {
    this.crud.obtenerCiudadesPorDepartamento(departamentoId).subscribe((resp: any[]) => {
      this.ciudades = resp || [];
      if (this.ciudades.length > 0) {
        const ciudad = this.ciudades.find(item => item.id === ciudadId) || this.ciudades[0];
        this.ciudadSeleccionada = ciudad.id;
        this.equipo.ciudad = ciudad;
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
    if (this.editando && this.equipo.id) {
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      if (returnUrl) {
        this.router.navigateByUrl(returnUrl);
        return;
      }
      this.router.navigateByUrl(`/auth/equipo/${this.equipo.id}`);
      return;
    }
    if (this.idTorneo) {
      this.router.navigateByUrl(`/auth/torneos/torneo/${this.idTorneo}/solicitar-equipo`);
      return;
    }
    this.location.back();
  }

  onSubmit(form: NgForm) {
    if (this.perfilTorneo) {
      this.guardarPerfilTorneo(form);
      return;
    }
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
        this.router.navigateByUrl(`/auth/equipo/${resp.id}`);
      }, err=>{
        this.mensajeError = err.error.message;
        this.setOpen(true);
      });
    }
  }

  private guardarPerfilTorneo(form: NgForm): void {
    const equipoId = Number(this.equipo.id);
    const delegadoId = Number(this.nuevoDelegadoId);
    if (form.invalid || !Number.isFinite(equipoId) || equipoId <= 0 ||
        !Number.isFinite(delegadoId) || delegadoId <= 0) {
      this.mensajeError = 'Selecciona un delegado válido antes de guardar.';
      this.setOpen(true);
      return;
    }
    this.crud.actualizarPerfilEquipoTorneo(equipoId, delegadoId,
      this.escudoEquipo instanceof Blob ? this.escudoEquipo : undefined).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl || `/auth/equipo/${equipoId}`);
      },
      error: err => {
        this.mensajeError = err?.error?.message || 'No se pudo actualizar el escudo y el delegado.';
        this.setOpen(true);
      }
    });
  }
  setOpen(isOpen: boolean) {
    this.isAlertOpen = isOpen;
  }
}

import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonInput } from '@ionic/angular';
import { CrudService } from 'src/app/services/crud.service';
import { ExtraerInfService } from 'src/app/services/extraer-inf.service';
import { ModalidadFase } from 'src/enums/ModalidadFase';
import { ModalidadTorneo } from 'src/enums/ModalidadTorneo';
import { Torneo } from 'src/models/Torneo';
import { Usuario } from 'src/models/Usuario';
import { Deporte } from 'src/models/Deporte';

@Component({
  selector: 'app-crear-torneo',
  templateUrl: './crear-torneo.page.html',
  styleUrls: ['./crear-torneo.page.scss'],
  standalone: false
})
export class CrearTorneoPage {
  isAlertOpen = false;
  mensajeAlert = '';
  tituloAlert = 'Aviso';
  listaModalidadToreno: string[] = [];
  listaModalidadFase: string[] = [];
  nombreArchivo: string = "";
  archivo: any;
  torneo: Torneo = new Torneo();
  paises: any[] = [];
  departamentos: any[] = [];
  ciudades: any[] = [];
  paisSeleccionado?: number;
  departamentoSeleccionado?: number;
  ciudadSeleccionada?: number;
  deportes: Deporte[] = [];

  constructor(private extraerInf: ExtraerInfService, private crud: CrudService,
              private router: Router, private route: ActivatedRoute) {
    this.listaModalidadToreno = extraerInf.enums(ModalidadTorneo);
    this.listaModalidadFase = extraerInf.enums(ModalidadFase);
    this.cargarPaises();
    this.crud.obtener('deporte').subscribe((resp: Deporte[]) => this.deportes = resp || []);
    let idTorneo = route.snapshot.paramMap.get('idTorneo');
    if (idTorneo) {
      crud.obtenerParametro(idTorneo, "torneo").subscribe((respT: Torneo) =>{
        this.torneo = respT;
      });
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
        this.departamentoSeleccionado = undefined;
        this.ciudades = [];
        this.ciudadSeleccionada = undefined;
      }
    });
  }

  cargarCiudades(departamentoId: number) {
    this.crud.obtenerCiudadesPorDepartamento(departamentoId).subscribe((resp: any[]) => {
      this.ciudades = resp || [];
      if (this.ciudades.length > 0) {
        this.ciudadSeleccionada = this.ciudades[0].id;
        this.torneo.ciudad = this.ciudades[0];
      } else {
        this.ciudadSeleccionada = undefined;
      }
      this.actualizarUbicacion();
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
    this.torneo.ciudad = ciudad || null;
    this.actualizarUbicacion();
  }

  actualizarUbicacion() {
    const pais = this.paises.find(p => p.id === this.paisSeleccionado)?.nombre || '';
    const departamento = this.departamentos.find(d => d.id === this.departamentoSeleccionado)?.nombre || '';
    const ciudad = this.ciudades.find(c => c.id === this.ciudadSeleccionada)?.nombre || (this.torneo.ciudad?.nombre || '');
    const ubicacion = [pais, departamento, ciudad].filter(Boolean).join(' - ');
    if (ubicacion) {
      this.torneo.ubicacion = ubicacion;
    }
  }

  activarSubirArchivo(elemtIon: IonInput){
    let btnFile: any = elemtIon["el"].children[0];
    btnFile.click();
  }

  cargarArchivo(input: Event) {
    this.archivo = input.target;
    this.archivo = this.archivo.files[0];
    this.nombreArchivo = this.archivo == undefined? null: this.archivo.name;
  }

  tieneError(form: NgForm, control: string): boolean {
    return !!form.submitted && !!form.controls[control]?.errors;
  }

  mostrarAlerta(titulo: string, mensaje: string) {
    this.tituloAlert = titulo;
    this.mensajeAlert = mensaje;
    this.isAlertOpen = true;
  }
  
  onSubmit(form: NgForm) {
    let usuario: Usuario = this.crud.obtenerUsuario();
    if (form.invalid || !usuario?.id) {
      this.mostrarAlerta('Campos inválidos', 'Completa todos los campos obligatorios del torneo.');
      return;
    }
    this.crud.obtenerParametro(usuario.id, 'usuario').subscribe({
      next: (usuarioActual: Usuario) => this.guardarTorneo(form, usuarioActual),
      error: () => this.mostrarAlerta('Error de sesión', 'No se pudo consultar la información actual del organizador.')
    });
  }

  private guardarTorneo(form: NgForm, usuario: Usuario) {
    if (!usuario?.ubicacion?.trim()) {
      this.mostrarAlerta('Ubicación requerida', 'Registra y guarda la ubicación del organizador en Mi perfil antes de crear un torneo.');
      return;
    }
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.torneo.encargadoTorneo = usuario;
    if (!this.torneo.ubicacion || !this.torneo.ubicacion.trim()) {
      this.torneo.ubicacion = usuario.ubicacion;
    }
    this.crud.crearArchivo(this.torneo, "torneo", this.archivo)?.subscribe({
      next: () => {
        this.mostrarAlerta('Torneo creado', 'El torneo se creó correctamente.');
      },
      error: err => {
        const mensaje = err?.error?.message || 'No se pudo crear el torneo. Verifica los datos e inténtalo nuevamente.';
        this.mostrarAlerta('Error al crear torneo', mensaje);
      }
    });
  }

  cerrarAlerta() {
    this.isAlertOpen = false;
    if (this.tituloAlert === 'Torneo creado') {
      this.router.navigateByUrl('/auth/torneos');
    }
  }
  tituloTab() {
    return this.extraerInf.tituloTab(this.router.url.includes('crear-torneo'));
  }
  textoCantidadEquipos() {
    if (this.torneo.modalidadTorneo == ModalidadTorneo.ELIMINATORIAS_GRUPOS || this.torneo.modalidadTorneo == ModalidadTorneo.GRUPOS) {
      return 'por Grupo';
    }
    return '';
  }
}
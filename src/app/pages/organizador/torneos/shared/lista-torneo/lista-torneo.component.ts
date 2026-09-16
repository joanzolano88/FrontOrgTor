import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Equipo } from 'src/models/Equipo';
import { Torneo } from 'src/models/Torneo';
import { TorneoService } from '../torneo.service';
import { IonImg, IonList, IonCardSubtitle } from "@ionic/angular/standalone";
import { CrudService } from 'src/app/services/crud.service';
import { TipoUsuario } from 'src/enums/TipoUsuario';
import { EstadoTorneo } from 'src/enums/EstadoTorneo';

@Component({
  selector: 'app-lista-torneo',
  templateUrl: './lista-torneo.component.html',
  styleUrls: ['./lista-torneo.component.scss'],
  standalone: false,
})
export class ListaTorneoComponent {
  listaTorneos: Torneo[] = [];
  listaTorneosFiltrados: Torneo[] = [];
  filtroNombre = '';
  filtroPais = 'Seleccione un país';
  filtroDepartamento = 'Seleccione un departamento';
  filtroCiudad = 'Seleccione una ciudad';
  filtroEstado = 'Todos';
  mostrarSoloMios = false;
  esOrganizador = false;
  fecha: any;

  paises: string[] = ['Seleccione un país'];
  departamentos: string[] = ['Seleccione un departamento'];
  ciudadesDisponibles: string[] = [];
  estadosTorneo = ['Todos', ...Object.values(EstadoTorneo)];

  constructor(private router: Router, private torneoService: TorneoService, private crud: CrudService) {
    this.cargarTorneos();
  }

  ionViewWillEnter() {
    this.esOrganizador = this.crud.obtenerUsuario()?.tipoUsuario === TipoUsuario.ORGANIZADOR;
    this.cargarTorneos();
  }

  private cargarTorneos() {
    this.torneoService.listaTorneos(this.filtroDepartamento, this.mostrarSoloMios).subscribe((resp: Torneo[]) => {
      this.listaTorneos = resp || [];
      this.paises = ['Seleccione un país', ...this.obtenerValoresUnicos(this.listaTorneos.map(t => this.getPaisNombre(t)).filter(Boolean))];
      this.departamentos = ['Seleccione un departamento', ...this.obtenerValoresUnicos(this.listaTorneos.map(t => this.getDepartamentoNombre(t)).filter(Boolean))];
      this.ciudadesDisponibles = this.obtenerValoresUnicos(this.listaTorneos.map(t => this.getCiudadNombre(t)).filter(Boolean));
      if (!this.ciudadesDisponibles.includes(this.filtroCiudad) && this.filtroCiudad !== 'Seleccione una ciudad') {
        this.filtroCiudad = 'Seleccione una ciudad';
      }
      console.log(this.listaTorneos);
      
      this.filtrar();
    });
  }

  etiquetaEstado(torneo: Torneo): string {
    const etiquetas: Record<string, string> = {
      INSCRIPCIONES: 'Inscripciones abiertas',
      INSCRIPCIONES_ACTIVO: 'Inscripciones activas',
      ACTIVO: 'Torneo activo',
      FINALIZADO: 'Finalizado'
    };
    return etiquetas[torneo.estadoTorneo as string] || 'Estado pendiente';
  }

  colorEstado(torneo: Torneo): string {
    const colores: Record<string, string> = {
      INSCRIPCIONES: 'warning',
      INSCRIPCIONES_ACTIVO: 'primary',
      ACTIVO: 'success',
      FINALIZADO: 'medium'
    };
    return colores[torneo.estadoTorneo as string] || 'dark';
  }

  private obtenerValoresUnicos(valores: string[]): string[] {
    return [...new Set(valores.map(v => v.trim()).filter(v => v.length > 0).sort((a, b) => a.localeCompare(b)))];
  }

  private getPaisNombre(torneo: Torneo): string {
    const ciudad = torneo.ciudad as any;
    return ciudad?.departamento?.pais?.nombre || 'Colombia';
  }

  private getDepartamentoNombre(torneo: Torneo): string {
    const ciudad = torneo.ciudad as any;
    return ciudad?.departamento?.nombre || this.mapearDepartamento(this.getCiudadNombre(torneo));
  }

  getCiudadNombre(torneo: Torneo): string {
    const ciudad = torneo.ciudad as any;
    if (typeof ciudad === 'string') {
      return ciudad;
    }
    return ciudad?.nombre || '';
  }

  filtrar() {
    const nombre = this.filtroNombre.trim().toLocaleLowerCase();
    const usuario = this.crud.obtenerUsuario();
    const filtrosActivos = {
      pais: this.filtroPais,
      departamento: this.filtroDepartamento,
      ciudad: this.filtroCiudad,
      estado: this.filtroEstado,
    };

    this.listaTorneosFiltrados = this.listaTorneos.filter(torneo => {
      const ciudadNombre = this.getCiudadNombre(torneo);
      const departamentoNombre = this.getDepartamentoNombre(torneo);
      const paisNombre = this.getPaisNombre(torneo);
      const coincideNombre = !nombre || torneo.nombre?.toLocaleLowerCase().includes(nombre);
      const coincidePais = filtrosActivos.pais === 'Todos' || paisNombre.toLowerCase() === filtrosActivos.pais.toLowerCase();
      const coincideDepartamento = filtrosActivos.departamento === 'Todos' ||
        (departamentoNombre && departamentoNombre.toLowerCase() === filtrosActivos.departamento.toLowerCase());
      const coincideCiudad = filtrosActivos.ciudad === 'Todos' ||
        (ciudadNombre && ciudadNombre.toLowerCase() === filtrosActivos.ciudad.toLowerCase());
      const coincideEstado = filtrosActivos.estado === 'Todos' || torneo.estadoTorneo === filtrosActivos.estado;
      const coincideUsuario = !this.mostrarSoloMios || torneo.encargadoTorneo?.id === usuario?.id;

      return coincideNombre && coincidePais && coincideDepartamento && coincideCiudad && coincideEstado && coincideUsuario;
    });
  }

  private mapearDepartamento(ciudad: string): string {
    const texto = (ciudad || '').trim().toLowerCase();
    if (texto.includes('popay')) return 'Cauca';
    if (texto.includes('cali')) return 'Valle del Cauca';
    if (texto.includes('pasto')) return 'Nariño';
    if (texto.includes('bogot')) return 'Bogotá D.C.';
    if (texto.includes('medell')) return 'Antioquia';
    return 'Otros';
  }

  get ciudadesPorDepartamento(): string[] {
    if (this.filtroDepartamento === 'Todos') {
      return ['Todos', ...this.ciudadesDisponibles];
    }

    const ciudades = this.ciudadesDisponibles.filter(ciudad => {
      return this.getDepartamentoNombre(this.listaTorneos.find(t => this.getCiudadNombre(t) === ciudad) as Torneo) === this.filtroDepartamento;
    });

    return ['Todos', ...ciudades];
  }
  cambiarDepartamento() {
    this.filtroCiudad = 'Todos';
    this.cargarTorneos();
  }

  cambiarSoloMios() {
    this.cargarTorneos();
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
    this.router.navigateByUrl('/auth/torneos/torneo/' + id);
  }
}

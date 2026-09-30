import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';
import { EstadoPartido } from 'src/enums/EstadoPartido';
import { Equipo } from 'src/models/Equipo';
import { Partido } from 'src/models/Partido';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: false
})
export class InicioPage implements OnInit {
  listaPartidos: Partido[] = [];
  listaTorneo: { label: string; value: number }[] = [];
  paises: any[] = [];
  departamentos: any[] = [];
  ciudades: any[] = [];
  paisId?: number;
  departamentoId?: number;
  ciudadId?: number;
  torneoId?: number;
  fecha: Date = new Date();
  fechasVisibles: Date[] = [];
  cargandoTorneos = false;
  busquedaRealizada = false;
  buscandoPartidos = false;
  
  constructor(private router: Router,private crud: CrudService) {}
  ngOnInit(): void {
    this.fecha = this.inicioDia(new Date());
    this.actualizarFechasVisibles();
    this.crud.obtenerPaises().subscribe((resp: any[]) => this.paises = resp || []);
  }
  inicioDia(fecha: Date): Date {
    const dia = new Date(fecha);
    dia.setHours(0, 0, 0, 0);
    return dia;
  }
  actualizarFechasVisibles() {
    this.fechasVisibles = [-2, -1, 0, 1, 2].map(offset => {
      const dia = new Date(this.fecha);
      dia.setDate(dia.getDate() + offset);
      return dia;
    });
  }
  etiquetaFecha(fecha: Date): string {
    const dia = fecha.getDate();
    const semana = new Intl.DateTimeFormat('es-CO', { weekday: 'short' })
      .format(fecha).replace('.', '');
    return `${dia} ${semana}`;
  }
  moverFecha(dias: number) {
    const siguiente = new Date(this.fecha);
    siguiente.setDate(siguiente.getDate() + dias);
    this.fecha = this.inicioDia(siguiente);
    this.actualizarFechasVisibles();
    this.listaPartidos = [];
    this.busquedaRealizada = false;
  }
  seleccionarFecha(fecha: Date) {
    this.fecha = this.inicioDia(fecha);
    this.actualizarFechasVisibles();
    this.listaPartidos = [];
    this.busquedaRealizada = false;
  }
  seleccionarPais(paisId: number | string) {
    this.paisId = Number(paisId) || undefined;
    this.departamentos = [];
    this.ciudades = [];
    this.listaTorneo = [];
    this.departamentoId = undefined;
    this.ciudadId = undefined;
    this.torneoId = undefined;
    this.listaPartidos = [];
    this.busquedaRealizada = false;
    if (this.paisId) {
      this.crud.obtenerDepartamentosPorPais(this.paisId).subscribe(resp => this.departamentos = resp || []);
    }
  }
  seleccionarDepartamento(departamentoId: number | string) {
    this.departamentoId = Number(departamentoId) || undefined;
    this.ciudades = [];
    this.listaTorneo = [];
    this.ciudadId = undefined;
    this.torneoId = undefined;
    this.listaPartidos = [];
    this.busquedaRealizada = false;
    if (this.departamentoId) {
      this.crud.obtenerCiudadesPorDepartamento(this.departamentoId).subscribe(resp => this.ciudades = resp || []);
    }
  }
  seleccionarCiudad(ciudadId: number | string) {
    this.ciudadId = Number(ciudadId) || undefined;
    this.listaTorneo = [];
    this.torneoId = undefined;
    this.listaPartidos = [];
    this.busquedaRealizada = false;
    if (!this.ciudadId) return;
    this.cargandoTorneos = true;
    this.crud.obtenerTorneosPorCiudad(this.ciudadId).subscribe({
      next: torneos => {
        this.listaTorneo = torneos || [];
        this.torneoId = this.listaTorneo[0]?.value;
        this.cargandoTorneos = false;
      },
      error: () => {
        this.listaTorneo = [];
        this.cargandoTorneos = false;
      }
    });
  }
  seleccionarTorneo(torneoId: number | string) {
    this.torneoId = Number(torneoId) || undefined;
    this.listaPartidos = [];
    this.busquedaRealizada = false;
  }
  nombreCiudadSeleccionada(): string {
    return this.ciudades.find(ciudad => ciudad.id === this.ciudadId)?.nombre || 'esta ciudad';
  }
  verPartido(id: number) {
    this.router.navigateByUrl('/auth/partidos/partido/' + id);
  }
  escudoEquipo(equipo?: Equipo): string {
    return equipo?.escudo ? 'data:image/png;base64,' + equipo.escudo : '';
  }
  ganadorPartido(partido: Partido): 'LOCAL' | 'VISITANTE' | '' {
    const golesLocal = partido.anotacionesEquipoLocal || 0;
    const golesVisitante = partido.anotacionesEquipoVisitante || 0;
    if (golesLocal > golesVisitante) return 'LOCAL';
    if (golesVisitante > golesLocal) return 'VISITANTE';
    const penaltisLocal = partido.penaltisEquipoLocal || 0;
    const penaltisVisitante = partido.penaltisEquipoVisitante || 0;
    if (penaltisLocal > 0 && penaltisLocal > penaltisVisitante) return 'LOCAL';
    if (penaltisVisitante > 0 && penaltisVisitante > penaltisLocal) return 'VISITANTE';
    return '';
  }
  mostrarFecha(fechaPartido: Date) {
    let fecha = new Date(fechaPartido);
    return fecha.getDay() + '/' + (fecha.getMonth() + 1)+ '/' + fecha.getFullYear() + ' - ' + fecha.getHours() + ':' + fecha.getMinutes();
  }
  listarPartidosFechaTorneo() {
    if (!this.torneoId) return;
    this.buscandoPartidos = true;
    this.crud.obtener('partido/programado_proceso/' + this.fecha.getTime() + '/' + this.torneoId).subscribe({
      next: (resp: Partido[]) => {
        this.listaPartidos = resp || [];
        this.busquedaRealizada = true;
        this.buscandoPartidos = false;
      },
      error: () => {
        this.listaPartidos = [];
        this.busquedaRealizada = true;
        this.buscandoPartidos = false;
      }
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
    this.listarPartidosFechaTorneo();
    (event.target as HTMLIonRefresherElement).complete();
  }
}

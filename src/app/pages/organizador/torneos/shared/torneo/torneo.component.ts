import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';
import { FaseActual } from 'src/enums/FaseActual';
import { ModalidadTorneo } from 'src/enums/ModalidadTorneo';
import { Cancha } from 'src/models/Cancha';
import { Torneo } from 'src/models/Torneo';

@Component({
  selector: 'app-torneo',
  templateUrl: './torneo.component.html',
  styleUrls: ['./torneo.component.scss'],
  standalone: false
})
export class TorneoComponent {
  @Input() validarOrganizador: Boolean = false;
  torneo: Torneo = new Torneo();
  listCancha: Cancha[] = [];
  documento: string = "";
  isAlertOpen = false;
  alertButtons = ['Aceptar'];
  mensajeError: string = "";

  constructor(private crud: CrudService, private route: ActivatedRoute,
    private router: Router) {
  }
  ngOnInit(): void {
    this.crud.obtenerParametro(this.route.snapshot.paramMap.get('idTorneo'), "torneo").subscribe((respT: Torneo) =>{
      this.torneo = respT;
      this.crud.obtener('cancha/torneo/' + this.torneo.id).subscribe((respC: Cancha[]) =>{
        this.listCancha = respC;
      });
      /*this.crud.obtenerParametro(this.torneo.id,'torneo/reglamento').subscribe((resp: Reglamento) =>{
        this.documento = resp.reglamento!;
      });*/
    });
  }
  configurarTorneo() {
    this.router.navigateByUrl('tabs/torneos/torneo/' + this.torneo.id + '/configuracion-torneo');
  }
  agregarCancha() {
    this.router.navigateByUrl('tabs/torneos/torneo/' + this.torneo.id + '/crear-cancha');
  }
  configurarCancha(id?: number) {
    this.router.navigateByUrl('tabs/torneos/torneo/' + this.torneo.id + '/configuracion-cancha/' + id);
  }
  tablaEquipos() {
    this.router.navigateByUrl('tabs/torneos/torneo/' + this.torneo.id + '/tabla-equipos');
  }
  listaPartidos() {
    this.router.navigateByUrl('tabs/torneos/torneo/' + this.torneo.id + '/lista-partidos');
  }
  verUbicacion(cancha: Cancha){
    window.open('https://maps.google.com/?q=' + cancha.latitud + ',' + cancha.longitud, '_blank');
  }
  agregarEquipo() {
    this.router.navigateByUrl('tabs/torneos/torneo/' + this.torneo.id + '/crear-equipo');
  }
  agregarPartido() {
    this.router.navigateByUrl('tabs/torneos/torneo/' + this.torneo.id + '/agregar-partido');
  }
  cantidadEquipos() {
    return (this.torneo.modalidadTorneo == ModalidadTorneo.GRUPOS || this.torneo.modalidadTorneo == ModalidadTorneo.ELIMINATORIAS_GRUPOS)? this.torneo.cantidadEquipos!*this.torneo.cantidadGrupos!: this.torneo.cantidadEquipos;
  }
  cambiarFase() {
    if (this.torneo.faseTorneo == FaseActual.FINAL) {
      return;
    }
    this.crud.actualizar(null,'torneo/cambiar_fase/' + this.torneo.id).subscribe((resp: Torneo) =>{
      this.router.navigateByUrl('tabs/torneos/torneo/' + this.torneo.id + '/cambio-fase');
    }, (err: HttpErrorResponse) =>{
      this.mensajeError = err.error.message;
      this.setOpen(true);
    });
  }
  setOpen(isOpen: boolean) {
    this.isAlertOpen = isOpen;
  }
  handleRefresh(event: any) {
    setTimeout(() => {
      this.ngOnInit();
      (event.target as HTMLIonRefresherElement).complete();
    }, 2000);
  }
}

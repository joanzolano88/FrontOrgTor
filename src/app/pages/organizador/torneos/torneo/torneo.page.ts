import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';
import { SesionService } from 'src/app/services/restriccion/sesion.service';
import { Cancha } from 'src/models/Cancha';
import { Torneo } from 'src/models/Torneo';

@Component({
  selector: 'app-torneo-1',
  templateUrl: './torneo.page.html',
  styleUrls: ['./torneo.page.scss'],
  standalone: false
})
export class TorneoPage {
  torneo: Torneo = new Torneo();
  listCancha: Cancha[] = [];
  validarOrganizador: Boolean = false;

  constructor(private crud: CrudService, private route: ActivatedRoute, private sesionService: SesionService) {
  }
  ngOnInit(): void {
    this.validarOrganizador = this.sesionService.validacionOrganizador();
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
}

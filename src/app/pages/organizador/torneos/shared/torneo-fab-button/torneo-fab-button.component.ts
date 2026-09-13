import { Component, OnInit } from '@angular/core';
import { TorneoService } from '../torneo.service';
import { SesionService } from 'src/app/services/restriccion/sesion.service';

@Component({
  selector: 'app-torneo-fab-button',
  templateUrl: './torneo-fab-button.component.html',
  styleUrls: ['./torneo-fab-button.component.scss'],
  standalone: false
})
export class TorneoFabButtonComponent  implements OnInit {
  esOrganizador = false;

  constructor(private torneoService: TorneoService, private sesionService: SesionService) {
    this.esOrganizador = this.sesionService.validacionOrganizador();
  }

  ngOnInit() {
  }
  pageCrearTorneo() {
    this.torneoService.pageCrearTorneo();
  }
}

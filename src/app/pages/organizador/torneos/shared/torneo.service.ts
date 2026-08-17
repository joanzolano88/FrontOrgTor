import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CrudService } from 'src/app/services/crud.service';
import { Torneo } from 'src/models/Torneo';

@Injectable({
  providedIn: 'root'
})
export class TorneoService {

  constructor(private crud: CrudService, private router: Router) { }

  listaTorneos(): Observable<Torneo[]> {
    return this.crud.obtener("torneo/usuario/" + this.crud.obtenerUsuario().id);
  }
  listaTorneosOrganizador(): Observable<Torneo[]> {
    return this.crud.obtener("torneo");
  }
  pageCrearTorneo() {
    this.router.navigateByUrl('/tabs/torneos/crear-torneo');
  }
}

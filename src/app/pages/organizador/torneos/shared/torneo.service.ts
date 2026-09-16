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

  listaTorneos(departamento?: string, soloMios = false): Observable<Torneo[]> {
    const params: string[] = [];
    if (departamento && departamento !== 'Todos' && departamento !== 'Seleccione un departamento') {
      params.push(`departamento=${encodeURIComponent(departamento)}`);
    }
    if (soloMios && this.crud.obtenerUsuario().id) {
      params.push(`usuarioId=${this.crud.obtenerUsuario().id}`);
    }
    return this.crud.obtener(`torneo${params.length ? '?' + params.join('&') : ''}`);
  }
  listaTorneosOrganizador(): Observable<Torneo[]> {
    return this.crud.obtener("torneo/usuario/" + this.crud.obtenerUsuario().id);
  }
  pageCrearTorneo() {
    this.router.navigateByUrl('/auth/torneos/crear-torneo');
  }
}

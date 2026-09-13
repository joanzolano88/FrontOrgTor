import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { CrudService } from '../crud.service';
import { Torneo } from 'src/models/Torneo';

@Injectable({ providedIn: 'root' })
export class PropietarioTorneoGuard implements CanActivate {
  constructor(private crud: CrudService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const usuario = this.crud.obtenerUsuario();
    const idTorneo = route.pathFromRoot
      .map(snapshot => snapshot.paramMap.get('idTorneo'))
      .find(id => id !== null);
    if (!usuario?.id || !idTorneo) {
      return of(this.router.createUrlTree(['/auth/torneos']));
    }
    return this.crud.obtenerParametro(idTorneo, 'torneo').pipe(
      map((torneo: Torneo) => torneo.encargadoTorneo?.id === usuario.id
        ? true
        : this.router.createUrlTree(['/auth/torneos'])),
      catchError(() => of(this.router.createUrlTree(['/auth/torneos'])))
    );
  }
}

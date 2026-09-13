import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaginasService implements CanActivate {

  constructor(private router: Router) { }

  canActivate ( next: ActivatedRouteSnapshot,
          state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean{
    const tipo = localStorage.getItem('tipo');
    let userAuthenticated = false;
    if (userAuthenticated) {
      return true;
    } else {
      return false;
    }
  }
  paginaValidacion(pag: any, rutas: any): boolean{
    for (const item of rutas) {
      if (pag._routerState.url == item.path) {
        return true;
      }
    }
    return false;
  }
}

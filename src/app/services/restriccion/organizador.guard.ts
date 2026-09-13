import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { TipoUsuario } from 'src/enums/TipoUsuario';
import { CrudService } from '../crud.service';

@Injectable({ providedIn: 'root' })
export class OrganizadorGuard implements CanActivate {
  constructor(private crud: CrudService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    return this.crud.obtenerUsuario()?.tipoUsuario === TipoUsuario.ORGANIZADOR
      ? true
      : this.router.createUrlTree(['/auth/torneos']);
  }
}

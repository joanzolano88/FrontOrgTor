import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { TipoUsuario } from 'src/enums/TipoUsuario';
import { CrudService } from '../crud.service';

@Injectable({ providedIn: 'root' })
export class OrganizadorGuard implements CanActivate {
  constructor(private crud: CrudService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (!this.crud.verSesion()) {
      return this.router.createUrlTree(['/auth/login']);
    }

    const usuario = this.crud.obtenerUsuario();
    const usuarioActualId = this.crud.obtenerUsuarioActualId();

    if (!usuarioActualId || !usuario?.id) {
      return this.router.createUrlTree(['/auth/login']);
    }

    return usuario.tipoUsuario === TipoUsuario.ORGANIZADOR
      ? true
      : this.router.createUrlTree(['/auth/partidos']);
  }
}

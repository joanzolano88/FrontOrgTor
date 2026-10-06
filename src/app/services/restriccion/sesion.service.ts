import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CrudService } from '../crud.service';
import { TipoUsuario } from 'src/enums/TipoUsuario';

@Injectable({
  providedIn: 'root'
})
export class SesionService implements CanActivate {

  constructor(private crud: CrudService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    if (this.crud.verSesion()) {
      return true;
    }

    return this.router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  login() {
    this.router.navigateByUrl('/auth/login');
  }

  cerrarSesion() {
    this.crud.cerrarSesion();
    this.router.navigateByUrl('/auth/login');
  }

  validacionOrganizador(): boolean {
    if (!this.crud.verSesion()) {
      return false;
    }
    const usuario = this.crud.obtenerUsuario();
    return !!usuario?.id && usuario.tipoUsuario === TipoUsuario.ORGANIZADOR;
  }

  obtenerUsuarioAutenticadoId(): number | null {
    if (!this.crud.verSesion()) {
      return null;
    }
    return this.crud.obtenerUsuarioActualId();
  }
}

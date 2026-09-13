import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CrudService } from '../crud.service';
import { Usuario } from 'src/models/Usuario';
import { TipoUsuario } from 'src/enums/TipoUsuario';

@Injectable({
  providedIn: 'root'
})
export class SesionService implements CanActivate {

  constructor(private crud: CrudService, private router: Router) { }

  canActivate() {
    const sesion = this.crud.verSesion();
    if (sesion) {
      return true;
    }
    this.router.navigateByUrl('/auth/login');
    return false;
  }

  login() {
    this.router.navigateByUrl('/auth/login');
  }

  cerrarSesion() {
    this.crud.cerrarSesion();
    this.router.navigateByUrl('/auth/login');
  }
  validacionOrganizador() {
    const usuario = this.crud.obtenerUsuario();
    if (!usuario.id) {
      return false;
    }
    return usuario.tipoUsuario == TipoUsuario.ORGANIZADOR;
  }
}

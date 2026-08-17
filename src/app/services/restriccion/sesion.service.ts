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
    this.router.navigate(['login']);
    return false;
  }

  login() {
    this.router.navigate(['login']);
  }

  cerrarSesion() {
    sessionStorage.clear();
    this.router.navigate(['login']);
  }
  validacionOrganizador() {
    const usuario: Usuario = JSON.parse(sessionStorage.getItem("usuario")!);
    if (usuario == null) {
      return false;
    }
    return usuario.tipoUsuario == TipoUsuario.ORGANIZADOR;
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { Usuario } from 'src/models/Usuario';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  private url = environment.url;
  constructor(private http: HttpClient) {
    this.migrarSesionPersistida();
  }

  private migrarSesionPersistida() {
    for (const clave of ['usuario', 'token', 'tipo']) {
      if (!localStorage.getItem(clave)) {
        const valor = sessionStorage.getItem(clave);
        if (valor) {
          localStorage.setItem(clave, valor);
        }
      }
    }
  }
  crear(objeto: any, tipo: string) {
    const authData = {
      ...objeto
    };
    return this.http.post(this.url + tipo, authData);
  }
  actualizar(objeto: any, tipo: string) {
    const authData = {
      ...objeto
    };
    return this.http.put(`${ this.url }${ tipo }`, authData);
  }
  actualizarLista(objeto: any[], tipo: string) {
    return this.http.put(`${ this.url }${ tipo }`, objeto);
  }

  logear(objeto: any, tipo: string) {
    const authData = {
      ...objeto
    };
    return this.http.post(`${ this.url }${ tipo }`, authData);
  }

  actualizarArchivo(objeto: any, tipo: string, imagen: any) {
    const authData = {
      ...objeto
    };
    const formData = new FormData();
    formData.append('objeto', JSON.stringify(authData));
    formData.append('archivo', imagen);
    return this.http.put(this.url + tipo, formData);
  }

  crearArchivo(objeto: any, tipo: string, imagen: any) {
    const authData = {
      ...objeto
    };
    const formData = new FormData();
    formData.append('objeto', JSON.stringify(authData));
    formData.append('archivo', imagen);
    return this.http.post(this.url + tipo, formData);
  }

  crearUsuario(objeto: any, tipo: string, archivo1: any, archivo2: any) {
    const authData = {
      ...objeto
    };
    const formData = new FormData();
    formData.append('objeto', JSON.stringify(authData));
    formData.append('archivo1', archivo1);
    formData.append('archivo2', archivo2);
    
    return this.http.post(this.url + tipo, formData);
  }

  enviarSolicitudEquipo(equipo: any, escudo?: File) {
    const formData = new FormData();
    formData.append('objeto', JSON.stringify(equipo));
    if (escudo) {
      formData.append('archivo1', escudo);
    }
    return this.http.post(this.url + 'equipo/solicitud', formData);
  }

  obtenerEquiposDelegado(idUsuario: number) {
    return this.http.get<any[]>(`${this.url}equipo/delegado/${idUsuario}`);
  }

  rechazarSolicitudEquipo(idEquipo: number) {
    return this.http.delete(`${this.url}equipo/solicitud/${idEquipo}/rechazar`);
  }

  aceptarSolicitudEquipo(idEquipo: number) {
    return this.http.put<any>(`${this.url}equipo/solicitud/${idEquipo}/aceptar`, {});
  }

  obtenerSolicitudesTodas(idTorneo: string) {
    return this.http.get<any[]>(`${this.url}equipo/solicitudes/torneo/${idTorneo}/todas`);
  }

  obtenerPagosEquipo(idEquipo: number) {
    return this.http.get<any[]>(`${this.url}pago-inscripcion/equipo/${idEquipo}`);
  }

  registrarPagoEquipo(idEquipo: number, pago: any) {
    return this.http.post<any>(`${this.url}pago-inscripcion/equipo/${idEquipo}`, {
      ...pago,
      usuarioId: this.obtenerUsuario().id
    });
  }

  actualizarUsuario(objeto: any, tipo: string, archivo1: any, archivo2: any) {
    const authData = {
      ...objeto
    };
    const formData = new FormData();
    formData.append('objeto', JSON.stringify(authData));
    formData.append('archivo1', archivo1);
    formData.append('archivo2', archivo2);
    if (tipo === 'equipo') {
      const usuario = this.obtenerUsuario();
      if (usuario.id) {
        formData.append('usuarioId', String(usuario.id));
      }
    }
    return this.http.put(this.url + tipo, formData);
  }

  borrar( id: number, tipo: string, objeto?: any) {
    const authData = {
      ...objeto
    };
    return this.http.delete(`${ this.url }${ tipo }/${ id }`, authData);
  }
  borrarConUsuario(id: number, tipo: string, usuarioId: number) {
    return this.http.delete(`${this.url}${tipo}/${id}?usuarioId=${usuarioId}`);
  }
  obtenerParametro(parametro: any, tipo: string) {
      return this.http.get(`${ this.url }${ tipo }/${ parametro }`);
  }
  obtener(tipo: string) {
    return this.http.get<[]>(`${ this.url }${ tipo }`);
  }
  obtenerPaises() {
    return this.http.get<any[]>(`${this.url}pais`);
  }
  obtenerDepartamentosPorPais(paisId: number) {
    return this.http.get<any[]>(`${this.url}departamento/pais/${paisId}`);
  }
  obtenerCiudadesPorDepartamento(departamentoId: number) {
    return this.http.get<any[]>(`${this.url}ciudad/departamento/${departamentoId}`);
  }
  obtenerToken() {
    return localStorage.getItem('token');
  }
  obtenerUsuario(): Usuario {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : new Usuario();
  }
  obtenerTipo() {
    return localStorage.getItem('tipo');
  }
  verSesion() {
    const usuario = localStorage.getItem('usuario');
    return !(usuario === null);
  }
  cerrarSesion() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    localStorage.removeItem('tipo');
  }
}

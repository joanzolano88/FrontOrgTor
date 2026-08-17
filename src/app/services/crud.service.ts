import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { Usuario } from 'src/models/Usuario';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  private url = environment.url;
  constructor(private http: HttpClient) { }
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
  actualizarUsuario(objeto: any, tipo: string, archivo1: any, archivo2: any) {
    const authData = {
      ...objeto
    };
    const formData = new FormData();
    formData.append('objeto', JSON.stringify(authData));
    formData.append('archivo1', archivo1);
    formData.append('archivo2', archivo2);
    return this.http.put(this.url + tipo, formData);
  }

  borrar( id: number, tipo: string, objeto?: any) {
    const authData = {
      ...objeto
    };
    return this.http.delete(`${ this.url }${ tipo }/${ id }`, authData);
  }
  obtenerParametro(parametro: any, tipo: string) {
      return this.http.get(`${ this.url }${ tipo }/${ parametro }`);
  }
  obtener(tipo: string) {
    return this.http.get<[]>(`${ this.url }${ tipo }`);
  }
  obtenerToken() {
    return sessionStorage.getItem('token');
  }
  obtenerUsuario(): Usuario {
    return JSON.parse(sessionStorage.getItem('usuario')!);
  }
  obtenerTipo() {
    return sessionStorage.getItem('tipo');
  }
  verSesion() {
    const usuario = sessionStorage.getItem('usuario');
    return !(usuario === null);
  }
  cerrarSesion() {
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('tipo');
  }
}

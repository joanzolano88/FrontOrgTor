import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
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
    if (imagen) formData.append('archivo', imagen);
    return this.http.put(this.url + tipo, formData);
  }

  crearArchivo(objeto: any, tipo: string, imagen: any) {
    const authData = {
      ...objeto
    };
    const formData = new FormData();
    formData.append('objeto', JSON.stringify(authData));
    if (imagen) formData.append('archivo', imagen);
    return this.http.post(this.url + tipo, formData);
  }

  crearUsuario(objeto: any, tipo: string, archivo1: any, archivo2: any) {
    const authData = {
      ...objeto
    };
    const formData = new FormData();
    formData.append('objeto', JSON.stringify(authData));
    if (archivo1 instanceof Blob) {
      formData.append('archivo1', archivo1);
    }
    if (archivo2 instanceof Blob) {
      formData.append('archivo2', archivo2);
    }
    
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

  obtenerEquipoEnTorneo(idEquipo: number, idTorneo: number) {
    return this.http.get<any>(`${this.url}equipo/${idEquipo}/torneo/${idTorneo}`);
  }
  registrarseComoJugador(idEquipo: number, idTorneo: number, usuarioId: number) {
    return this.http.post<any>(`${this.url}equipo/torneo/${idTorneo}/jugador/${idEquipo}?usuarioId=${usuarioId}`, {});
  }

  obtenerTorneosEquipo(idEquipo: number) {
    return this.http.get<any[]>(`${this.url}equipo/${idEquipo}/torneos`);
  }

  agregarJugadorATorneo(idEquipo: number, idTorneo: number, idJugador: number, usuarioId: number) {
    return this.http.post<any>(`${this.url}equipo/${idEquipo}/torneo/${idTorneo}/jugadores/${idJugador}?usuarioId=${usuarioId}`, {});
  }

  eliminarJugadorDeTorneo(idEquipo: number, idTorneo: number, idJugador: number, usuarioId: number) {
    return this.http.delete(`${this.url}equipo/${idEquipo}/torneo/${idTorneo}/jugadores/${idJugador}?usuarioId=${usuarioId}`);
  }

  obtenerNotificacionesPendientes(idUsuario: number) {
    return this.http.get<any[]>(`${this.url}usuario/${idUsuario}/notificaciones/pendientes`);
  }

  obtenerNotificaciones(idUsuario: number) {
    return this.http.get<any[]>(`${this.url}usuario/${idUsuario}/notificaciones`);
  }

  obtenerNotificacionesPendientesCantidad(idUsuario: number) {
    return this.http.get<number>(`${this.url}usuario/${idUsuario}/notificaciones/no-leidas/count`);
  }

  marcarNotificacionLeida(idUsuario: number, idNotificacion: number) {
    return this.http.put(`${this.url}usuario/${idUsuario}/notificaciones/${idNotificacion}/leida`, {});
  }

  eliminarNotificacion(idUsuario: number, idNotificacion: number) {
    return this.http.delete(`${this.url}usuario/${idUsuario}/notificaciones/${idNotificacion}`);
  }

  solicitarUnirseEquipo(idEquipo: number, usuarioId: number) {
    return this.http.post(`${this.url}equipo/${idEquipo}/solicitud-jugador?usuarioId=${usuarioId}`, {});
  }

  buscarJugadorEquipo(idEquipo: number, identificacion: string, usuarioId: number) {
    return this.http.get<any>(`${this.url}equipo/${idEquipo}/jugadores/buscar?identificacion=${encodeURIComponent(identificacion)}&usuarioId=${usuarioId}`);
  }

  eliminarJugadorEquipo(idEquipo: number, idJugador: number, usuarioId: number) {
    return this.http.delete(`${this.url}equipo/${idEquipo}/jugadores/${idJugador}?usuarioId=${usuarioId}`);
  }

  obtenerSolicitudesJugadores(idEquipo: number, usuarioId: number) {
    return this.http.get<any[]>(`${this.url}equipo/${idEquipo}/solicitudes-jugador?usuarioId=${usuarioId}`);
  }

  aceptarSolicitudJugador(idSolicitud: number, usuarioId: number) {
    return this.http.put<any>(`${this.url}equipo/solicitudes-jugador/${idSolicitud}/aceptar?usuarioId=${usuarioId}`, {});
  }

  rechazarSolicitudJugador(idSolicitud: number, usuarioId: number) {
    return this.http.delete(`${this.url}equipo/solicitudes-jugador/${idSolicitud}/rechazar?usuarioId=${usuarioId}`);
  }

  invitarJugadorAEquipo(idEquipo: number, identificacion: string, usuarioId: number) {
    return this.http.post<any>(`${this.url}equipo/${idEquipo}/invitaciones-jugador?identificacion=${encodeURIComponent(identificacion)}&usuarioId=${usuarioId}`, {});
  }

  obtenerInvitacionesEquipoJugador(usuarioId: number) {
    return this.http.get<any[]>(`${this.url}equipo/invitaciones-jugador?usuarioId=${usuarioId}`);
  }

  responderInvitacionEquipo(idInvitacion: number, usuarioId: number, aceptar: boolean) {
    const accion = aceptar ? 'aceptar' : 'rechazar';
    return this.http.put<any>(`${this.url}equipo/invitaciones-jugador/${idInvitacion}/${accion}?usuarioId=${usuarioId}`, {});
  }

  obtenerParticipacionesTorneo(idTorneo: number) {
    return this.http.get<any[]>(`${this.url}equipo/torneo/${idTorneo}/participaciones`);
  }

  obtenerParticipacionesEquipo(idEquipo: number) {
    return this.http.get<any[]>(`${this.url}equipo/${idEquipo}/participaciones`);
  }

  obtenerSancionesTorneo(idTorneo: number) {
    return this.http.get<any[]>(`${this.url}partido/torneo/${idTorneo}/sanciones`);
  }

  obtenerSancionesPartido(idPartido: number) {
    return this.http.get<any[]>(`${this.url}partido/${idPartido}/sanciones`);
  }

  modificarSancionPartido(idPartido: number, idJugador: number, usuarioId: number, levantar: boolean) {
    const accion = levantar ? 'levantar' : 'restaurar';
    return this.http.put<any>(`${this.url}partido/${idPartido}/sanciones/${idJugador}/${accion}?usuarioId=${usuarioId}`, {});
  }

  cambiarEquipoJugador(idTorneo: number, idJugador: number, idEquipoNuevo: number, usuarioId: number) {
    return this.http.put<any>(`${this.url}equipo/torneo/${idTorneo}/jugador/${idJugador}/cambiar-equipo/${idEquipoNuevo}?usuarioId=${usuarioId}`, {});
  }

  sustituirJugador(idPartido: number, titularId: number, suplenteId: number, numeroUniforme: number, minuto: number, usuarioId: number) {
    return this.http.post(`${this.url}partido/${idPartido}/sustituciones?titularId=${titularId}&suplenteId=${suplenteId}&numeroUniforme=${numeroUniforme}&minuto=${minuto}&usuarioId=${usuarioId}`, {});
  }

  sustituirJugadorInscrito(idPartido: number, titularId: number, jugadorId: number, numeroUniforme: number, minuto: number, usuarioId: number) {
    return this.http.post(`${this.url}partido/${idPartido}/sustituciones/jugador-inscrito?titularId=${titularId}&jugadorId=${jugadorId}&numeroUniforme=${numeroUniforme}&minuto=${minuto}&usuarioId=${usuarioId}`, {});
  }

  obtenerPerfilJugador(idJugador: number, idTorneo?: number) {
    const torneoQuery = idTorneo ? `?torneoId=${idTorneo}` : '';
    return this.http.get<any>(`${this.url}jugador/${idJugador}/perfil${torneoQuery}`);
  }

  obtenerPerfilCompleto(idUsuario: number) {
    return this.http.get<any>(`${this.url}usuario/${idUsuario}/perfil`);
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

  obtenerPagosTorneo(idTorneo: number, usuarioId: number) {
    return this.http.get<any[]>(`${this.url}pagos/torneo/${idTorneo}?usuarioId=${usuarioId}`);
  }

  registrarPagoTorneo(idTorneo: number, pago: any, usuarioId: number) {
    return this.http.post<any>(`${this.url}pagos/torneo/${idTorneo}`, { ...pago, usuarioId });
  }

  actualizarUsuario(objeto: any, tipo: string, archivo1: any, archivo2: any) {
    const authData = {
      ...objeto
    };
    const formData = new FormData();
    formData.append('objeto', JSON.stringify(authData));
    if (archivo1 instanceof Blob) {
      formData.append('archivo1', archivo1);
    }
    if (archivo2 instanceof Blob) {
      formData.append('archivo2', archivo2);
    }
    if (tipo === 'equipo') {
      const usuario = this.obtenerUsuario();
      if (usuario.id) {
        formData.append('usuarioId', String(usuario.id));
      }
    }
    return this.http.put(this.url + tipo, formData);
  }

  actualizarPerfilEquipoTorneo(equipoId: number, delegadoId: number, escudo?: Blob) {
    const formData = new FormData();
    formData.append('delegadoId', String(delegadoId));
    if (escudo) {
      formData.append('archivo1', escudo);
    }
    return this.http.put<any>(`${this.url}equipo/${equipoId}/perfil-torneo`, formData);
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
  obtener<T = []>(tipo: string) {
    return this.http.get<T>(`${ this.url }${ tipo }`);
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
  obtenerTorneosPorCiudad(ciudadId: number) {
    return this.http.get<{ label: string; value: number }[]>(`${this.url}torneo/ciudad/${ciudadId}`);
  }
  obtenerAyudantesTorneo(torneoId: number, usuarioId: number) {
    return this.http.get<any[]>(`${this.url}torneo/${torneoId}/ayudantes?usuarioId=${usuarioId}`);
  }
  agregarAyudanteTorneo(torneoId: number, usuarioId: number, identificacion: string) {
    return this.http.post<any>(`${this.url}torneo/${torneoId}/ayudantes?usuarioId=${usuarioId}&identificacion=${encodeURIComponent(identificacion)}`, {});
  }
  eliminarAyudanteTorneo(torneoId: number, ayudanteUsuarioId: number, usuarioId: number) {
    return this.http.delete(`${this.url}torneo/${torneoId}/ayudantes/${ayudanteUsuarioId}?usuarioId=${usuarioId}`);
  }
  puedeGestionarPartido(partidoId: number, usuarioId: number) {
    return this.http.get<boolean>(`${this.url}partido/${partidoId}/puede-gestionar?usuarioId=${usuarioId}`);
  }
  obtenerToken() {
    return localStorage.getItem('token');
  }
  obtenerUsuario(): Usuario {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : new Usuario();
  }
  obtenerUsuarioActualId(): number | null {
    const usuario = this.obtenerUsuario();
    const id = Number(usuario?.id);
    return Number.isFinite(id) && id > 0 ? id : null;
  }
  validarUsuarioActual(usuarioId?: number | null): number | null {
    const usuarioActualId = this.obtenerUsuarioActualId();
    if (!usuarioActualId) {
      return null;
    }
    if (usuarioId === undefined || usuarioId === null) {
      return usuarioActualId;
    }
    return Number(usuarioId) === usuarioActualId ? usuarioActualId : null;
  }
  obtenerTipo() {
    return localStorage.getItem('tipo');
  }
  verSesion() {
    const usuario = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');
    return !!usuario && !!token;
  }
  cerrarSesion() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    localStorage.removeItem('tipo');
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('tipo');
  }
}

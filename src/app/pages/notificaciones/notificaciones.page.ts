import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud.service';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone: false
})
export class NotificacionesPage {
  notificaciones: any[] = [];
  cargando = true;
  error = '';
  procesandoId?: number;

  constructor(private crud: CrudService, private router: Router) {}

  ionViewWillEnter() {
    this.cargar();
  }

  cargar() {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId) {
      this.cargando = false;
      this.error = 'Inicia sesión para consultar tus notificaciones.';
      return;
    }
    this.cargando = true;
    this.crud.obtenerNotificaciones(usuarioId).subscribe({
      next: notificaciones => {
        this.notificaciones = notificaciones || [];
        this.cargando = false;
      },
      error: err => {
        this.error = err?.error?.message || 'No se pudieron cargar las notificaciones.';
        this.cargando = false;
      }
    });
  }

  esAccion(notificacion: any): boolean {
    return notificacion?.tipo === 'ACCION';
  }

  abrir(notificacion: any) {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId || !notificacion?.id || this.procesandoId === notificacion.id) return;
    this.procesandoId = notificacion.id;
    const ruta = notificacion.ruta || '/auth/usuario';
    if (this.esAccion(notificacion)) {
      if (notificacion.leida) {
        this.procesandoId = undefined;
        this.router.navigateByUrl(ruta);
        return;
      }
      this.crud.marcarNotificacionLeida(usuarioId, notificacion.id).subscribe({
        next: () => {
          notificacion.leida = true;
          this.procesandoId = undefined;
          this.router.navigateByUrl(ruta);
        },
        error: () => {
          this.procesandoId = undefined;
          this.router.navigateByUrl(ruta);
        }
      });
      return;
    }
    this.crud.eliminarNotificacion(usuarioId, notificacion.id).subscribe({
      next: () => {
        this.notificaciones = this.notificaciones.filter(item => item.id !== notificacion.id);
        this.procesandoId = undefined;
        this.router.navigateByUrl(ruta);
      },
      error: err => {
        this.procesandoId = undefined;
        this.error = err?.error?.message || 'No se pudo eliminar la notificación informativa.';
      }
    });
  }
}
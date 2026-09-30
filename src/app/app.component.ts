import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { CrudService } from './services/crud.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  private notificacionesSubscription?: Subscription;
  private notificandoIds = new Set<number>();
  private usuarioNotificacionesId?: number;

  constructor(private crud: CrudService, private toastController: ToastController, private router: Router) {}

  ngOnInit() {
    this.consultarNotificaciones();
    this.notificacionesSubscription = interval(20000).subscribe(() => this.consultarNotificaciones());
  }

  ngOnDestroy() {
    this.notificacionesSubscription?.unsubscribe();
  }

  private consultarNotificaciones() {
    const usuarioId = this.crud.obtenerUsuario().id;
    if (!usuarioId) return;
    if (this.usuarioNotificacionesId !== usuarioId) {
      this.usuarioNotificacionesId = usuarioId;
      this.notificandoIds.clear();
    }
    this.crud.obtenerNotificacionesPendientes(usuarioId).subscribe(notificaciones => {
      notificaciones.forEach(notificacion => {
        if (!notificacion.id || this.notificandoIds.has(notificacion.id)) return;
        this.notificandoIds.add(notificacion.id);
        this.toastController.create({
          header: notificacion.titulo,
          message: notificacion.mensaje,
          duration: 7000,
          position: 'top',
          buttons: [{ text: 'Abrir', handler: () => this.abrirNotificacion(notificacion, usuarioId) }]
        }).then(toast => toast.present());
      });
    });
  }

  private abrirNotificacion(notificacion: any, usuarioId: number) {
    const ruta = notificacion.ruta || '/auth/notificaciones';
    if (notificacion.tipo === 'ACCION') {
      this.crud.marcarNotificacionLeida(usuarioId, notificacion.id).subscribe({
        next: () => this.router.navigateByUrl(ruta),
        error: () => this.router.navigateByUrl(ruta)
      });
      return;
    }
    this.crud.eliminarNotificacion(usuarioId, notificacion.id).subscribe({
      next: () => this.router.navigateByUrl(ruta),
      error: () => this.router.navigateByUrl(ruta)
    });
  }
}

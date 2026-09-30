import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthPage } from './auth.page';
import { SesionService } from '../services/restriccion/sesion.service';

const routes: Routes = [
  {
    path: 'auth',
    component: AuthPage,
    children: [
      {
        path: 'partidos',
        loadChildren: () => import('../pages/inicio/inicio.module').then(m => m.InicioPageModule)
      },
      {
        path: 'invitacion/:token',
        loadChildren: () => import('../pages/invitacion-partido/invitacion-partido.module').then(m => m.InvitacionPartidoPageModule)
      },
      {
        path: 'torneos',
        loadChildren: () => import('../pages/organizador/torneos/torneos.module').then(m => m.TorneosPageModule)
      },
      {
        path: 'deportes',
        canActivate: [SesionService],
        loadChildren: () => import('../pages/deportes/deportes.module').then(m => m.DeportesPageModule)
      },
      {
        path: 'login',
        loadChildren: () => import('../pages/login/login.module').then(m => m.LoginPageModule)
      },
      {
        path: 'usuario',
        canActivate: [SesionService],
        loadChildren: () => import('../pages/tab3/tab3.module').then(m => m.Tab3PageModule)
      },
      {
        path: 'notificaciones',
        canActivate: [SesionService],
        loadChildren: () => import('../pages/notificaciones/notificaciones.module').then(m => m.NotificacionesPageModule)
      },
      {
        path: 'equipo-configurar',
        canActivate: [SesionService],
        loadChildren: () => import('../pages/equipo-configurar/equipo-configurar.module').then(m => m.EquipoConfigurarPageModule)
      },
      {
        path: 'equipo/:idEquipo',
        canActivate: [SesionService],
        loadChildren: () => import('../pages/ver-equipo/ver-equipo.module').then(m => m.VerEquipoPageModule)
      },
      {
        path: '',
        redirectTo: '/auth/partidos',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/auth/partidos',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthPageRoutingModule {}

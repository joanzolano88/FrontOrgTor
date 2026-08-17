import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthPage } from './auth.page';

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
        path: 'torneos',
        loadChildren: () => import('../pages/organizador/torneos/torneos.module').then(m => m.TorneosPageModule)
      },
      {
        path: 'login',
        loadChildren: () => import('../pages/login/login.module').then(m => m.LoginPageModule)
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

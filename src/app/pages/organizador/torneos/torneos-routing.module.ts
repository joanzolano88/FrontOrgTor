import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TorneosPage } from './torneos.page';
import { OrganizadorGuard } from 'src/app/services/restriccion/organizador.guard';

const routes: Routes = [
  {
    path: '',
    component: TorneosPage
  },
  {
    path: 'crear-torneo',
    canActivate: [OrganizadorGuard],
    loadChildren: () => import('../../crear-torneo/crear-torneo.module').then(m => m.CrearTorneoPageModule) 
  },
  {
    path: 'torneo/:idTorneo',
    loadChildren: () => import('./torneo/torneo.module').then( m => m.TorneoPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TorneosPageRoutingModule {}

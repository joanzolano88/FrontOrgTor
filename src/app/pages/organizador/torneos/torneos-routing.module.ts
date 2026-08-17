import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TorneosPage } from './torneos.page';

const routes: Routes = [
  {
    path: '',
    component: TorneosPage
  },
  {
    path: 'crear-torneo',
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

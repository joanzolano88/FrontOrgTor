import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab2Page } from './tab2.page';

const routes: Routes = [
  {
    path: '',
    component: Tab2Page,
  },
  {
    path: 'crear-torneo',
    loadChildren: () => import('../crear-torneo/crear-torneo.module').then(m => m.CrearTorneoPageModule) 
  },
  {
    path: 'torneos/:idTorneo',
    loadChildren: () => import('../organizador/torneos/torneos.module').then(m => m.TorneosPageModule) 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab2PageRoutingModule {}

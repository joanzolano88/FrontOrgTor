import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab1Page } from './tab1.page';

const routes: Routes = [
  {
    path: '',
    component: Tab1Page,
  },
  {
    path: 'lista-partidos',
    loadChildren: () => import('../lista-partidos/lista-partidos.module').then( m => m.ListaPartidosPageModule)
  },
  {
    path: 'partido/:idPartido',
    loadChildren: () => import('../partido/partido.module').then(m => m.PartidoPageModule) 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab1PageRoutingModule {}

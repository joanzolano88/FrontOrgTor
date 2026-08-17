import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaPartidosPage } from './lista-partidos.page';

const routes: Routes = [
  {
    path: '',
    component: ListaPartidosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaPartidosPageRoutingModule {}

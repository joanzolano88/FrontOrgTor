import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TablaEquiposPage } from './tabla-equipos.page';

const routes: Routes = [
  {
    path: '',
    component: TablaEquiposPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TablaEquiposPageRoutingModule {}

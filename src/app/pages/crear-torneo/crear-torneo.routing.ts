import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearTorneoPage } from './crear-torneo.page';

const routes: Routes = [
  {
    path: '',
    component: CrearTorneoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrearTorneoPageRoutingModule {}

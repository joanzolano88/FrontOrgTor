import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgregarPartidoPage } from './agregar-partido.page';

const routes: Routes = [
  {
    path: '',
    component: AgregarPartidoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgregarPartidoPageRoutingModule {}

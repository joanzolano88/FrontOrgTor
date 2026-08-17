import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DragDropModule} from '@angular/cdk/drag-drop';

import { CambiarFaseTorneoPage } from './cambiar-fase-torneo.page';

const routes: Routes = [
  {
    path: '',
    component: CambiarFaseTorneoPage
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    DragDropModule
  ],
  exports: [RouterModule],
})
export class CambiarFaseTorneoPageRoutingModule {}

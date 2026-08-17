import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CanchasPage } from './canchas.page';

const routes: Routes = [
  {
    path: '',
    component: CanchasPage
  },  {
    path: 'cancha',
    loadChildren: () => import('./cancha/cancha.module').then( m => m.CanchaPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CanchasPageRoutingModule {}

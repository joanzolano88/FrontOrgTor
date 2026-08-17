import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ParticipanteConfigurarPage } from './participante-configurar.page';

const routes: Routes = [
  {
    path: '',
    component: ParticipanteConfigurarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ParticipantesConfigurarPageRoutingModule {}

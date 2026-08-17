import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EquipoConfigurarPage } from './equipo-configurar.page';


const routes: Routes = [
  {
    path: '',
    component: EquipoConfigurarPage
  },
  {
    path: 'crear-delegado',
    loadChildren: () => import('../participantes-configurar/participante-configurar.module').then( m => m.ParticipantesConfigurarPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EquipoConfigurarPageRoutingModule {}

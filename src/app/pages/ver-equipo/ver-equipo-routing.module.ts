import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VerEquipoPage } from './ver-equipo.page';

const routes: Routes = [
  {
    path: 'participacion/:idEquipoDetalle/:idTorneoDetalle',
    loadChildren: () => import('../detalle-equipo-torneo/detalle-equipo-torneo.module').then(module => module.DetalleEquipoTorneoPageModule)
  },
  { path: '', component: VerEquipoPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VerEquipoPageRoutingModule {}

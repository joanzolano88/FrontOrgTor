import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetalleEquipoTorneoPage } from './detalle-equipo-torneo.page';

const routes: Routes = [{ path: '', component: DetalleEquipoTorneoPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DetalleEquipoTorneoPageRoutingModule {}
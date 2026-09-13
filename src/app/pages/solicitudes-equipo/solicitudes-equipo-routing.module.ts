import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SolicitudesEquipoPage } from './solicitudes-equipo.page';

const routes: Routes = [{ path: '', component: SolicitudesEquipoPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SolicitudesEquipoPageRoutingModule {}
